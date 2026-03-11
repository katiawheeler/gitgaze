import path from "path";
import type { Widgets } from "neo-blessed";
import { DashboardLayout, FocusablePane } from "./types";
import { GitClient } from "./git/client";
import { updateDetailPane } from "./ui/detail-pane";
import { showCommitPrompt } from "./ui/commit-prompt";
import { GitStatusData, CommitEntry, BranchEntry } from "./git/types";
import { colors } from "./ui/theme";

interface KeybindingContext {
  layout: DashboardLayout;
  gitClient: GitClient;
  repoPath: string;
  refresh: () => Promise<void>;
  getData: () => {
    status: GitStatusData | null;
    commits: CommitEntry[];
    branches: BranchEntry[];
  };
}

interface KeybindingHandle {
  refocus: () => void;
}

export function setupKeybindings(ctx: KeybindingContext): KeybindingHandle {
  const { layout, gitClient, refresh } = ctx;
  const { screen, statusPane, commitsPane, branchesPane, detailPane } = layout;

  const panes: FocusablePane[] = [branchesPane, statusPane, commitsPane, detailPane];
  let focusIndex = 0;

  // Request versioning — incremented on each detail pane load so stale
  // responses from slow git operations get discarded silently.
  let detailRequestId = 0;

  function focusPane(index: number): void {
    focusIndex = index;
    for (let i = 0; i < panes.length; i++) {
      (panes[i] as any).style.border.fg = i === focusIndex ? colors.borderFocus : colors.border;
    }
    panes[focusIndex].focus();
    screen.render();
  }

  // Tab — cycle focus
  screen.key(["tab"], () => {
    focusIndex = (focusIndex + 1) % panes.length;
    focusPane(focusIndex);
  });

  screen.key(["S-tab"], () => {
    focusIndex = (focusIndex - 1 + panes.length) % panes.length;
    focusPane(focusIndex);
  });

  // q / Ctrl-C — quit
  screen.key(["q", "C-c"], () => {
    screen.destroy();
    process.exit(0);
  });

  // r — refresh
  screen.key(["r"], async () => {
    detailPane.setContent("{bold}Refreshing...{/bold}");
    screen.render();
    await refresh();
  });

  // Enter on status pane — show file diff
  statusPane.on("select", async (_item: Widgets.BoxElement, index: number) => {
    const data = ctx.getData();
    if (!data.status) return;

    const allFiles = buildFileList(data.status);
    const entry = allFiles[index];
    if (!entry || !entry.path) {
      updateDetailPane(detailPane, "", "Detail");
      screen.render();
      return;
    }

    const requestId = ++detailRequestId;
    try {
      detailPane.setContent("{bold}Loading diff...{/bold}");
      screen.render();
      const diff = await gitClient.getFileDiff(entry.path, entry.staged);
      if (requestId !== detailRequestId) return;
      updateDetailPane(detailPane, diff || `No diff for ${entry.path}`, `Diff: ${entry.path}`);
    } catch {
      if (requestId !== detailRequestId) return;
      updateDetailPane(detailPane, `Could not load diff for ${entry.path}`, "Error");
    }
    screen.render();
  });

  // Enter on commits pane — show commit diff
  commitsPane.on("select", async (_item: Widgets.BoxElement, index: number) => {
    const data = ctx.getData();
    const commit = data.commits[index];
    if (!commit) return;

    const requestId = ++detailRequestId;
    try {
      detailPane.setContent("{bold}Loading commit...{/bold}");
      screen.render();
      const diff = await gitClient.getShowCommit(commit.hash);
      if (requestId !== detailRequestId) return;
      updateDetailPane(detailPane, diff, `Commit: ${commit.abbreviatedHash} ${commit.message}`);
    } catch {
      if (requestId !== detailRequestId) return;
      updateDetailPane(detailPane, `Could not load commit ${commit.abbreviatedHash}`, "Error");
    }
    screen.render();
  });

  // Enter on branches pane — show branch info
  branchesPane.on("select", async (_item: Widgets.BoxElement, index: number) => {
    const data = ctx.getData();
    const branch = data.branches[index];
    if (!branch) return;

    const requestId = ++detailRequestId;
    try {
      detailPane.setContent("{bold}Loading branch info...{/bold}");
      screen.render();
      const log = await gitClient.getLog(10);
      if (requestId !== detailRequestId) return;
      const info = [
        `Branch: ${branch.name}`,
        `Commit: ${branch.commit}`,
        branch.current ? "(current branch)" : "",
        "",
        "Recent commits:",
        ...log.map((c) => `  ${c.abbreviatedHash} ${c.message}`),
      ].join("\n");
      updateDetailPane(detailPane, info, `Branch: ${branch.name}`);
    } catch {
      if (requestId !== detailRequestId) return;
      updateDetailPane(detailPane, `Could not load info for ${branch.name}`, "Error");
    }
    screen.render();
  });

  // s — toggle stage/unstage for selected file in status pane
  screen.key(["s"], async () => {
    if (focusIndex !== 1) return;
    const data = ctx.getData();
    if (!data.status) return;

    const selected = (statusPane as unknown as { selected: number }).selected;
    const allFiles = buildFileList(data.status);
    const entry = allFiles[selected];
    if (!entry || !entry.path) return;

    try {
      if (entry.staged) {
        await gitClient.unstage(entry.path);
      } else {
        await gitClient.stage(entry.path);
      }
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Stage error: ${message}`, "Error");
      screen.render();
    }
  });

  // a — stage all files
  screen.key(["a"], async () => {
    try {
      await gitClient.stageAll();
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Stage all error: ${message}`, "Error");
      screen.render();
    }
  });

  // c — commit staged files
  screen.key(["c"], async () => {
    const data = ctx.getData();
    if (!data.status || data.status.staged.length === 0) {
      updateDetailPane(detailPane, "Nothing staged to commit", "Commit");
      screen.render();
      return;
    }

    const message = await showCommitPrompt(screen);
    if (!message) {
      screen.render();
      return;
    }

    try {
      const hash = await gitClient.commit(message);
      updateDetailPane(detailPane, `Committed: ${hash}\n\n${message}`, "Commit");
      await refresh();
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Commit error: ${errMessage}`, "Error");
      screen.render();
    }
  });

  // b — checkout selected branch
  screen.key(["b"], async () => {
    if (focusIndex !== 0) return;
    const data = ctx.getData();
    const selected = (branchesPane as unknown as { selected: number }).selected;
    const branch = data.branches[selected];
    if (!branch || branch.current) return;

    try {
      detailPane.setContent("{bold}Checking out branch...{/bold}");
      screen.render();
      await gitClient.checkout(branch.name);
      await refresh();
      updateDetailPane(detailPane, `Switched to branch: ${branch.name}`, `Branch: ${branch.name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Checkout error: ${message}`, "Error");
    }
    screen.render();
  });

  // e — edit selected file in $EDITOR (from status or detail pane)
  screen.key(["e"], async () => {
    if (focusIndex !== 1 && focusIndex !== 3) return;
    const data = ctx.getData();
    if (!data.status) return;

    const selected = (statusPane as unknown as { selected: number }).selected;
    const allFiles = buildFileList(data.status);
    const entry = allFiles[selected];
    if (!entry || !entry.path) return;

    const editor = process.env.EDITOR || "vi";
    const filePath = path.resolve(ctx.repoPath, entry.path);

    try {
      screen.exec(editor, [filePath], {}, (err: Error | null, success: boolean) => {
        if (err) {
          updateDetailPane(detailPane, `Editor error: ${err.message}`, "Error");
          screen.render();
          return;
        }
        refresh().then(() => {
          updateDetailPane(
            detailPane,
            `Edited: ${entry.path}`,
            `Edit: ${entry.path}`
          );
          screen.render();
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Could not open editor: ${message}`, "Error");
      screen.render();
    }
  });

  // p — push current branch
  screen.key(["p"], async () => {
    try {
      detailPane.setContent("{bold}Pushing...{/bold}");
      screen.render();
      const result = await gitClient.push();
      updateDetailPane(detailPane, result, "Push");
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Push error: ${message}`, "Error");
      screen.render();
    }
  });

  // P — pull current branch
  screen.key(["S-p"], async () => {
    try {
      detailPane.setContent("{bold}Pulling...{/bold}");
      screen.render();
      const result = await gitClient.pull();
      updateDetailPane(detailPane, result, "Pull");
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Pull error: ${message}`, "Error");
      screen.render();
    }
  });

  return {
    refocus: () => focusPane(focusIndex),
  };
}

interface FileListEntry {
  path: string;
  staged: boolean;
}

function buildFileList(status: GitStatusData): FileListEntry[] {
  const entries: FileListEntry[] = [];

  // Header: branch info
  if (status.current) {
    entries.push({ path: "", staged: false }); // branch line
    entries.push({ path: "", staged: false }); // blank line
  }

  // Staged header + files
  if (status.staged.length > 0) {
    entries.push({ path: "", staged: false }); // "Staged:" header
    for (const file of status.staged) {
      entries.push({ path: file.path, staged: true });
    }
    entries.push({ path: "", staged: false }); // blank
  }

  // Unstaged header + files
  if (status.unstaged.length > 0) {
    entries.push({ path: "", staged: false }); // "Unstaged:" header
    for (const file of status.unstaged) {
      entries.push({ path: file.path, staged: false });
    }
    entries.push({ path: "", staged: false }); // blank
  }

  // Untracked header + files
  if (status.untracked.length > 0) {
    entries.push({ path: "", staged: false }); // "Untracked:" header
    for (const file of status.untracked) {
      entries.push({ path: file, staged: false });
    }
    entries.push({ path: "", staged: false }); // blank
  }

  return entries;
}

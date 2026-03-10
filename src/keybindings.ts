import type { Widgets } from "neo-blessed";
import { DashboardLayout, FocusablePane } from "./types";
import { GitClient } from "./git/client";
import { updateDetailPane } from "./ui/detail-pane";
import { GitStatusData, CommitEntry, BranchEntry } from "./git/types";

interface KeybindingContext {
  layout: DashboardLayout;
  gitClient: GitClient;
  refresh: () => Promise<void>;
  getData: () => {
    status: GitStatusData | null;
    commits: CommitEntry[];
    branches: BranchEntry[];
  };
}

export function setupKeybindings(ctx: KeybindingContext): void {
  const { layout, gitClient, refresh } = ctx;
  const { screen, statusPane, commitsPane, branchesPane, detailPane } = layout;

  const panes: FocusablePane[] = [statusPane, commitsPane, branchesPane, detailPane];
  let focusIndex = 0;

  function focusPane(index: number): void {
    focusIndex = index;
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
    if (!entry) return;

    try {
      detailPane.setContent("{bold}Loading diff...{/bold}");
      screen.render();
      const diff = await gitClient.getFileDiff(entry.path, entry.staged);
      updateDetailPane(detailPane, diff || `No diff for ${entry.path}`, `Diff: ${entry.path}`);
    } catch {
      updateDetailPane(detailPane, `Could not load diff for ${entry.path}`, "Error");
    }
    screen.render();
  });

  // Enter on commits pane — show commit diff
  commitsPane.on("select", async (_item: Widgets.BoxElement, index: number) => {
    const data = ctx.getData();
    const commit = data.commits[index];
    if (!commit) return;

    try {
      detailPane.setContent("{bold}Loading commit...{/bold}");
      screen.render();
      const diff = await gitClient.getShowCommit(commit.hash);
      updateDetailPane(detailPane, diff, `Commit: ${commit.abbreviatedHash} ${commit.message}`);
    } catch {
      updateDetailPane(detailPane, `Could not load commit ${commit.abbreviatedHash}`, "Error");
    }
    screen.render();
  });

  // Enter on branches pane — show branch info
  branchesPane.on("select", async (_item: Widgets.BoxElement, index: number) => {
    const data = ctx.getData();
    const branch = data.branches[index];
    if (!branch) return;

    try {
      detailPane.setContent("{bold}Loading branch info...{/bold}");
      screen.render();
      const log = await gitClient.getLog(10);
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
      updateDetailPane(detailPane, `Could not load info for ${branch.name}`, "Error");
    }
    screen.render();
  });

  // Start with focus on status pane
  focusPane(0);
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

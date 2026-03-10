import { GitClient } from "./git/client";
import { GitStatusData, CommitEntry, BranchEntry } from "./git/types";
import { createLayout } from "./ui/layout";
import { updateStatusPane } from "./ui/status-pane";
import { updateCommitsPane } from "./ui/commits-pane";
import { updateBranchesPane } from "./ui/branches-pane";
import { updateDetailPane } from "./ui/detail-pane";
import { setupKeybindings } from "./keybindings";

interface AppState {
  status: GitStatusData | null;
  commits: CommitEntry[];
  branches: BranchEntry[];
}

export async function runApp(repoPath: string): Promise<void> {
  const gitClient = new GitClient(repoPath);
  const layout = createLayout();
  const { screen, statusPane, commitsPane, branchesPane, detailPane } = layout;

  const state: AppState = {
    status: null,
    commits: [],
    branches: [],
  };

  async function fetchAll(): Promise<void> {
    try {
      const [status, commits, branches] = await Promise.all([
        gitClient.getStatus(),
        gitClient.getLog(),
        gitClient.getBranches(),
      ]);

      state.status = status;
      state.commits = commits;
      state.branches = branches;

      updateStatusPane(statusPane, status);
      updateCommitsPane(commitsPane, commits);
      updateBranchesPane(branchesPane, branches);

      screen.render();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      updateDetailPane(detailPane, `Error fetching data: ${message}`, "Error");
      screen.render();
    }
  }

  setupKeybindings({
    layout,
    gitClient,
    repoPath,
    refresh: fetchAll,
    getData: () => state,
  });

  // Initial data load
  await fetchAll();
  updateDetailPane(detailPane, "", "Detail");
  screen.render();
}

#!/usr/bin/env node

import path from "path";
import simpleGit from "simple-git";
import { runApp } from "./app";

const HELP_TEXT = `
👀 gitglance — TUI git repository dashboard

Usage:
  gitglance [path]       Launch dashboard for repo at path (default: cwd)
  gitglance --help       Show this help message

Keybindings:
  Tab / Shift-Tab     Cycle focus between panes
  j/k / Arrow keys    Navigate within pane
  Enter               Show diff/details for selected item
  s                   Toggle stage/unstage for selected file
  a                   Stage all files
  c                   Commit staged files
  e                   Edit selected file in $EDITOR
  r                   Refresh all data
  q / Ctrl-C          Quit
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const repoPath = args[0] ? path.resolve(args[0]) : process.cwd();

  const git = simpleGit(repoPath);
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    console.error(`Error: ${repoPath} is not a git repository.`);
    console.error("Run gitglance inside a git repo or pass a path: gitglance /path/to/repo");
    process.exit(1);
  }

  await runApp(repoPath);
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});

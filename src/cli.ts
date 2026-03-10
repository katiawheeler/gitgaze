#!/usr/bin/env node

import path from "path";
import simpleGit from "simple-git";
import { runApp } from "./app";

const HELP_TEXT = `
gitgud — TUI git repository dashboard

Usage:
  gitgud [path]       Launch dashboard for repo at path (default: cwd)
  gitgud --help       Show this help message

Keybindings:
  Tab / Shift-Tab     Cycle focus between panes
  j/k / Arrow keys    Navigate within pane
  Enter               Show diff/details for selected item
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
    console.error("Run gitgud inside a git repo or pass a path: gitgud /path/to/repo");
    process.exit(1);
  }

  await runApp(repoPath);
}

main().catch((err) => {
  console.error("Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});

import type { Widgets } from "neo-blessed";
import { CommitEntry } from "../git/types";
import { colors } from "./theme";

export function updateCommitsPane(
  pane: Widgets.ListElement,
  commits: CommitEntry[]
): void {
  if (commits.length === 0) {
    pane.setItems(["No commits yet"]);
    return;
  }

  const items = commits.map((commit) => {
    const date = formatRelativeDate(commit.date);
    const message = commit.message.length > 50
      ? commit.message.slice(0, 47) + "..."
      : commit.message;
    return `{${colors.hash}-fg}${commit.abbreviatedHash}{/${colors.hash}-fg} ${message} {${colors.author}-fg}${commit.author}{/${colors.author}-fg} {${colors.date}-fg}${date}{/${colors.date}-fg}`;
  });

  pane.setItems(items);
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
}

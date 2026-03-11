import type { Widgets } from "neo-blessed";
import { GitStatusData } from "../git/types";
import { colors, glyphs } from "./theme";

export function updateStatusPane(
  pane: Widgets.ListElement,
  status: GitStatusData
): void {
  const items: string[] = [];

  if (status.current) {
    const tracking = status.tracking ? `  {${colors.dim}-fg}${glyphs.arrowRight} ${status.tracking}{/${colors.dim}-fg}` : "";
    const sync = [];
    if (status.ahead > 0) sync.push(`{${colors.staged}-fg}${glyphs.arrowUp}${status.ahead}{/${colors.staged}-fg}`);
    if (status.behind > 0) sync.push(`{${colors.unstaged}-fg}${glyphs.arrowDown}${status.behind}{/${colors.unstaged}-fg}`);
    const syncStr = sync.length ? `  ${sync.join(" ")}` : "";

    items.push(`{bold}{${colors.currentBranch}-fg}${glyphs.branch} ${status.current}{/${colors.currentBranch}-fg}{/bold}${tracking}${syncStr}`);
    items.push("");
  }

  if (status.staged.length > 0) {
    items.push(`{${colors.staged}-fg}{bold}Staged Changes{/bold}{/${colors.staged}-fg}  {${colors.dim}-fg}${status.staged.length}{/${colors.dim}-fg}`);
    for (const file of status.staged) {
      items.push(`  {${colors.staged}-fg}${glyphs.staged}{/${colors.staged}-fg}  ${file.path}`);
    }
    items.push("");
  }

  if (status.unstaged.length > 0) {
    items.push(`{${colors.unstaged}-fg}{bold}Modified{/bold}{/${colors.unstaged}-fg}  {${colors.dim}-fg}${status.unstaged.length}{/${colors.dim}-fg}`);
    for (const file of status.unstaged) {
      items.push(`  {${colors.unstaged}-fg}${glyphs.modified}{/${colors.unstaged}-fg}  ${file.path}`);
    }
    items.push("");
  }

  if (status.untracked.length > 0) {
    items.push(`{${colors.untracked}-fg}{bold}Untracked{/bold}{/${colors.untracked}-fg}  {${colors.dim}-fg}${status.untracked.length}{/${colors.dim}-fg}`);
    for (const file of status.untracked) {
      items.push(`  {${colors.untracked}-fg}${glyphs.untracked}{/${colors.untracked}-fg}  ${file}`);
    }
    items.push("");
  }

  if (status.conflicted.length > 0) {
    items.push(`{${colors.conflicted}-fg}{bold}Conflicts{/bold}{/${colors.conflicted}-fg}  {${colors.dim}-fg}${status.conflicted.length}{/${colors.dim}-fg}`);
    for (const file of status.conflicted) {
      items.push(`  {${colors.conflicted}-fg}${glyphs.conflicted}{/${colors.conflicted}-fg}  ${file}`);
    }
    items.push("");
  }

  if (items.length === 0) {
    items.push(`{${colors.muted}-fg}Nothing to commit, working tree clean{/${colors.muted}-fg}`);
  }

  pane.setItems(items);
}

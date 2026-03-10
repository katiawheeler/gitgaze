import type { Widgets } from "neo-blessed";
import { GitStatusData } from "../git/types";
import { colors } from "./theme";

export function updateStatusPane(
  pane: Widgets.ListElement,
  status: GitStatusData
): void {
  const items: string[] = [];

  if (status.current) {
    const trackingInfo = status.tracking ? ` → ${status.tracking}` : "";
    const aheadBehind = [];
    if (status.ahead > 0) aheadBehind.push(`↑${status.ahead}`);
    if (status.behind > 0) aheadBehind.push(`↓${status.behind}`);
    const syncInfo = aheadBehind.length ? ` [${aheadBehind.join(" ")}]` : "";
    items.push(`{bold}On: ${status.current}${trackingInfo}${syncInfo}{/bold}`);
    items.push("");
  }

  if (status.staged.length > 0) {
    items.push(`{${colors.staged}-fg}{bold}Staged:{/bold}{/${colors.staged}-fg}`);
    for (const file of status.staged) {
      items.push(`  {${colors.staged}-fg}${file.index} ${file.path}{/${colors.staged}-fg}`);
    }
    items.push("");
  }

  if (status.unstaged.length > 0) {
    items.push(`{${colors.unstaged}-fg}{bold}Unstaged:{/bold}{/${colors.unstaged}-fg}`);
    for (const file of status.unstaged) {
      items.push(`  {${colors.unstaged}-fg}${file.workingDir} ${file.path}{/${colors.unstaged}-fg}`);
    }
    items.push("");
  }

  if (status.untracked.length > 0) {
    items.push(`{${colors.untracked}-fg}{bold}Untracked:{/bold}{/${colors.untracked}-fg}`);
    for (const file of status.untracked) {
      items.push(`  {${colors.untracked}-fg}? ${file}{/${colors.untracked}-fg}`);
    }
    items.push("");
  }

  if (status.conflicted.length > 0) {
    items.push(`{${colors.conflicted}-fg}{bold}Conflicted:{/bold}{/${colors.conflicted}-fg}`);
    for (const file of status.conflicted) {
      items.push(`  {${colors.conflicted}-fg}! ${file}{/${colors.conflicted}-fg}`);
    }
    items.push("");
  }

  if (items.length === 0) {
    items.push("{bold}Clean working tree{/bold}");
  }

  pane.setItems(items);
}

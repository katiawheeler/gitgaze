import type { Widgets } from "neo-blessed";
import { BranchEntry } from "../git/types";
import { colors, glyphs } from "./theme";

export function updateBranchesPane(
  pane: Widgets.ListElement,
  branches: BranchEntry[]
): void {
  if (branches.length === 0) {
    pane.setItems([`{${colors.muted}-fg}No branches{/${colors.muted}-fg}`]);
    return;
  }

  const items = branches.map((branch) => {
    const hash = branch.commit.slice(0, 7);

    if (branch.current) {
      return (
        `{${colors.currentBranch}-fg}{bold}${glyphs.branch} ${branch.name}{/bold}{/${colors.currentBranch}-fg}` +
        `  {${colors.hash}-fg}${hash}{/${colors.hash}-fg}`
      );
    }

    return (
      `{${colors.dim}-fg}${glyphs.branch}{/${colors.dim}-fg} ${branch.name}` +
      `  {${colors.dim}-fg}${hash}{/${colors.dim}-fg}`
    );
  });

  pane.setItems(items);
}

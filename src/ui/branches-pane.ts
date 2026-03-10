import type { Widgets } from "neo-blessed";
import { BranchEntry } from "../git/types";
import { colors } from "./theme";

export function updateBranchesPane(
  pane: Widgets.ListElement,
  branches: BranchEntry[]
): void {
  if (branches.length === 0) {
    pane.setItems(["No branches"]);
    return;
  }

  const items = branches.map((branch) => {
    const prefix = branch.current ? "* " : "  ";
    const color = branch.current ? colors.currentBranch : "white";
    const commitHash = branch.commit.slice(0, 7);
    return `{${color}-fg}${prefix}${branch.name}{/${color}-fg} {${colors.hash}-fg}${commitHash}{/${colors.hash}-fg}`;
  });

  pane.setItems(items);
}

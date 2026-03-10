import type { Widgets } from "neo-blessed";
import { colors } from "./theme";

export function updateDetailPane(
  pane: Widgets.BoxElement,
  content: string,
  title?: string
): void {
  if (title) {
    pane.setLabel(` ${title} `);
  }

  if (!content || content.trim() === "") {
    pane.setContent("{bold}No content to display{/bold}\n\nSelect an item and press Enter to view details.");
    return;
  }

  const colorized = colorizeDiff(content);
  pane.setContent(colorized);
  pane.scrollTo(0);
}

function colorizeDiff(diff: string): string {
  return diff
    .split("\n")
    .map((line) => {
      if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("---") || line.startsWith("+++")) {
        return `{${colors.diffHeader}-fg}${escapeTags(line)}{/${colors.diffHeader}-fg}`;
      }
      if (line.startsWith("@@")) {
        return `{${colors.diffHunk}-fg}${escapeTags(line)}{/${colors.diffHunk}-fg}`;
      }
      if (line.startsWith("+")) {
        return `{${colors.diffAdd}-fg}${escapeTags(line)}{/${colors.diffAdd}-fg}`;
      }
      if (line.startsWith("-")) {
        return `{${colors.diffRemove}-fg}${escapeTags(line)}{/${colors.diffRemove}-fg}`;
      }
      return escapeTags(line);
    })
    .join("\n");
}

function escapeTags(text: string): string {
  return text.replace(/\{/g, "{open}").replace(/\{open\}/g, "\\{");
}

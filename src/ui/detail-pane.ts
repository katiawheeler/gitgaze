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
    pane.setContent(
      `\n{${colors.muted}-fg}  Select an item and press Enter to view details.{/${colors.muted}-fg}`
    );
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
      const escaped = escapeTags(line);

      if (
        line.startsWith("diff --git") ||
        line.startsWith("index ") ||
        line.startsWith("---") ||
        line.startsWith("+++")
      ) {
        return `{${colors.diffHeader}-fg}${escaped}{/${colors.diffHeader}-fg}`;
      }

      if (line.startsWith("@@")) {
        return `{${colors.diffHunk}-fg}${escaped}{/${colors.diffHunk}-fg}`;
      }

      if (line.startsWith("+")) {
        return `{${colors.diffAdd}-fg}${escaped}{/${colors.diffAdd}-fg}`;
      }

      if (line.startsWith("-")) {
        return `{${colors.diffRemove}-fg}${escaped}{/${colors.diffRemove}-fg}`;
      }

      if (line.startsWith("commit ")) {
        return `{${colors.hash}-fg}{bold}${escaped}{/bold}{/${colors.hash}-fg}`;
      }
      if (line.startsWith("Author:")) {
        return `{${colors.author}-fg}${escaped}{/${colors.author}-fg}`;
      }
      if (line.startsWith("Date:")) {
        return `{${colors.date}-fg}${escaped}{/${colors.date}-fg}`;
      }

      return escaped;
    })
    .join("\n");
}

function escapeTags(text: string): string {
  return text.replace(/\{/g, "{open}").replace(/\{open\}/g, "\\{");
}

import blessed from "neo-blessed";
import type { Widgets } from "neo-blessed";
import { colors } from "./theme";

export function showCommitPrompt(screen: Widgets.Screen): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = blessed.textarea({
      parent: screen,
      top: "center",
      left: "center",
      width: "60%",
      height: "30%",
      label: " Commit Message (Enter to submit, Esc to cancel) ",
      tags: true,
      keys: true,
      inputOnFocus: true,
      border: { type: "line" },
      style: {
        border: { fg: colors.borderFocus },
        focus: { border: { fg: colors.borderFocus } },
      },
    });

    modal.focus();
    screen.render();

    modal.key(["escape"], () => {
      modal.destroy();
      screen.render();
      resolve(null);
    });

    modal.key(["enter"], () => {
      const message = modal.getValue().trim();
      modal.destroy();
      screen.render();
      if (message) {
        resolve(message);
      } else {
        resolve(null);
      }
    });
  });
}

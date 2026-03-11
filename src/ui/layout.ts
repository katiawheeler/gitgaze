import blessed from "neo-blessed";
import figlet from "figlet";
import type { Widgets } from "neo-blessed";
import { DashboardLayout } from "../types";
import { makePaneStyle, makeDetailPaneStyle, colors, bannerGradient } from "./theme";

const BANNER_HEIGHT = 9;

function generateBanner(): string {
  const raw = figlet.textSync("GITGAZE", { font: "ANSI Shadow" });
  const lines = raw.split("\n").filter((line) => line.trim() !== "");

  const colored = lines.map((line, i) => {
    const color = bannerGradient[i % bannerGradient.length];
    return `{${color}-fg}${line}{/${color}-fg}`;
  });

  return "\n🔭\n" + colored.join("\n");
}

export function createLayout(): DashboardLayout {
  const screen = blessed.screen({
    smartCSR: true,
    title: "gitgaze",
    fullUnicode: true,
  });

  blessed.box({
    parent: screen,
    top: 0,
    left: "center",
    width: "100%",
    height: BANNER_HEIGHT,
    tags: true,
    align: "center",
    content: generateBanner(),
  });

  const HELP_ITEMS = [
    { key: "enter", label: "view" },
    { key: "s", label: "stage" },
    { key: "a", label: "stage all" },
    { key: "c", label: "commit" },
    { key: "b", label: "checkout" },
    { key: "e", label: "$EDITOR" },
    { key: "p", label: "push" },
    { key: "P", label: "pull" },
    { key: "r", label: "refresh" },
    { key: "tab", label: "focus" },
    { key: "q", label: "quit" },
  ];

  function buildHelpContent(width: number): string {
    const rendered: string[] = [];
    let usedWidth = 0;
    for (const { key, label } of HELP_ITEMS) {
      const rawWidth = 2 + key.length + 1 + label.length;
      if (usedWidth + rawWidth > width) break;
      rendered.push(
        `  {${colors.borderFocus}-fg}${key}{/${colors.borderFocus}-fg} {245-fg}${label}{/245-fg}`
      );
      usedWidth += rawWidth;
    }
    return rendered.join("");
  }

  const helpBar = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1,
    tags: true,
    style: { fg: 243, bg: 234 } as any,
    content: buildHelpContent(screen.width as number),
  });

  screen.on("resize", () => {
    helpBar.setContent(buildHelpContent(screen.width as number));
  });

  const topPaneTop = BANNER_HEIGHT;
  const topPaneHeight = "33%-4";
  const bottomPaneTop = "33%+5";
  const bottomPaneHeight = "67%-5";

  const statusPane = blessed.list({
    parent: screen,
    label: " Status ",
    top: topPaneTop,
    left: "40%",
    width: "60%",
    height: topPaneHeight,
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    ...makePaneStyle(),
  });

  const commitsPane = blessed.list({
    parent: screen,
    label: " Commits ",
    top: bottomPaneTop,
    left: 0,
    width: "40%",
    height: bottomPaneHeight,
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    ...makePaneStyle(),
  });

  const branchesPane = blessed.list({
    parent: screen,
    label: " Branches ",
    top: topPaneTop,
    left: 0,
    width: "40%",
    height: topPaneHeight,
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    ...makePaneStyle(),
  });

  const detailPane = blessed.box({
    parent: screen,
    label: " Detail ",
    top: bottomPaneTop,
    left: "40%",
    width: "60%",
    height: bottomPaneHeight,
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    alwaysScroll: true,
    ...makeDetailPaneStyle(),
  });

  return { screen, statusPane, commitsPane, branchesPane, detailPane };
}

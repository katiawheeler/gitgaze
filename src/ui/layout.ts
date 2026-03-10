import blessed from "neo-blessed";
import type { Widgets } from "neo-blessed";
import { DashboardLayout } from "../types";
import { paneStyle } from "./theme";

export function createLayout(): DashboardLayout {
  const screen = blessed.screen({
    smartCSR: true,
    title: "gitgud — git dashboard",
    fullUnicode: true,
  });

  const statusPane = blessed.list({
    parent: screen,
    label: " Status ",
    top: 0,
    left: 0,
    width: "40%",
    height: "50%",
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    ...paneStyle,
  });

  const commitsPane = blessed.list({
    parent: screen,
    label: " Commits ",
    top: 0,
    left: "40%",
    width: "60%",
    height: "50%",
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    ...paneStyle,
  });

  const branchesPane = blessed.list({
    parent: screen,
    label: " Branches ",
    top: "50%",
    left: 0,
    width: "40%",
    height: "50%",
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    ...paneStyle,
  });

  const detailPane = blessed.box({
    parent: screen,
    label: " Detail ",
    top: "50%",
    left: "40%",
    width: "60%",
    height: "50%",
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: paneStyle.scrollbar,
    border: paneStyle.border,
    style: {
      border: paneStyle.style.border,
      focus: paneStyle.style.focus,
    },
  });

  return { screen, statusPane, commitsPane, branchesPane, detailPane };
}

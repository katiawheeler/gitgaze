// ─────────────────────────────────────────────────
// gitgaze — Teal → Green → Yellow gradient theme
// #2A7B9B → #57C785 → #FCE303
// ─────────────────────────────────────────────────

// Gradient mapped to 256-color palette:
// 67 (#3366CC teal) → 73 (#33CCCC) → 79 (#33CC99)
// → 115 (#66CC99 green) → 150 (#99CC66) → 185 (#CCCC33) → 220 (#FFCC00 yellow)
export const bannerGradient = [67, 73, 79, 115, 150, 185, 220];

export const colors = {
  // Chrome — teal unfocused, pink focused
  border: 73,
  borderFocus: 205,
  title: 255,
  muted: 245,
  dim: 240,
  subtle: 238,

  // Git status — mapped to gradient palette
  staged: 115,
  unstaged: 168,
  untracked: 139,
  conflicted: 196,
  currentBranch: 115,

  // Content metadata
  hash: 220,
  author: 79,
  date: 242,

  // Diffs
  diffAdd: 115,
  diffRemove: 168,
  diffHeader: 67,
  diffHunk: 150,

  // Selection
  selected: "white",
  selectedBg: 236,
} as const;

export const glyphs = {
  branch: "",
  staged: "✓",
  modified: "~",
  untracked: "?",
  conflicted: "!",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowRight: "›",
  commit: "",
  dot: "·",
  separator: "─",
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function makePaneStyle() {
  return {
    border: { type: "line" as const },
    style: {
      border: { fg: colors.border },
      selected: { fg: colors.selected, bg: colors.selectedBg, bold: true },
      item: { fg: 250 },
      label: { fg: colors.muted },
    } as any,
    scrollbar: {
      ch: " ",
      track: { bg: 233 },
      style: { bg: 240 },
    } as any,
    padding: { left: 1 },
  };
}

export function makeDetailPaneStyle() {
  return {
    border: { type: "line" as const },
    scrollbar: {
      ch: " ",
      track: { bg: 233 },
      style: { bg: 240 },
    } as any,
    style: {
      bg: "default",
      border: { fg: colors.border },
      label: { fg: colors.muted },
    } as any,
    padding: { left: 1, right: 1 },
  };
}

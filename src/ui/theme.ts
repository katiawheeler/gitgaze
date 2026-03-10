export const colors = {
  border: "blue",
  borderFocus: "cyan",
  title: "white",
  staged: "green",
  unstaged: "red",
  untracked: "magenta",
  conflicted: "red",
  currentBranch: "green",
  hash: "yellow",
  author: "cyan",
  date: "blue",
  diffAdd: "green",
  diffRemove: "red",
  diffHeader: "cyan",
  diffHunk: "magenta",
  selected: "white",
  selectedBg: "blue",
} as const;

export const paneStyle = {
  border: { type: "line" as const },
  style: {
    border: { fg: colors.border },
    focus: { border: { fg: colors.borderFocus } },
    selected: { fg: colors.selected, bg: colors.selectedBg, bold: true },
    item: { fg: "white" },
  },
  scrollbar: {
    ch: " ",
    track: { bg: "gray" },
    style: { bg: "cyan" },
  },
};

```
 ██████╗ ██╗████████╗ ██████╗ ██╗      █████╗ ███╗   ██╗ ██████╗███████╗
██╔════╝ ██║╚══██╔══╝██╔════╝ ██║     ██╔══██╗████╗  ██║██╔════╝██╔════╝
██║  ███╗██║   ██║   ██║  ███╗██║     ███████║██╔██╗ ██║██║     █████╗
██║   ██║██║   ██║   ██║   ██║██║     ██╔══██║██║╚██╗██║██║     ██╔══╝
╚██████╔╝██║   ██║   ╚██████╔╝███████╗██║  ██║██║ ╚████║╚██████╗███████╗
 ╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝
```

**A TUI git repository dashboard — get gud at seeing your repo.**

gitgaze is a terminal-based git dashboard that gives you a full overview of your repository at a glance. View status, commits, branches, and diffs in a four-pane layout without leaving your terminal.

---

## Features

- **Four-pane dashboard** — branches, status, commits, and a detail pane for diffs and commit info
- **Stage and unstage** individual files or stage everything at once
- **Commit** directly from the TUI with an inline prompt
- **Push and pull** without switching to another terminal
- **Checkout branches** from the branches pane
- **Open files** in your `$EDITOR` from the status or detail pane
- **Conflict detection** — conflicted files highlighted separately in the status pane
- **Ahead/behind indicators** — see how many commits you're ahead or behind the remote at a glance
- **Remote tracking** — current branch shows its upstream tracking branch
- **Teal-to-yellow gradient banner** 🔭 rendered with figlet on launch
- **Responsive help bar** — keybinding hints adapt to terminal width
- **Keyboard-driven** — no mouse required (but mouse scrolling works too)
- **Live refresh** — hit `r` to reload all panes instantly
- **Ghostty compatible** — works seamlessly in the Ghostty terminal

## Installation

```bash
# Install globally from npm
npm install -g gitgaze

# Or with yarn
yarn global add gitgaze
```

### Requirements

- Node.js 18+
- A terminal with 256-color support (most modern terminals)

### Development Setup

```bash
# Clone and build
git clone <repo-url>
cd gitgaze
npm install
npm run build

# Run directly
node dist/cli.js

# Or link globally for local development
npm link
```

## Usage

```bash
# Launch in the current directory
gitgaze

# Launch for a specific repo
gitgaze /path/to/repo

# Show help
gitgaze --help
```

## Layout

```
┌──────────────────────────────────────────────────────┐
│                    GITGAZE 🔭 banner                 │
├──────────────────────┬───────────────────────────────┤
│                      │                               │
│   Branches           │   Status                      │
│   (all local         │   (staged, modified,          │
│    branches)         │    untracked, conflicted)     │
│                      │                               │
├──────────────────────┼───────────────────────────────┤
│                      │                               │
│   Commits            │   Detail                      │
│   (recent commit     │   (file diffs, commit info,   │
│    log)              │    branch details, push/pull  │
│                      │    output, errors)            │
└──────────────────────┴───────────────────────────────┘
  enter view  s stage  a stage all  c commit  ...  q quit
```

## Keybindings

### Navigation

| Key              | Action                                  |
| ---------------- | --------------------------------------- |
| `Tab`            | Cycle focus to the next pane            |
| `Shift-Tab`      | Cycle focus to the previous pane        |
| `j` / `k`        | Navigate up/down within a pane (vi)     |
| `Arrow keys`     | Navigate up/down within a pane          |

### Actions

| Key              | Action                                  | Context           |
| ---------------- | --------------------------------------- | ----------------- |
| `Enter`          | Show diff or details for selected item  | Any pane          |
| `s`              | Toggle stage/unstage for selected file  | Status pane       |
| `a`              | Stage all files                         | Global            |
| `c`              | Commit staged files (opens prompt)      | Global            |
| `b`              | Checkout the selected branch            | Branches pane     |
| `e`              | Open selected file in `$EDITOR`         | Status / Detail pane |
| `p`              | Push current branch to remote           | Global            |
| `P` (Shift-P)    | Pull current branch from remote         | Global            |
| `r`              | Refresh all panes                       | Global            |
| `q` / `Ctrl-C`   | Quit                                    | Global            |

### Workflow Example

```
# Typical commit-and-push flow without leaving the TUI:
a        → stage all changes
c        → type commit message, press Enter
p        → push to remote
```

## Project Structure

```
src/
├── cli.ts                # Entry point, CLI arg parsing, --help
├── app.ts                # Main app loop, state management, data fetching
├── keybindings.ts        # All keyboard shortcut handlers
├── types.ts              # Shared TypeScript types (DashboardLayout, FocusablePane)
├── git/
│   ├── client.ts         # GitClient class wrapping simple-git
│   └── types.ts          # Git data interfaces (status, commits, branches)
└── ui/
    ├── layout.ts         # Screen and pane creation, help bar
    ├── theme.ts          # Colors, glyphs, gradient, pane styles
    ├── status-pane.ts    # Renders git status into the status list
    ├── commits-pane.ts   # Renders commit log into the commits list
    ├── branches-pane.ts  # Renders branches into the branches list
    ├── detail-pane.ts    # Updates the detail box with diffs/info
    └── commit-prompt.ts  # Inline commit message input
```

## Tech Stack

- **[neo-blessed](https://github.com/embark-framework/neo-blessed)** — Terminal UI rendering (boxes, lists, scrolling, focus management)
- **[simple-git](https://github.com/steveukx/git-js)** — Git operations (status, log, diff, stage, commit, push, pull)
- **[figlet](https://github.com/patorjk/figlet.js)** — ASCII art banner generation
- **TypeScript** — Type-safe codebase compiled with `tsc`

## Development

```bash
# Watch mode — recompiles on file changes
npm run dev

# One-off build
npm run build

# Run after building
npm start
```

## License

MIT © 2026 Katia Wheeler — see [LICENSE](./LICENSE) for details.

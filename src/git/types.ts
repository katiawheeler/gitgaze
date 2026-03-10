export interface FileEntry {
  path: string;
  index: string;
  workingDir: string;
}

export interface GitStatusData {
  staged: FileEntry[];
  unstaged: FileEntry[];
  untracked: string[];
  conflicted: string[];
  current: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
}

export interface CommitEntry {
  hash: string;
  abbreviatedHash: string;
  message: string;
  author: string;
  date: string;
}

export interface BranchEntry {
  name: string;
  current: boolean;
  commit: string;
  label: string;
}

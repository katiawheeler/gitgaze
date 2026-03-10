import simpleGit, { SimpleGit } from "simple-git";
import { GitStatusData, CommitEntry, BranchEntry, FileEntry } from "./types";

export class GitClient {
  private git: SimpleGit;

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  async validate(): Promise<boolean> {
    return this.git.checkIsRepo();
  }

  async getStatus(): Promise<GitStatusData> {
    const status = await this.git.status();

    const staged: FileEntry[] = status.staged.map((path) => {
      const file = status.files.find((f) => f.path === path);
      return {
        path,
        index: file?.index ?? " ",
        workingDir: file?.working_dir ?? " ",
      };
    });

    const unstaged: FileEntry[] = status.modified
      .filter((path) => !status.staged.includes(path))
      .map((path) => {
        const file = status.files.find((f) => f.path === path);
        return {
          path,
          index: file?.index ?? " ",
          workingDir: file?.working_dir ?? " ",
        };
      });

    return {
      staged,
      unstaged,
      untracked: status.not_added,
      conflicted: status.conflicted,
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
    };
  }

  async getLog(maxCount: number = 50): Promise<CommitEntry[]> {
    try {
      const log = await this.git.log({ maxCount });
      return log.all.map((entry) => ({
        hash: entry.hash,
        abbreviatedHash: entry.hash.slice(0, 7),
        message: entry.message,
        author: entry.author_name,
        date: entry.date,
      }));
    } catch {
      return [];
    }
  }

  async getBranches(): Promise<BranchEntry[]> {
    const branches = await this.git.branch(["-v"]);
    return branches.all.map((name) => {
      const branch = branches.branches[name];
      return {
        name,
        current: branch.current,
        commit: branch.commit,
        label: branch.label,
      };
    });
  }

  async getDiff(staged: boolean = false): Promise<string> {
    if (staged) {
      return this.git.diff(["--cached"]);
    }
    return this.git.diff();
  }

  async getFileDiff(filePath: string, staged: boolean = false): Promise<string> {
    const args = staged ? ["--cached", "--", filePath] : ["--", filePath];
    return this.git.diff(args);
  }

  async getCommitDiff(hash: string): Promise<string> {
    return this.git.diff([`${hash}~1`, hash]);
  }

  async getShowCommit(hash: string): Promise<string> {
    return this.git.show([hash, "--stat", "--patch"]);
  }

  async stage(filePath: string): Promise<void> {
    await this.git.add(filePath);
  }

  async unstage(filePath: string): Promise<void> {
    await this.git.reset(["HEAD", "--", filePath]);
  }

  async stageAll(): Promise<void> {
    await this.git.add("-A");
  }

  async commit(message: string): Promise<string> {
    const result = await this.git.commit(message);
    return result.commit;
  }
}

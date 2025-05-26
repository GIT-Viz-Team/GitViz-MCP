import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import { VIRTUAL_REPO } from './types';
import { VirtualRepoStateManager } from './VirtualRepoStateManager';

const exec = promisify(execCb);

/**`
 * 從實體 Git repository 中取得格式化後的 Git log（最多 30 筆），格式與 visualize_git_log 工具一致。
 * 若遇到錯誤（如未安裝 Git、不是 Git 專案），會顯示錯誤訊息並回傳 undefined。
 *
 * @param repoPath Git repository 的根目錄（如 /Users/me/myproject）
 * @returns 成功則回傳 Git log 字串；失敗則回傳 undefined
 */
export async function getRawGitLogFromRepo(
  repoPath: string
): Promise<string | undefined> {
  try {
    const { stdout } = await exec(
      'git log -n 30 --all --pretty=format:"%h (%an) (%ar) (%s) %d [%p]"',
      { cwd: repoPath }
    );
    return stdout;
  } catch (err: any) {
    if (err.message.includes('fatal: not a git repository')) {
      vscode.window.showErrorMessage(
        `Not a git repository: .git directory not found in ${repoPath}`
      );
    } else {
      vscode.window.showErrorMessage(err.stderr ?? 'Git error');
    }
    return;
  }
}

/**
 * 根據 repo 路徑決定要回傳哪種 Git log：
 * - 如果是虛擬 repo（VIRTUAL_REPO_PATH），則從 VirtualRepoStateManager 取得 before/after logs。
 * - 如果是實體 repo，則呼叫 getRawGitLogFromRepo 取得 before log，after 為空字串。
 *
 * @param repoPath 可以是實體路徑或 VIRTUAL_REPO_PATH
 * @returns 若成功取得，回傳 `{ before, after }`；若失敗（如非 git repo），回傳 null
 */
export async function resolveEffectiveGitLogs(
  repoPath: string
): Promise<{ before: string; after: string } | null> {
  if (repoPath === VIRTUAL_REPO.path) {
    return VirtualRepoStateManager.getInstance().getLogs();
  }

  const gitLog = await getRawGitLogFromRepo(repoPath);

  return {
    before: gitLog ?? '',
    after: '',
  };
}

/**
 * 執行 Git checkout 切換到指定提交版本：
 * - 若 repoPath 是有效 git repository，執行 `git checkout <hash>`
 * - 若路徑非 git repository，顯示錯誤訊息
 * - 其他 git 錯誤會捕捉並顯示對應訊息
 *
 * @param hash 要切換的 Git commit hash (例: a1b2c3d)
 * @param repoPath git repository 的實體路徑
 * @returns 成功時回傳 git 指令的 stdout 輸出，失敗時回傳 void
 */
export async function checkoutVersion(hash: string, repoPath: string) {
  try {
    const { stdout } = await exec(`git checkout ${hash}`, { cwd: repoPath });
    return stdout;
  } catch (err: any) {
    if (err.message.includes('fatal: not a git repository')) {
      vscode.window.showErrorMessage(
        `Not a git repository: .git directory not found in ${repoPath}`
      );
    } else {
      vscode.window.showErrorMessage(err.stderr ?? 'Git error');
    }
    return;
  }
}

/**
 * 解析 Git log 文字，確認格式正確並解析為 commit 結構。
 * @param logText Git log 文字
 * @returns commit 陣列
 * @throws 格式錯誤時，丟出錯誤
 */
export function parseGitLog(logText: string) {
  if (!logText || logText.trim() === '') {
    throw new Error('Empty git log input');
  }

  const lines = logText.trim().split('\n');
  const commits = [];

  const regex =
    /^([0-9a-f]+) \(([^)]+)\) \(([^)]+)\) \(([^)]+)\)(?:\s+\(([^)]*)\))?\s+\[([^\]]*)\]$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (!match) {
      throw new Error(`Invalid log format at line: ${line}`);
    }

    const [, hash, author, date, message, refs, parents] = match;

    const refsArray = refs
      ? refs.split(', ').filter((ref) => ref.trim() !== '')
      : [];

    const parentsArray = parents
      ? parents.split(' ').filter((parent) => parent.trim() !== '')
      : [];

    const commit = {
      hash,
      author,
      date,
      message,
      refs: refsArray,
      parents: parentsArray,
    };

    commits.push(commit);
  }

  if (commits.length === 0) {
    throw new Error('No valid commits found in the input');
  }

  return commits;
}

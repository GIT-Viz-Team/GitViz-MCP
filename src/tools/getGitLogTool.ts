import * as vscode from 'vscode';
import { getRawGitLogFromRepo } from '../git';
import { WorkspaceManager } from '../WorkspaceManager';
import * as path from 'path';

export async function getGitLog(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error('Missing input path.');
  }

  let absPath: string;

  // 如果 filePath 是絕對路徑，直接使用
  if (path.isAbsolute(filePath)) {
    absPath = filePath;
  } else {
    // 取當前有開啟的工作區資料夾 (workspace folder)
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder open to resolve relative path.');
    }

    // 假設用第一個工作區根路徑解析相對路徑
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    absPath = path.join(workspaceRoot, filePath);
  }

  const fileUri = vscode.Uri.file(absPath);
  const repo = WorkspaceManager.getInstance()
    .getGitAPI()
    .getRepository(fileUri);

  if (!repo || !repo.rootUri) {
    throw new Error('No git repository found for the given path.');
  }

  const log = await getRawGitLogFromRepo(repo.rootUri.fsPath);
  if (!log) {
    throw new Error('Failed to get git log.');
  }

  return log;
}

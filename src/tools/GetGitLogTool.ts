import * as vscode from 'vscode';
import { getRawGitLogFromRepo } from '../git';
import { WorkspaceManager } from '../WorkspaceManager';

export async function getGitLog(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error('Missing input path.');
  }

  const fileUri = vscode.Uri.file(filePath);
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

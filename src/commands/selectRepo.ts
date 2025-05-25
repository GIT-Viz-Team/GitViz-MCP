import * as vscode from 'vscode';
import { WorkspaceManager } from '../WorkspaceManager';

export async function registerSelectRepo() {
  const workspaceManager = WorkspaceManager.getInstance();

  const choices = workspaceManager.getAvailableRepos();
  const picked = await vscode.window.showQuickPick(choices, {
    placeHolder: '選擇 Git 存放庫',
  });
  if (picked) {
    workspaceManager.setSelectedRepo(picked.path);
  }
}

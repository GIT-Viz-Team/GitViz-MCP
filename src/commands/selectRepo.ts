import * as vscode from 'vscode';
import { WorkspaceManager } from '../WorkspaceManager';
import { WebviewController } from '../WebviewController';
import { AUTO_REPO } from '../types';

export async function registerSelectRepo() {
  const workspaceManager = WorkspaceManager.getInstance();
  const webviewController = WebviewController.getInstance();

  const choices = workspaceManager.getAvailableRepos();
  const picked = await vscode.window.showQuickPick(choices, {
    placeHolder: '選擇 Git 存放庫',
  });
  if (picked) {
    workspaceManager.setSelectedRepo(picked.path);

    webviewController.sendMessage({
      type: 'setCurrentRepo',
      payload: {
        currentRepoPath: workspaceManager.getIsAutoMode()
          ? AUTO_REPO.path
          : workspaceManager.getCurrentRepoPath(),
      },
    });
  }
}

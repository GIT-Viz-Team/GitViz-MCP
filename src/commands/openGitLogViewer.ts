import * as vscode from 'vscode';
import { WorkspaceManager } from '../WorkspaceManager';
import { WebviewController } from '../WebviewController';
import { resolveEffectiveGitLogs } from '../git';

export async function registerOpenGitLogViewer() {
  const workspaceManager = WorkspaceManager.getInstance();
  const webviewController = WebviewController.getInstance();

  try {
    if (webviewController.isVisible()) {
      webviewController.disposePanel(); // toggle off
      return;
    }

    await webviewController.createPanel();

    const repos = workspaceManager.getAvailableRepos();
    webviewController.sendMessage({
      type: 'getAvailableRepo',
      payload: {
        repos: repos.map((repo: any) => ({
          label: repo.label,
          description: repo.description,
          path: repo.path,
        })),
      },
    });

    const repoPath = workspaceManager.getCurrentRepoPath();

    const logs = await resolveEffectiveGitLogs(repoPath);
    if (!logs) {
      return;
    }

    WebviewController.getInstance().sendMessage({
      type: 'getGitLog',
      payload: {
        path: repoPath,
        beforeOperationLog: logs.before,
        afterOperationLog: logs.after,
      },
    });
  } catch (e: any) {
    vscode.window.showErrorMessage(e);
    return;
  }
}

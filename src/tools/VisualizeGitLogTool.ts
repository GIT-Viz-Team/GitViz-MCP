import { WebviewController } from '../WebviewController';
import { VirtualRepoStateManager } from '../VirtualRepoStateManager';
import { WorkspaceManager } from '../WorkspaceManager';
import { VIRTUAL_REPO_PATH } from '../constants';
import { parseGitLog } from '../git';

export async function visualizeGitLog(before: string, after: string) {
  // 格式檢查
  parseGitLog(before);
  parseGitLog(after);

  // 更新 webview 與狀態
  const workspaceManager = WorkspaceManager.getInstance();
  const webviewController = WebviewController.getInstance();

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

  VirtualRepoStateManager.getInstance().setLogs(before, after);

  if (!webviewController.isVisible()) {
    await webviewController.createPanel();
  }
  workspaceManager.setSelectedRepo(VIRTUAL_REPO_PATH);
}

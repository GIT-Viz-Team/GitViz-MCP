import * as vscode from 'vscode';
import { WebviewController } from '../WebviewController';
import { VirtualRepoStateManager } from '../VirtualRepoStateManager';
import { WorkspaceManager } from '../WorkspaceManager';
import { VIRTUAL_REPO_PATH } from '../common/constants';
import { parseGitLog } from '../git';

interface IVisualizesGitLog {
  beforeOperationLog: string;
  afterOperationLog: string;
}

export class VisualizeGitLogTool
  implements vscode.LanguageModelTool<IVisualizesGitLog>
{
  readonly name = 'visualize_git_log';

  constructor() {}

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IVisualizesGitLog>
  ) {
    try {
      parseGitLog(options.input.beforeOperationLog);
      parseGitLog(options.input.afterOperationLog);
    } catch (e: any) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `Git log format error:\n${e.message}\n\nExpected format:\n<hash> (<author>) (<date>) (<message>) (<optional refs>) [<parents>]Format details:\n- <hash>: a short Git commit hash (hexadecimal, e.g., abc123f)\n- <date>: relative time (e.g., "2 days ago")\n- <optional refs>: comma-separated references like "HEAD, main" (optional; can be omitted)\n- <parent hashes>: space-separated commit hashes, surrounded by square brackets (e.g., [abc123])`
        ),
      ]);
    }

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

    VirtualRepoStateManager.getInstance().setLogs(
      options.input.beforeOperationLog,
      options.input.afterOperationLog
    );

    if (!webviewController.isVisible()) {
      await webviewController.createPanel();
    }

    workspaceManager.setSelectedRepo(VIRTUAL_REPO_PATH);

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(`Visualized log in the Git Log Viewer.`),
    ]);
  }
}

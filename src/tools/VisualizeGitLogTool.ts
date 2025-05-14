import * as vscode from 'vscode';
import { WebviewController } from '../WebviewController';
import { VirtualRepoStateManager } from '../VirtualRepoStateManager';
import { WorkspaceManager } from '../WorkspaceManager';

interface IVisualizesGitLog {
  beforeOperationLog: string;
  afterOperationLog: string;
}

export class VisualizeGitLogTool
  implements vscode.LanguageModelTool<IVisualizesGitLog>
{
  readonly name = 'visualize_git_log';

  constructor() {}

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IVisualizesGitLog>
  ) {
    return {
      confirmationMessages: {
        title: 'Visualize Git Log Tree',
        message: new vscode.MarkdownString(
          `The following Git commit logs will be visualized as a tree:\n\n---\n\n` +
            `**Before Operation:**\n\n\`\`\`text\n${options.input.beforeOperationLog}\n\`\`\`\n\n` +
            `**After Operation:**\n\n\`\`\`text\n${options.input.afterOperationLog}\n\`\`\``
        ),
      },
      invocationMessage: 'Visualizing Git log in Git Log Viewer',
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IVisualizesGitLog>
  ) {
    await WebviewController.getInstance().createPanel();

    const repos = WorkspaceManager.getInstance().getAvailableRepos();
    WebviewController.getInstance().sendMessage({
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

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(`Visualized log in the Git Log Viewer.`),
    ]);
  }
}

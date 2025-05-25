import * as vscode from 'vscode';
import { WebviewController } from './WebviewController';
import { WorkspaceManager } from './WorkspaceManager';
import {
  GetGitLogTool,
  VisualizeGitLogTool,
  HighlightCommitTool,
} from './languageModelTools';
import { resolveEffectiveGitLogs, checkoutVersion } from './git';
import { VirtualRepoStateManager } from './VirtualRepoStateManager';
import { McpServerManager } from './server/McpServerManager';
import { registerGitVizToVsCode } from './commands/registerGitViz';
import { registerSelectRepo } from './commands/selectRepo';
import { registerOpenGitLogViewer } from './commands/openGitLogViewer';

export function activate(context: vscode.ExtensionContext) {
  VirtualRepoStateManager.init();
  WebviewController.init(context);
  WorkspaceManager.init();
  McpServerManager.init(context);

  const workspaceManager = WorkspaceManager.getInstance();
  const webviewController = WebviewController.getInstance();
  const mcpServerManager = McpServerManager.getInstance();

  workspaceManager.onRepoChanged(async (repoPath) => {
    if (!repoPath) {
      return;
    }

    // const shortName = vscode.workspace.asRelativePath(repoPath, false);
    // statusBar.text = `$(repo) Git: ${shortName}`;

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
  });

  workspaceManager.onRepoRegistered((repoPath) => {
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
  });

  webviewController.onDidReceiveMessage(async (message) => {
    if (message.type === 'switchRepo') {
      const path = message.payload.path;
      workspaceManager.setSelectedRepo(path);
    } else if (message.type === 'checkout') {
      const hash = message.payload.hash;
      const path = workspaceManager.getCurrentRepoPath();

      checkoutVersion(hash, path);
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gitVizMcp.registerCopilot',
      registerGitVizToVsCode
    ),
    vscode.commands.registerCommand('gitVizMcp.selectRepo', registerSelectRepo),
    vscode.commands.registerCommand(
      'gitVizMcp.openGitLogViewer',
      registerOpenGitLogViewer
    )
  );

  mcpServerManager.start();

  // 註冊 LLM 工具
  context.subscriptions.push(
    vscode.lm.registerTool('visualize_git_log', new VisualizeGitLogTool()),
    vscode.lm.registerTool('get_git_log', new GetGitLogTool()),
    vscode.lm.registerTool('highlight_commit', new HighlightCommitTool())
  );
}

export function deactivate() {}

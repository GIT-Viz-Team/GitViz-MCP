import * as vscode from 'vscode';
import { WebviewController } from './webview/WebviewController';
import { WorkspaceManager } from './WorkspaceManager';
import {
  GetGitLogTool,
  VisualizeGitLogTool,
  HighlightCommitTool,
  GetGitPromptTool,
} from './languageModel/languageModelTools';
import { resolveEffectiveGitLogs, checkoutVersion } from './git';
import { VirtualRepoStateManager } from './VirtualRepoStateManager';
import { McpServerManager } from './mcpServer/McpServerManager';
import {
  registerOpenGitLogViewer,
  registerGitVizToVsCode,
  registerSelectRepo,
} from './commands';
import { GitRepository, AUTO_REPO } from './types';

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
      type: 'updateAvailableRepos',
      payload: {
        repositories: repos.map((repo: GitRepository) => ({
          label: repo.label,
          description: repo.description,
          path: repo.path,
        })),
      },
    });

    webviewController.sendMessage({
      type: 'setCurrentRepo',
      payload: {
        currentRepoPath: workspaceManager.getIsAutoMode()
          ? AUTO_REPO.path
          : workspaceManager.getCurrentRepoPath(),
      },
    });
  });

  webviewController.onDidReceiveMessage(async (message) => {
    if (message.type === 'switchRepo') {
      const path = message.payload.path;

      workspaceManager.setSelectedRepo(path);
      webviewController.sendMessage({
        type: 'setCurrentRepo',
        payload: {
          currentRepoPath: workspaceManager.getIsAutoMode()
            ? AUTO_REPO.path
            : workspaceManager.getCurrentRepoPath(),
        },
      });
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
    ),
    vscode.commands.registerCommand('gitVizMcp.restartMcpServer', () =>
      mcpServerManager.restart()
    )
  );

  mcpServerManager.start();

  // 註冊 LLM 工具
  context.subscriptions.push(
    vscode.lm.registerTool('visualize_git_log', new VisualizeGitLogTool()),
    vscode.lm.registerTool('get_git_log', new GetGitLogTool()),
    vscode.lm.registerTool('highlight_commit', new HighlightCommitTool()),
    vscode.lm.registerTool('get_git_prompt', new GetGitPromptTool())
  );
}

export function deactivate() {}

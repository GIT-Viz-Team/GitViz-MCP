import * as vscode from "vscode";
import { resolveEffectiveGitLogs } from "../git";
import { WebviewController } from "../webviewController";
import { WorkspaceManager } from "../WorkspaceManager";
import { VIRTUAL_REPO_PATH } from '../common/constants'
import { VirtualRepoStateManager } from '../VirtualRepoStateManager'

export class OpenGitLogViewerTool implements vscode.LanguageModelTool<{}> {
    readonly name = 'open_git_log_viewer';
    webviewController = WebviewController.getInstance();
    workspaceManager = WorkspaceManager.getInstance();
    virtualRepoManager = VirtualRepoStateManager.getInstance();

    async invoke() {
        try {
            await this.webviewController.createPanel();

            const repos = this.workspaceManager.getAvailableRepos();
            this.webviewController.sendMessage({
                type: "getAvailableRepo",
                payload: {
                    repos: repos.map((repo: any) => ({
                        label: repo.label,
                        description: repo.description,
                        path: repo.path,
                    })),
                },
            });

            const repoPath = this.workspaceManager.getCurrentRepoPath();

            const logs = await resolveEffectiveGitLogs(repoPath);
            if (!logs) return;


            WebviewController.getInstance().sendMessage({
                type: "getGitLog",
                payload: {
                    path: repoPath,
                    log: logs.before,
                    afterLog: logs.after,
                },
            });

        } catch (e: any) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(e)
            ]);
        }
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart("Git Log Viewer has been opened.")
        ]);

    }
}
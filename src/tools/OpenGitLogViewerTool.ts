import * as vscode from "vscode";
import { getGitLogText } from "../git";
import { WebviewPanel } from "../webviewPanel";
import { WorkspaceManager } from "../WorkspaceManager";


export class OpenGitLogViewerTool implements vscode.LanguageModelTool<{}> {
    readonly name = 'open_git_log_viewer';

    async invoke() {
        try {
            const path = WorkspaceManager.getInstance().getCurrentRepoPath();
            const gitLog = await getGitLogText(path);
            if (gitLog) {
                WebviewPanel.getInstance().sendMessage({
                    type: 'getGitLog', "payload": {
                        "path": path,
                        "log": gitLog,
                        "afterLog": ""
                    }
                });
            }
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
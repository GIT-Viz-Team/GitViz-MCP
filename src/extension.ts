import * as vscode from "vscode";
import { WebviewPanel } from "./webviewPanel";
import * as path from "path";
import * as fs from "fs";
import { WorkspaceManager } from "./WorkspaceManager";
import { SelectRepoTool, ListReposTool } from "./tools/SelectRepoTool";
import { OpenGitLogViewerTool } from "./tools/OpenGitLogViewerTool";
import { VisualizeGitLogTool } from "./tools/VisualizeGitLogTool";
import { GetGitLogTool } from "./tools/GetGitLog";
import { getGitLogText } from "./git";

export async function ensureGitHubMcpServerRegistered() {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspacePath) {
        return;
    }
    const vscodeFolder = path.join(workspacePath, ".vscode");
    const mcpPath = path.join(vscodeFolder, "mcp.json");

    let currentConfig: any = {};
    if (fs.existsSync(mcpPath)) {
        try {
            const raw = fs.readFileSync(mcpPath, "utf8");
            currentConfig = JSON.parse(raw);
        } catch (e) {
            vscode.window.showErrorMessage(
                "無法解析 .vscode/mcp.json，請確認其內容是否正確 JSON 格式"
            );
            return;
        }

        if (currentConfig.servers?.github) {
            // 已有 github server，不覆蓋
            return;
        }
    }

    // 詢問是否加入 GitHub MCP server
    const userChoice = await vscode.window.showInformationMessage(
        "是否要加入 GitHub 官方 MCP Server？",
        "加入",
        "略過"
    );

    if (userChoice !== "加入") {
        return;
    }

    const githubServerConfig = {
        inputs: [
            {
                type: "promptString",
                id: "github_token",
                description: "GitHub Personal Access Token",
                password: true,
            },
        ],
        servers: {
            github: {
                command: "docker",
                args: [
                    "run",
                    "-i",
                    "--rm",
                    "-e",
                    "GITHUB_PERSONAL_ACCESS_TOKEN",
                    "ghcr.io/github/github-mcp-server",
                ],
                env: {
                    GITHUB_PERSONAL_ACCESS_TOKEN: "${input:github_token}",
                },
            },
        },
    };

    const updatedConfig = {
        inputs: currentConfig.inputs ?? [
            {
                type: "promptString",
                id: "github_token",
                description: "GitHub Personal Access Token",
                password: true,
            },
        ],
        servers: {
            ...currentConfig.servers,
            github: githubServerConfig,
        },
    };

    fs.mkdirSync(vscodeFolder, { recursive: true });
    fs.writeFileSync(mcpPath, JSON.stringify(updatedConfig, null, 2), "utf8");

    vscode.window.showInformationMessage(
        "GitHub MCP Server 將被加入設定中，請確保你已啟動 Docker 來運行 GitHub MCP Server。"
    );
}

export function activate(context: vscode.ExtensionContext) {
    // debug
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    statusBar.command = "gitgpt.selectRepo";
    statusBar.tooltip = "目前使用中的 Git 存放庫";
    statusBar.text = "$(repo) No Repo";
    statusBar.show();

    const onRepoChangeCallback = async (repoPath: string | null) => {
        if (!repoPath) {
            return;
        }

        if (WebviewPanel.isVisible()) {
            const gitLog = await getGitLogText(repoPath);
            if (gitLog) {
                WebviewPanel.getInstance().sendMessage({
                    type: "getGitLog",
                    payload: {
                        path: repoPath,
                        log: gitLog,
                        afterLog: "",
                    },
                });
            }
        }

        if (repoPath) {
            statusBar.text = `$(repo) ${path.basename(repoPath)}`;
        } else {
            statusBar.text = "$(repo) No Repo";
        }
        statusBar.show();
    };

    WebviewPanel.init(context);
    WorkspaceManager.init(onRepoChangeCallback);

    const workspaceManager = WorkspaceManager.getInstance();
    const webviewPanel = WebviewPanel.getInstance();

    webviewPanel.onDidReceiveMessage((message) => {
        if (message.type === "switchRepo") {
            const path = message.payload.path;
            workspaceManager.setSelectedRepo(path);
        } else if (message.type === "ready") {
            webviewPanel.notifyReady();
        }
    });

    const openGitLogViewer = vscode.commands.registerCommand(
        "gitgpt.openGitLogViewer",
        async () => {
            try {
                WebviewPanel.show();

                const webviewPanel = WebviewPanel.getInstance();
                await webviewPanel.ready();

                const repos = workspaceManager.getAvailableRepos();
                webviewPanel.sendMessage({
                    type: "getAvailableRepo",
                    payload: {
                        repos: repos.map((repo: any) => ({
                            label: repo.label,
                            description: repo.description,
                            path: repo.path,
                        })),
                    },
                });
                const path = workspaceManager.getCurrentRepoPath();
                const gitLog = await getGitLogText(path);
                if (gitLog) {
                    webviewPanel.sendMessage({
                        type: "getGitLog",
                        payload: {
                            path: path,
                            log: gitLog,
                            afterLog: "",
                        },
                    });
                }
            } catch (e: any) {
                vscode.window.showErrorMessage(e);
                return;
            }
        }
    );

    const selectRepo = vscode.commands.registerCommand(
        "gitgpt.selectRepo",
        async () => {
            const choices = workspaceManager.getAvailableRepos();
            const picked = await vscode.window.showQuickPick(choices, {
                placeHolder: "選擇 Git 存放庫",
            });
            if (picked) {
                workspaceManager.setSelectedRepo(picked.path);
            }
        }
    );

    context.subscriptions.push(openGitLogViewer, selectRepo);

    // 註冊 LLM 工具
    context.subscriptions.push(
        vscode.lm.registerTool("open_git_log_viewer", new OpenGitLogViewerTool()),
        vscode.lm.registerTool("show_git_log_message", new VisualizeGitLogTool()),
        vscode.lm.registerTool("select_repo", new SelectRepoTool()),
        vscode.lm.registerTool("list_repos", new ListReposTool()),
        vscode.lm.registerTool("get_git_log", new GetGitLogTool())
    );

    ensureGitHubMcpServerRegistered();
}

export function deactivate() { }

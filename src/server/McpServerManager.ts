import * as vscode from 'vscode';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from './mcpTools';
import { handleSseConnection, handleMessagePost } from './sseHandlers';
import { readConfig } from '../config';

/**
 * 單例管理 MCP Server 與 HTTP 服務。
 * 提供 start() 與 restart() 方法，並支援資源釋放。
 */
export class McpServerManager {
  // 靜態實例，用於保存 McpServerManager 的唯一實例（Singleton 模式）。
  private static _instance: McpServerManager | null = null;
  private static _context: vscode.ExtensionContext;

  private mcpServer?: McpServer;
  private httpServer?: any;
  private transports: Record<string, SSEServerTransport> = {};

  private workspaceWatcherDisposable?: vscode.Disposable;

  private constructor() {}

  /**
   * 初始化
   * @param context VSCode ExtensionContext，用來取得擴充套件的根目錄與資源存取。
   */
  public static init(context: vscode.ExtensionContext) {
    this._context = context;
    if (!this._instance) {
      this._instance = new McpServerManager();
    }
  }

  /**
   * 獲取 McpServerManager 的單一實例。
   * @returns McpServerManager 的單一實例。
   */
  public static getInstance(): McpServerManager {
    if (!this._instance) {
      throw new Error(
        'McpServerManager has not been initialized. Call McpServerManager.init() first.'
      );
    }
    return this._instance;
  }

  /**
   * 啟動 MCP Server 與 HTTP 服務。
   */
  public start(): void {
    const config = readConfig();
    const basePath = config.basePath;
    const port = config.port;

    // 初始化 MCP 伺服器
    this.mcpServer = new McpServer({
      name: 'Git Visualize Server',
      version: '1.0.0',
    });

    // 註冊工具
    registerTools(this.mcpServer);

    // 建立 Express HTTP 服務
    const app = express();
    app.use(cors());
    app.use(express.json());

    // SSE 端點
    app.get(`${basePath}/sse`, (req: Request, res: Response) => {
      handleSseConnection(req, res, this.transports, this.mcpServer!, basePath);
    });

    // 消息端點
    app.post(`${basePath}/message`, async (req, res) => {
      await handleMessagePost(req, res, this.transports);
    });

    // 健康檢查端點
    app.get(`${basePath}/health`, (_, res) => {
      res.json({
        status: 'ok',
        project: config.projectName,
        description: config.description,
        activeSessions: Object.keys(this.transports).length,
        timestamp: new Date().toISOString(),
      });
    });

    try {
      // 啟動 HTTP 服務
      this.httpServer = app.listen(port, () => {
        console.log(
          `MCP HTTP Server is running at http://localhost:${port}${basePath}`
        );
        vscode.window.showInformationMessage(
          `MCP HTTP Server started at http://localhost:${port}${basePath}`
        );
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(
        `Failed to start the MCP HTTP server on port ${port}. Error: ${errorMsg}`
      );
      throw new Error(
        `Failed to start the MCP HTTP server on port ${port}. Error: ${errorMsg}`
      );
    }

    // 註冊 Workspace 監控：若已存在，先 dispose 以避免重複註冊
    this.workspaceWatcherDisposable?.dispose();
    this.workspaceWatcherDisposable =
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        console.log(
          '[MCP Server] Workspace folder changed. Restarting MCP server...'
        );
        this.restart();
      });
    McpServerManager._context.subscriptions.push(
      this.workspaceWatcherDisposable
    );

    // 註冊 VS Code 停用時的清理邏輯
    McpServerManager._context.subscriptions.push({
      dispose: () => this.dispose(),
    });
  }

  /**
   * 重新啟動 MCP Server 與 HTTP 服務
   */
  public restart(): void {
    console.log('[MCP Server] Restarting...');
    this.dispose();
    this.start();
  }

  /**
   * 停止 HTTP 服務與釋放 MCP Server 資源
   */
  private dispose(): void {
    console.log('[HTTP Server] Shutting down HTTP server...');
    this.httpServer?.close(() => {
      console.log('[HTTP Server] HTTP server has been stopped.');
    });

    console.log('[MCP Server] Closing active SSE transports...');
    Object.values(this.transports).forEach((transport) => {
      transport
        .close()
        .catch((err) =>
          console.error('[SSE Transport] Error while closing:', err)
        );
    });
    this.transports = {};

    console.log('[MCP Server] Releasing MCP server resources.');
    this.mcpServer = undefined;
    this.httpServer = undefined;
  }
}

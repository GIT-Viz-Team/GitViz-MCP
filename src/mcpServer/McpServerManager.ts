import * as vscode from 'vscode';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from './mcpTools';
import { handleSseConnection, handleMessagePost } from './sseHandlers';
import { readConfig } from '../config';

/**
 * McpServerManager 負責管理 MCP Server 與 HTTP 服務的生命週期
 * 提供啟動、重啟與釋放資源等功能
 */
export class McpServerManager {
  private static instance: McpServerManager | null = null;
  private static context: vscode.ExtensionContext;

  private mcpServer?: McpServer;
  private httpServer?: any;
  private transports: Record<string, SSEServerTransport> = {};

  private workspaceWatcherDisposable?: vscode.Disposable;

  private constructor() {}

  /**
   * 初始化 Singleton 實例
   * @param context VSCode ExtensionContext
   */
  public static init(context: vscode.ExtensionContext) {
    this.context = context;
    if (!this.instance) {
      this.instance = new McpServerManager();
    }
  }

  /**
   * 取得 Singleton 實例，若尚未初始化會丟出錯誤
   */
  public static getInstance(): McpServerManager {
    if (!this.instance) {
      throw new Error(
        'McpServerManager has not been initialized. Call McpServerManager.init() first.'
      );
    }
    return this.instance;
  }

  /**
   * 啟動 MCP Server 與 HTTP 服務
   */
  public start(): void {
    const config = readConfig();
    const basePath = config.basePath;
    const port = config.port;

    // 初始化 MCP 伺服器
    this.mcpServer = new McpServer({
      name: 'GitViz MCP Server',
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

    // 監控 Workspace 變更，若有變更則自動重新啟動 MCP Server
    this.workspaceWatcherDisposable?.dispose();
    this.workspaceWatcherDisposable =
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        console.log(
          '[MCP Server] Workspace folder changed. Restarting MCP server...'
        );
        this.restart();
      });
    McpServerManager.context.subscriptions.push(
      this.workspaceWatcherDisposable
    );

    // 註冊 VS Code 停用時的清理邏輯
    McpServerManager.context.subscriptions.push({
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

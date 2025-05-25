import { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 建立 SSE (Server-Sent Events) 連線。
 * 此函式會：
 * - 設定 socket 以保持連線
 * - 建立 SSEServerTransport 以管理此連線
 * - 維護 Keep-Alive 訊息，避免中斷
 * - 將 transport 註冊到 transports 中，並與 MCP 伺服器建立連接
 * - 偵測連線關閉並做適當清理
 *
 * @param req Express Request 物件
 * @param res Express Response 物件（會被用作 SSE）
 * @param transports 保存所有活動中的 SSE 連線，使用 sessionId 作為索引
 * @param server MCP 伺服器實例，用於處理此連線的 MCP 訊息
 * @param basePath SSE 路徑的基礎路徑
 */
export function handleSseConnection(
  req: Request,
  res: Response,
  transports: Record<string, SSEServerTransport>,
  server: McpServer,
  basePath: string
) {
  // socket 層級設置：關閉 timeout / Nagle / 開啟 keep-alive
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  // 建立 SSEServerTransport
  const transport = new SSEServerTransport(`${basePath}/message`, res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  // 定時發送 keep-alive 訊息，防止連線斷開
  const keepAliveInterval = setInterval(() => {
    if (res.writable) {
      res.write(': keepalive\n\n');
    } else {
      clearInterval(keepAliveInterval);
    }
  }, 30000);

  // MCP 伺服器開始與此 transport 連接
  server.connect(transport).catch((err) => {
    console.error(`[MCP] Failed to connect SSE transport: ${err}`);
    res.status(500).end('Failed to setup SSE connection');
    clearInterval(keepAliveInterval);
    delete transports[sessionId];
    transport.close().catch(console.error);
  });

  // 客戶端關閉時：清除連線資源
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    delete transports[sessionId];
    transport.close().catch(console.error);
  });
}

/**
 * 處理來自客戶端的 JSON-RPC 消息請求。
 * 根據 sessionId 找到對應的 SSE 連線（SSEServerTransport），
 * 呼叫 handlePostMessage 進行處理並直接回應。
 *
 * @param req Express Request 物件，包含 JSON-RPC body 與 sessionId
 * @param res Express Response 物件，用來回傳 JSON-RPC 結果
 * @param transports 保存所有活動中的 SSE 連線，使用 sessionId 作為索引
 */
export async function handleMessagePost(
  req: Request,
  res: Response,
  transports: Record<string, SSEServerTransport>
) {
  const { sessionId } = req.query as { sessionId: string };
  const transport = transports[sessionId];
  if (!transport) {
    res.status(400).json({
      jsonrpc: '2.0',
      id: req.body?.id,
      error: {
        code: -32000,
        message: `No active session for ID: ${sessionId}`,
      },
    });
    return;
  }

  try {
    // 交由 transport 處理來自客戶端的 JSON-RPC 消息
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error(`[MCP] Error while handling postMessage:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id,
        error: { code: -32000, message: String(error) },
      });
    }
  }
}

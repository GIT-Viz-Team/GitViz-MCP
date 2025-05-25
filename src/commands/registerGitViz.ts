import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { readConfig } from '../config';

/** 寫入 .vscode/settings.json（Copilot / VS Code 工具會讀到這裡） */
export async function registerGitVizToVsCode() {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }

  const cfg = readConfig();
  const url = `http://localhost:${cfg.port}${cfg.basePath}/sse`;
  const file = path.join(ws.uri.fsPath, '.vscode', 'settings.json');

  let json: any = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : {};
  json.mcp ??= {};
  json.mcp.inputs ??= [];
  json.mcp.servers ??= {};
  json.mcp.servers.gitViz = { type: 'http', url };

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf8');

  vscode.window.showInformationMessage(`gitViz MCP (VS Code) → ${url}`);
}

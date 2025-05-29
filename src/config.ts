import * as vscode from 'vscode';

export interface GitVizConfig {
  projectName: string;
  description: string;
  basePath: string;
  port: number;
  maxGitLogEntries: number;
}

export const DEFAULT_CONFIG: GitVizConfig = {
  projectName: 'GitViz',
  description: 'An interactive Git log visualizer and animation tool',
  basePath: 'GitViz',
  port: 3000,
  maxGitLogEntries: 30,
};

export function normalizeBasePath(basePath?: string): string {
  if (!basePath) {
    return '';
  }

  return basePath.startsWith('/') ? basePath : `/${basePath}`;
}

/**
 * 從 VS Code 設定 (gitVizMcp.*) 讀取使用者自訂值。
 * 若使用者未設定，則回落到 DEFAULT_CONFIG。
 */
export function readConfig(): GitVizConfig {
  const cfg = vscode.workspace.getConfiguration('gitVizMcp');

  return {
    projectName: cfg.get<string>('projectName') ?? DEFAULT_CONFIG.projectName,
    description: cfg.get<string>('description') ?? DEFAULT_CONFIG.description,
    basePath: normalizeBasePath(
      cfg.get<string>('basePath') ?? DEFAULT_CONFIG.basePath
    ),
    port: cfg.get<number>('port') ?? DEFAULT_CONFIG.port,
    maxGitLogEntries:
      cfg.get<number>('maxGitLogEntries') ?? DEFAULT_CONFIG.maxGitLogEntries,
  };
}

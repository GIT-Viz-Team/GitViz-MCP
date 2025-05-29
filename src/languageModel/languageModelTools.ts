import * as vscode from 'vscode';
import {
  getGitLog,
  visualizeGitLog,
  highlightCommit,
  getGitPrompt,
} from '../tools';

interface IGetGitLog {
  path: string;
}

export class GetGitLogTool implements vscode.LanguageModelTool<IGetGitLog> {
  readonly name = 'get_git_log';

  async invoke(options: vscode.LanguageModelToolInvocationOptions<IGetGitLog>) {
    try {
      const log = await getGitLog(options.input.path);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(log),
      ]);
    } catch (e: any) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`Error: ${e.message}`),
      ]);
    }
  }
}

interface IVisualizesGitLog {
  beforeOperationLog: string;
  afterOperationLog: string;
}

export class VisualizeGitLogTool
  implements vscode.LanguageModelTool<IVisualizesGitLog>
{
  readonly name = 'visualize_git_log';

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IVisualizesGitLog>
  ) {
    try {
      await visualizeGitLog(
        options.input.beforeOperationLog,
        options.input.afterOperationLog
      );

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          'Visualized log in the Git Log Viewer.'
        ),
      ]);
    } catch (e: any) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `Git log format error:\n${e.message}\n\nExpected format:\n<hash> (<author>) (<date>) (<message>) (<optional refs>) [<parents>]Format details:\n- <hash>: a short Git commit hash (hexadecimal, e.g., abc123f)\n- <date>: relative time (e.g., "2 days ago")\n- <optional refs>: comma-separated references like "HEAD, main" (optional; can be omitted)\n- <parent hashes>: space-separated commit hashes, surrounded by square brackets (e.g., [abc123])`
        ),
      ]);
    }
  }
}

interface IHighlightCommit {
  hash: string;
}

export class HighlightCommitTool
  implements vscode.LanguageModelTool<IHighlightCommit>
{
  readonly name = 'highlight_commit';

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IHighlightCommit>
  ) {
    try {
      highlightCommit(options.input.hash);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `Commit ${options.input.hash} has been highlighted in the Git log tree.`
        ),
      ]);
    } catch (e: any) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`Error: ${e.message}`),
      ]);
    }
  }
}

// New tool for Git prompt
export class GetGitPromptTool implements vscode.LanguageModelTool<{}> {
  readonly name = 'get_git_prompt';

  async invoke(options: vscode.LanguageModelToolInvocationOptions<{}>) {
    try {
      const promptContent = await getGitPrompt();
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(promptContent),
      ]);
    } catch (e: any) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`Error: ${e.message}`),
      ]);
    }
  }
}

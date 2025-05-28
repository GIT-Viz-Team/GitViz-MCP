import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function getGitPrompt(): Promise<string> {
  try {
    // Look for the prompt file in the current directory
    const currentFilePath = __filename;
    const currentDir = path.dirname(currentFilePath);
    const promptPath = path.join(currentDir, 'git-gpt.prompt.md');
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Git prompt file not found at ${promptPath}`);
    }
    const promptContent = fs.readFileSync(promptPath, 'utf-8');
    return promptContent;
  } catch (error: any) {
    throw new Error(`Failed to load Git prompt: ${error.message}`);
  }
} 
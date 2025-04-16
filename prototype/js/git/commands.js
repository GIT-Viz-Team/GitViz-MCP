import { state } from '../core/state.js';
import { updateEditorAfterCommand } from '../ui/editor.js';
import { displayNextMessage } from '../ui/chat.js';

export function simulateCommandExecution(commandStep) {
  const terminal = document.getElementById('terminal');
  const terminalContent = terminal.querySelector('div');

  const command = state.commandQueue.find(cmd => cmd.step === commandStep).command;
  
  // Add command to terminal
  terminalContent.innerHTML += `<div class="text-green-500">$ ${command}</div>`;
  
  // Simulate command execution with appropriate output
  if (command.includes('git add')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">Changes staged for commit</div>
    `;
  } else if (command.includes('git commit')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">[main abc1234] Commit message</div>
      <div class="text-vscode-text">&nbsp;1 file changed, 1 insertion(+), 1 deletion(-)</div>
    `;
  } else if (command.includes('git reset')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">Unstaged changes after reset:</div>
      <div class="text-vscode-text">&nbsp;&nbsp;modified: &nbsp;&nbsp;src/main.py</div>
      <div class="text-red-400">&nbsp;&nbsp;new file: &nbsp;&nbsp;debug.log</div>
    `;
  } else if (command.includes('git checkout')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">Switched to branch 'main'</div>
    `;
  } else if (command.includes('git merge')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">Auto-merging auth.js</div>
      <div class="text-vscode-text">CONFLICT (content): Merge conflict in auth.js</div>
      <div class="text-vscode-text">Automatic merge failed; fix conflicts and then commit the result.</div>
    `;
  } else if (command.includes('git rebase')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">Successfully rebased and updated refs/heads/main.</div>
    `;
  } else if (command.includes('git rm --cached')) {
    terminalContent.innerHTML += `
      <div class="text-vscode-text">Deleted debug.log</div>
    `;
  }
  
  // Add prompt
  terminalContent.innerHTML += `<div class="text-green-500">$</div>`;
  
  // Update editor if needed
  updateEditorAfterCommand(commandStep);
  
  // Scroll to bottom
  terminal.scrollTop = terminal.scrollHeight;

  state.currentStep++;
  displayNextMessage();
}

export function formatCommand(command) {
  return `<div class="text-green-500">$ ${command}</div>`;
} 
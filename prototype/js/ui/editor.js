import { state } from '../core/state.js';
import { scenarios } from '../core/scenarios.js';

export function updateEditorView(scenarioId) {
  const scenario = scenarios[`scenario${scenarioId}`];
  const filePath = scenario.filePath || 'src/main.py';
  
  // Show/hide terminal or editor as needed
  const terminal = document.getElementById('terminal');
  const editor = document.getElementById('editor-container');

  if (scenarioId === 1) {
    // For commit mistake, we show the terminal with git status
    terminal.style.display = 'block';
    editor.style.display = 'none';

    terminal.querySelector('div').innerHTML = `
      <div class="text-green-500">$ git status</div>
      <div class="text-vscode-text">On branch main</div>
      <div class="text-vscode-text">Your branch is up to date with 'origin/main'.</div>
      <div class="text-vscode-text mt-1">Changes not staged for commit:</div>
      <div class="text-vscode-text">&nbsp;&nbsp;(use "git add &lt;file&gt;..." to update what will be committed)</div>
      <div class="text-vscode-text">&nbsp;&nbsp;(use "git restore &lt;file&gt;..." to discard changes in working directory)</div>
      <div class="text-vscode-text mt-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modified: &nbsp;&nbsp;src/main.py</div>
      <div class="text-red-400 mt-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;new file: &nbsp;&nbsp;debug.log</div>
      <div class="text-vscode-text mt-1">no changes added to commit (use "git add" and/or "git commit -a")</div>
      <div class="text-green-500">$ git add .</div>
      <div class="text-green-500">$ git commit -m "feat: update main.py"</div>
      <div class="text-vscode-text">[main abc1234] feat: update main.py</div>
      <div class="text-vscode-text">&nbsp;2 files changed, 100 insertions(+), 1 deletion(-)</div>
      <div class="text-vscode-text">&nbsp;create mode 100644 debug.log</div>
      <div class="text-green-500">$</div>
    `;
  } else if (scenarioId === 2) {
    // For merge conflict, we show the editor with conflict markers
    terminal.style.display = 'none';
    editor.style.display = 'block';
    
    // Display merge conflict content
    const fileContent = document.getElementById('file-content-view');
    const codeContent = fileContent.querySelector('.pl-12');
    
    codeContent.innerHTML = `
      <div>const auth = {</div>
      <div>&nbsp;&nbsp;login: function(username, password) {</div>
      <div class="conflict-marker">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</div>
      <div class="conflict-current">&nbsp;&nbsp;&nbsp;&nbsp;console.log('Login attempt for user:', username);</div>
      <div class="conflict-current">&nbsp;&nbsp;&nbsp;&nbsp;return db.authenticate(username, password);</div>
      <div class="conflict-marker">=======</div>
      <div class="conflict-incoming">&nbsp;&nbsp;&nbsp;&nbsp;console.log('User login attempt:', username);</div>
      <div class="conflict-incoming">&nbsp;&nbsp;&nbsp;&nbsp;// Add new security logging</div>
      <div class="conflict-incoming">&nbsp;&nbsp;&nbsp;&nbsp;security.log('login', { user: username });</div>
      <div class="conflict-incoming">&nbsp;&nbsp;&nbsp;&nbsp;return db.authenticate(username, password);</div>
      <div class="conflict-marker">&gt;&gt;&gt;&gt;&gt;&gt;&gt; main</div>
      <div>&nbsp;&nbsp;},</div>
      <div>&nbsp;&nbsp;logout: function(userId) {</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;return db.endSession(userId);</div>
      <div>&nbsp;&nbsp;}</div>
      <div>};</div>
      <div></div>
      <div>module.exports = auth;</div>
    `;
  } else if (scenarioId === 3) {
    // For tidy history, show the terminal with git log
    terminal.style.display = 'block';
    editor.style.display = 'none';
    
    // Display git log
    terminal.querySelector('div').innerHTML = `
      <div class="text-green-500">$ git log --oneline</div>
      <div class="text-vscode-text"><span class="git-hash">abc1234</span> Fix typo in login form</div>
      <div class="text-vscode-text"><span class="git-hash">def5678</span> Update login form style</div>
      <div class="text-vscode-text"><span class="git-hash">ghi9012</span> Fix login form alignment</div>
      <div class="text-vscode-text"><span class="git-hash">jkl3456</span> Add login functionality</div>
      <div class="text-vscode-text"><span class="git-hash">mno7890</span> Initial commit</div>
      <div class="text-green-500 mt-1">$</div>
    `;
  }
}

export function updateEditorAfterCommand(commandStep) {
  // Update editor if needed (for merge conflict resolution)
  const command = state.commandQueue.find(cmd => cmd.step === commandStep).command;
  if (command.includes('git add auth.js') && state.currentScenario === 2) {
    const codeContent = document.querySelector('#file-content-view .pl-12');
    if (codeContent) {
      codeContent.innerHTML = `
        <div>const auth = {</div>
        <div>&nbsp;&nbsp;login: function(username, password) {</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;console.log('User login attempt:', username);</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;// Add new security logging</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;security.log('login', { user: username });</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;return db.authenticate(username, password);</div>
        <div>&nbsp;&nbsp;},</div>
        <div>&nbsp;&nbsp;logout: function(userId) {</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;return db.endSession(userId);</div>
        <div>&nbsp;&nbsp;}</div>
        <div>};</div>
        <div></div>
        <div>module.exports = auth;</div>
      `;
    }
  }
} 
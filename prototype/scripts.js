// Global variables
let currentScenario = 1;
let currentStep = 0;
let commandQueue = [];
let executingCommand = false;
let isPlaying = false;
let playbackSpeed = 1;
let playbackTimer = null;
let scenarioTotalSteps = 0;
let autoAdvanceTimeout = null;

// Initialize the chat UI
document.addEventListener('DOMContentLoaded', function() {
  // Show demo description initially
  document.getElementById('demo-description').style.display = 'flex';
  document.getElementById('editor-container').style.display = 'none';
  document.getElementById('terminal').style.display = 'none';
  
  updatePlaybackControls();
});

// Switch between demo scenarios
function switchScenario(scenarioId) {
  // Cancel any existing playback
  stopPlayback();
  
  // Reset state
  currentScenario = scenarioId;
  currentStep = 0;
  commandQueue = [];
  executingCommand = false;
  
  // Clear chat container
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = '';
  
  // Update scenario selection UI
  const scenarioSelectors = document.querySelectorAll('.scenario-selector');
  scenarioSelectors.forEach(el => {
    el.classList.remove('active');
  });
  
  const selectedScenario = document.getElementById(`demo-scenario-${scenarioId}`);
  if (selectedScenario) {
    selectedScenario.classList.add('active');
  }
  
  // Update Git status info
  updateGitInfo(scenarioId);
  
  // Update editor view based on scenario
  updateEditorView(scenarioId);
  
  // Hide demo description (don't hide it - requirement #1)
  document.getElementById('demo-description').style.display = 'none';
  
  // Update timeline
  const scenario = scenarios[`scenario${scenarioId}`];
  scenarioTotalSteps = scenario.steps.length;
  
  // Update the timeline slider max value
  const timelineSlider = document.getElementById('timeline-slider');
  if (timelineSlider) {
    timelineSlider.max = scenarioTotalSteps;
    timelineSlider.value = 0;
  }
  
  // Update progress bar and step indicators
  updateStepDisplay(0, scenarioTotalSteps);
  
  // Start the selected scenario with first message
  setTimeout(() => {
    displayNextMessage();
  }, 500);
}

// Update Git info panel based on scenario
function updateGitInfo(scenarioId) {
  const gitInfo = scenarios[`scenario${scenarioId}`].gitInfo;
  document.getElementById('current-branch').textContent = gitInfo.branch;
  document.getElementById('last-commit').textContent = gitInfo.lastCommit;
  
  const statusText = document.getElementById('status-text');
  const statusIcon = document.getElementById('status-icon');
  
  if (gitInfo.status === 'clean') {
    statusText.textContent = 'Clean';
    statusIcon.innerHTML = '<span class="text-green-500">✓</span>';
  } else if (gitInfo.status === 'modified') {
    statusText.textContent = 'Modified';
    statusIcon.innerHTML = '<span class="text-yellow-500">!</span>';
  } else if (gitInfo.status === 'conflict') {
    statusText.textContent = 'Conflict';
    statusIcon.innerHTML = '<span class="text-red-500">✕</span>';
  }
}

// Update editor view based on scenario
function updateEditorView(scenarioId) {
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

// Display next message in the scenario
function displayNextMessage() {
  const scenario = scenarios[`scenario${currentScenario}`];
  if (currentStep >= scenario.steps.length) {
    stopPlayback();
    return;
  }
  
  // Clear any pending auto-advance timeouts
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = null;
  }
  
  const step = scenario.steps[currentStep];
  const chatContainer = document.getElementById('chat-container');
  
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  if (step.type === 'user') {
    // User message
    messageDiv.classList.add('user-message');
    messageDiv.textContent = step.content;
  } 
  else if (step.type === 'agent') {
    // Agent message - remove activity-icon as per requirement #4
    messageDiv.classList.add('system-message');
    messageDiv.innerHTML = `${step.content}`;
  } 
  else if (step.type === 'options') {
    // Options for user selection (auto-select the first option)
    messageDiv.classList.add('system-message');
    messageDiv.innerHTML = `
      ${step.content}
      <div class="option-buttons">
        ${step.options.map((option, index) => 
          `<button class="btn ${option.type || (index === 0 ? 'btn-primary' : 'btn-secondary')} ${index === 0 ? 'auto-selected' : ''}" 
           disabled>${option.label}</button>`
        ).join('')}
      </div>
    `;
    
    // Auto select the first option after a short delay (for scripted flow)
    setTimeout(() => {
      const firstOption = step.options[0];
      if (firstOption && firstOption.nextStep) {
        // Simulate option selection (not actual click handler)
        currentStep = firstOption.nextStep;
        displayNextMessage();
      } else {
        // If no nextStep, just proceed to the next step
        currentStep++;
        displayNextMessage();
      }
    }, 1500 / playbackSpeed);
  }
  else if (step.type === 'warning') {
    // Warning message
    messageDiv.classList.add('warning-message');
    messageDiv.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${step.content}`;
  }
  else if (step.type === 'command') {
    // Command with collapsible content
    messageDiv.classList.add('system-message');
    messageDiv.innerHTML = `
      ${step.explanation}
      <div class="command-block expanded">
        <div class="command-block-header" onclick="return false;">
          <div>${step.command}</div>
          <div><i class="fas fa-chevron-down"></i></div>
        </div>
        <div class="command-block-content" style="max-height: 500px;">
          <div class="command-explanation">${step.description || 'This command will be executed as shown.'}</div>
          <div class="command-preview">${formatCommand(step.command)}</div>
        </div>
      </div>
      <div class="option-buttons">
        <button class="btn btn-primary auto-selected" disabled>Execute</button>
        <button class="btn btn-secondary" disabled>Skip</button>
      </div>
    `;
    
    // Add to command queue
    commandQueue.push({
      step: currentStep,
      command: step.command,
      result: step.result || 'Command executed successfully.'
    });
    
    // Auto execute commands after a short delay (always execute in the demo)
    setTimeout(() => {
      // Execute the command without user interaction
      simulateCommandExecution(currentStep);
    }, 2000 / playbackSpeed);
  }
  
  // Add message to chat container
  chatContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Animate message appearance
  setTimeout(() => {
    messageDiv.classList.add('visible');
  }, 10);
  
  // Update timeline
  updateStepDisplay(currentStep + 1, scenarioTotalSteps);
  
  // Increment step for normal messages (not for options or commands which handle their own step increment)
  if (step.type !== 'options' && step.type !== 'command') {
    currentStep++;
  }
  
  // Move to next step if auto-advance is enabled and not a command or option
  if (step.type !== 'command' && step.type !== 'options' && step.autoAdvance && !executingCommand) {
    if (isPlaying) {
      const delay = 1500 / playbackSpeed;
      autoAdvanceTimeout = setTimeout(displayNextMessage, delay);
    }
  }
}

// Simulate command execution without user interaction
function simulateCommandExecution(stepIndex) {
  if (executingCommand) return;
  
  executingCommand = true;
  const command = commandQueue.find(cmd => cmd.step === stepIndex);
  if (!command) return;
  
  // Find the command block
  const commandBlocks = document.querySelectorAll('.command-block');
  let commandBlock = null;
  
  // Find the right command block that matches this step
  for (let i = 0; i < commandBlocks.length; i++) {
    const parent = commandBlocks[i].parentNode;
    if (parent && parent.classList.contains('system-message') && 
        parent.querySelector('.command-block-content') && 
        !parent.querySelector('.command-result')) {
      commandBlock = commandBlocks[i];
      break;
    }
  }
  
  if (!commandBlock) {
    // If we can't find the command block, increment step and continue
    executingCommand = false;
    currentStep++;
    displayNextMessage();
    return;
  }
  
  // Show loading state
  const buttonContainer = commandBlock.nextElementSibling;
  if (buttonContainer) {
    buttonContainer.innerHTML = '<div class="loading"><i class="fas fa-circle-notch fa-spin"></i> Executing...</div>';
  }
  
  // Simulate command execution with speed-adjusted timing
  const executionTime = 2000 / playbackSpeed;
  
  setTimeout(() => {
    // Create result element
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('command-result');
    resultDiv.innerHTML = command.result;
    
    // Add result to command block
    commandBlock.querySelector('.command-block-content').appendChild(resultDiv);
    
    // Update button container
    if (buttonContainer) {
      buttonContainer.innerHTML = '<button class="btn btn-primary" disabled>Continue</button>';
    }
    
    // Update terminal or editor based on command if needed
    updateUIAfterCommand(command.command);
    
    executingCommand = false;
    
    // Automatically continue after a brief delay
    setTimeout(() => {
      currentStep++;
      displayNextMessage();
    }, 1500 / playbackSpeed);
  }, executionTime);
}

// Update step display and progress bar
function updateStepDisplay(current, total) {
  // Update slider position
  const slider = document.getElementById('timeline-slider');
  if (slider) {
    slider.value = current;
  }
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const progressPercentage = (current / total) * 100;
    progressBar.style.width = `${progressPercentage}%`;
  }
  
  // Update step indicators
  const currentStepElem = document.getElementById('current-time');
  const totalStepElem = document.getElementById('total-time');
  
  if (currentStepElem) {
    currentStepElem.textContent = `Step ${current}`;
  }
  
  if (totalStepElem) {
    totalStepElem.textContent = `of ${total}`;
  }
}

// Format command output
function formatCommand(command) {
  return command
    .replace(/git /g, '<span class="git-hash">git</span> ')
    .replace(/(--\w+)/g, '<span class="code-keyword">$1</span>')
    .replace(/'([^']*)'/g, '<span class="code-string">\'$1\'</span>');
}

// Update UI after command execution
function updateUIAfterCommand(command) {
  // Update git info based on command
  if (command.includes('git commit --amend')) {
    document.getElementById('status-text').textContent = 'Clean';
    document.getElementById('git-status').innerHTML = '<span class="text-green-500">✓</span> Clean';
    document.getElementById('last-commit').textContent = 'def5678 (amended)';
  }
  else if (command.includes('git add')) {
    document.getElementById('status-text').textContent = 'Staged';
    document.getElementById('git-status').innerHTML = '<span class="text-blue-500">+</span> Staged';
  }
  else if (command.includes('git merge')) {
    document.getElementById('status-text').textContent = 'Conflict';
    document.getElementById('git-status').innerHTML = '<span class="text-red-500">✕</span> Conflict';
  }
  
  // Update terminal display if needed
  const terminal = document.getElementById('terminal');
  if (terminal.style.display !== 'none' && command.includes('git log')) {
    terminal.querySelector('div').innerHTML = `
      <div class="text-green-500">$ git log --oneline</div>
      <div class="text-vscode-text"><span class="git-hash">def5678</span> Update login form (amended)</div>
      <div class="text-vscode-text"><span class="git-hash">jkl3456</span> Add login functionality</div>
      <div class="text-vscode-text"><span class="git-hash">mno7890</span> Initial commit</div>
      <div class="text-green-500 mt-1">$</div>
    `;
  }
  
  // Update editor if needed (for merge conflict resolution)
  if (command.includes('git add auth.js') && currentScenario === 2) {
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

// Playback controls
function togglePlayback() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (currentStep >= scenarioTotalSteps) {
    // If at the end, restart from beginning
    currentStep = 0;
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    // Start from beginning
    displayNextMessage();
    isPlaying = true;
    updatePlaybackControls();
    return;
  }
  
  isPlaying = true;
  updatePlaybackControls();
  
  // Continue from current position
  if (!executingCommand) {
    displayNextMessage();
  }
}

function pausePlayback() {
  isPlaying = false;
  
  // Clear any pending timeouts
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = null;
  }
  
  updatePlaybackControls();
}

function stopPlayback() {
  isPlaying = false;
  
  // Clear any pending timeouts
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = null;
  }
  
  updatePlaybackControls();
}

function stepForward() {
  pausePlayback();
  
  // If we're not at the end, display next message
  if (currentStep < scenarioTotalSteps) {
    displayNextMessage();
  }
}

function stepBackward() {
  pausePlayback();
  
  // Can't go back if we're at the start
  if (currentStep <= 1) return;
  
  // Clear chat and start over
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = '';
  
  // Go back to previous step
  const targetStep = currentStep - 2; // -2 because we want the previous step and displayNextMessage will increment
  
  // Reset state
  commandQueue = [];
  executingCommand = false;
  currentStep = 0;
  
  // Replay up to the target step
  replayToStep(targetStep);
}

// Function to replay chat up to a specific step
function replayToStep(targetStep) {
  // Base case: we've reached the target step
  if (currentStep > targetStep) {
    return;
  }
  
  const scenario = scenarios[`scenario${currentScenario}`];
  const step = scenario.steps[currentStep];
  
  // Display the message
  displayNextMessage();
  
  // Continue replay after a short delay
  if (currentStep <= targetStep) {
    setTimeout(() => {
      replayToStep(targetStep);
    }, 10);
  }
}

function seekDemo(value) {
  // Pause playback
  pausePlayback();
  
  // Convert to integer
  const targetStep = parseInt(value);
  if (isNaN(targetStep)) return;
  
  // Don't do anything if we're already at that step
  if (targetStep === currentStep) return;
  
  // Can't seek backwards
  if (targetStep < currentStep) {
    // Start over and replay up to targetStep
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    commandQueue = [];
    executingCommand = false;
    currentStep = 0;
    
    // Replay up to the target step
    replayToStep(targetStep - 1);
  } 
  // Can't seek beyond the end
  else if (targetStep >= scenarioTotalSteps) {
    return;
  }
  // Seeking forward
  else {
    // Auto-advance to the target step
    const stepsToAdvance = targetStep - currentStep;
    for (let i = 0; i < stepsToAdvance; i++) {
      displayNextMessage();
    }
  }
}

function changePlaybackSpeed() {
  const speedSelect = document.getElementById('playback-speed');
  playbackSpeed = parseFloat(speedSelect.value);
}

function updatePlaybackControls() {
  const playButton = document.getElementById('play-button');
  
  if (isPlaying) {
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    playButton.classList.add('playing');
  } else {
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.classList.remove('playing');
  }
}

// Add active highlighting to the sidebar
document.addEventListener('click', function(e) {
  const item = e.target.closest('.scenario-item');
  if (item) {
    document.querySelectorAll('.scenario-item').forEach(i => {
      i.classList.remove('bg-vscode-active');
      i.classList.add('bg-vscode-bg');
    });
    item.classList.remove('bg-vscode-bg');
    item.classList.add('bg-vscode-active');
  }
}); 
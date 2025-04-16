import { state } from '../core/state.js';
import { formatCommand } from '../utils/formatter.js';
import { simulateCommandExecution } from '../git/commands.js';
import { scenarios } from '../core/scenarios.js';
import { stopPlayback } from './playback.js';

export function displayNextMessage() {
  const scenario = scenarios[`scenario${state.currentScenario}`];
  if (state.currentStep >= scenario.steps.length) {
    stopPlayback();
    return;
  }
  
  // Clear any pending auto-advance timeouts
  if (state.autoAdvanceTimeout) {
    clearTimeout(state.autoAdvanceTimeout);
    state.autoAdvanceTimeout = null;
  }
  
  const step = scenario.steps[state.currentStep];
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
    // Agent message
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
        state.currentStep = firstOption.nextStep;
        displayNextMessage();
      } else {
        // If no nextStep, just proceed to the next step
        state.currentStep++;
        displayNextMessage();
      }
    }, 1500 / state.playbackSpeed);
  }
  else if (step.type === 'warning') {
    // Warning message
    messageDiv.classList.add('warning-message');
    messageDiv.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${step.content}`;
  }
  else if (step.type === 'status') {
    // Status message
    messageDiv.classList.add('status-message');
    messageDiv.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${step.content}`;
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
    state.commandQueue.push({
      step: state.currentStep,
      command: step.command,
      result: step.result || 'Command executed successfully.'
    });
    
    // Auto execute commands after a short delay (always execute in the demo)
    setTimeout(() => {
      // Execute the command without user interaction
      simulateCommandExecution(state.currentStep);
    }, 2000 / state.playbackSpeed);
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
  updateStepDisplay(state.currentStep + 1, state.scenarioTotalSteps);
  
  // Increment step for normal messages (not for options or commands which handle their own step increment)
  if (step.type !== 'options' && step.type !== 'command') {
    state.currentStep++;
  }
  
  // Move to next step if auto-advance is enabled and not a command or option
  if (step.type !== 'command' && step.type !== 'options' && !state.executingCommand) {
    if (state.isPlaying) {
      const delay = 1500 / state.playbackSpeed;
      state.autoAdvanceTimeout = setTimeout(displayNextMessage, delay);
    }
  }
}

export function updateStepDisplay(current, total) {
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
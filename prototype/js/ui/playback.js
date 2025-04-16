import { state } from '../core/state.js';
import { displayNextMessage } from './chat.js';

export function togglePlayback() {
  if (state.isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

export function startPlayback() {
  if (state.currentStep >= state.scenarioTotalSteps) {
    // If at the end, restart from beginning
    state.currentStep = 0;
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    // Start from beginning
    displayNextMessage();
    state.isPlaying = true;
    updatePlaybackControls();
    return;
  }
  
  state.isPlaying = true;
  updatePlaybackControls();
  
  // Continue from current position
  if (!state.executingCommand) {
    displayNextMessage();
  }
}

export function pausePlayback() {
  state.isPlaying = false;
  
  // Clear any pending timeouts
  if (state.autoAdvanceTimeout) {
    clearTimeout(state.autoAdvanceTimeout);
    state.autoAdvanceTimeout = null;
  }
  
  updatePlaybackControls();
}

export function stopPlayback() {
  state.isPlaying = false;
  
  // Clear any pending timeouts
  if (state.autoAdvanceTimeout) {
    clearTimeout(state.autoAdvanceTimeout);
    state.autoAdvanceTimeout = null;
  }
  
  updatePlaybackControls();
}

export function stepForward() {
  pausePlayback();
  
  // If we're not at the end, display next message
  if (state.currentStep < state.scenarioTotalSteps) {
    displayNextMessage();
  }
}

export function stepBackward() {
  pausePlayback();
  
  // Can't go back if we're at the start
  if (state.currentStep <= 1) return;
  
  // Clear chat and start over
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = '';
  
  // Go back to previous step
  const targetStep = state.currentStep - 2; // -2 because we want the previous step and displayNextMessage will increment
  
  // Reset state
  state.commandQueue = [];
  state.executingCommand = false;
  state.currentStep = 0;
  
  // Replay up to the target step
  replayToStep(targetStep);
}

export function seekDemo(value) {
  // Pause playback
  pausePlayback();
  
  // Convert to integer
  const targetStep = parseInt(value);
  if (isNaN(targetStep)) return;
  
  // Don't do anything if we're already at that step
  if (targetStep === state.currentStep) return;
  
  // Can't seek backwards
  if (targetStep < state.currentStep) {
    // Start over and replay up to targetStep
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    state.commandQueue = [];
    state.executingCommand = false;
    state.currentStep = 0;
    
    // Replay up to the target step
    replayToStep(targetStep - 1);
  } 
  // Can't seek beyond the end
  else if (targetStep >= state.scenarioTotalSteps) {
    return;
  }
  // Seeking forward
  else {
    // Auto-advance to the target step
    const stepsToAdvance = targetStep - state.currentStep;
    for (let i = 0; i < stepsToAdvance; i++) {
      displayNextMessage();
    }
  }
}

export function changePlaybackSpeed() {
  const speedSelect = document.getElementById('playback-speed');
  state.playbackSpeed = parseFloat(speedSelect.value);
}

export function updatePlaybackControls() {
  const playButton = document.getElementById('play-button');
  
  if (state.isPlaying) {
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    playButton.classList.add('playing');
  } else {
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.classList.remove('playing');
  }
}

// Function to replay chat up to a specific step
function replayToStep(targetStep) {
  // Base case: we've reached the target step
  if (state.currentStep > targetStep) {
    return;
  }
  
  const scenario = scenarios[`scenario${state.currentScenario}`];
  const step = scenario.steps[state.currentStep];
  
  // Display the message
  displayNextMessage();
  
  // Continue replay after a short delay
  if (state.currentStep <= targetStep) {
    setTimeout(() => {
      replayToStep(targetStep);
    }, 10);
  }
} 
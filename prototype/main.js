import { state } from './js/core/state.js';
import { initializeUI, initializeSidebar } from './js/core/init.js';
import { pausePlayback, startPlayback, stepForward, stepBackward, seekDemo, changePlaybackSpeed } from './js/ui/playback.js';
import { displayNextMessage } from './js/ui/chat.js';
import { updateEditorView } from './js/ui/editor.js';
import { scenarios } from './js/core/scenarios.js';
import { updateGitInfo } from './js/ui/gitinfo.js';
import { updateStepDisplay } from './js/ui/step.js';

function switchScenario(scenarioId) {
  // Cancel any existing playback
  pausePlayback();

  // Reset state
  state.currentScenario = scenarioId;
  state.currentStep = 0;
  state.commandQueue = [];
  state.executingCommand = false;

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
  state.scenarioTotalSteps = scenario.steps.length;

  // Update the timeline slider max value
  const timelineSlider = document.getElementById('timeline-slider');
  if (timelineSlider) {
    timelineSlider.max = state.scenarioTotalSteps;
    timelineSlider.value = 0;
  }

  // Update progress bar and step indicators
  updateStepDisplay(0, state.scenarioTotalSteps);

  // Start the selected scenario with first message
  setTimeout(() => {
    displayNextMessage();
  }, 500);
}


// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  initializeSidebar();

  // Make scenarios available globally
  window.scenarios = scenarios;

  // Initialize playback controls
  document.getElementById('play-button').addEventListener('click', () => {
    if (state.isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  });

  // document.getElementById('stop').addEventListener('click', stopPlayback);
  document.getElementById('step-forward').addEventListener('click', stepForward);
  document.getElementById('step-backward').addEventListener('click', stepBackward);
  document.getElementById('timeline-slider').addEventListener('input', (e) => seekDemo(parseInt(e.target.value)));
  document.getElementById('playback-speed').addEventListener('change', (e) => changePlaybackSpeed(parseFloat(e.target.value)));

  // Initialize scenario selection
  document.querySelectorAll('.scenario-selector').forEach(item => {
    item.addEventListener('click', () => {
      const scenarioId = parseInt(item.dataset.scenario);
      switchScenario(scenarioId);
    });
  });
}); 
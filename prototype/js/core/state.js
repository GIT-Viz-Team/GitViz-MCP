// Global state management
export const state = {
  currentScenario: 1,
  currentStep: 0,
  commandQueue: [],
  executingCommand: false,
  isPlaying: false,
  playbackSpeed: 1,
  playbackTimer: null,
  scenarioTotalSteps: 0,
  autoAdvanceTimeout: null
};

export function resetState() {
  state.currentStep = 0;
  state.commandQueue = [];
  state.executingCommand = false;
  state.isPlaying = false;
  state.playbackSpeed = 1;
  state.playbackTimer = null;
  state.scenarioTotalSteps = 0;
  state.autoAdvanceTimeout = null;
}

export function setScenario(scenarioId) {
  state.currentScenario = scenarioId;
  resetState();
} 
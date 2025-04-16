import { state } from './state.js';
import { updatePlaybackControls } from '../ui/playback.js';

// Initialize the chat UI
export function initializeUI() {
  // Show demo description initially
  document.getElementById('demo-description').style.display = 'flex';
  document.getElementById('editor-container').style.display = 'none';
  document.getElementById('terminal').style.display = 'none';
  
  updatePlaybackControls();
}

// Add active highlighting to the sidebar
export function initializeSidebar() {
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
} 
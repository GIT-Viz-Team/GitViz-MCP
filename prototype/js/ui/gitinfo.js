import { scenarios } from '../core/scenarios.js';

export function updateGitInfo(scenarioId) {
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

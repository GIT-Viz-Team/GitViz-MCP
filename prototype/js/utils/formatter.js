export function formatMessage(message) {
  if (message.startsWith('$ ')) {
    return `<div class="text-green-500">${message}</div>`;
  } else if (message.startsWith('> ')) {
    return `<div class="text-vscode-text">${message.substring(2)}</div>`;
  } else if (message.startsWith('! ')) {
    return `<div class="text-yellow-500">${message.substring(2)}</div>`;
  } else if (message.startsWith('? ')) {
    return `<div class="text-blue-500">${message.substring(2)}</div>`;
  } else {
    return `<div class="text-vscode-text">${message}</div>`;
  }
}

export function formatCommand(command) {
  return `<div class="text-green-500">$ ${command}</div>`;
}

export function formatGitHash(hash) {
  return `<span class="git-hash">${hash}</span>`;
}

export function formatConflictMarker(marker) {
  return `<div class="conflict-marker">${marker}</div>`;
}

export function formatConflictCurrent(content) {
  return `<div class="conflict-current">${content}</div>`;
}

export function formatConflictIncoming(content) {
  return `<div class="conflict-incoming">${content}</div>`;
} 
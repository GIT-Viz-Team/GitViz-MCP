export function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

export function fadeIn(element) {
  element.style.opacity = '0';
  element.style.display = 'block';
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

export function fadeOut(element) {
  element.style.opacity = '0';
  setTimeout(() => {
    element.style.display = 'none';
  }, 300);
}

export function highlightElement(element) {
  element.classList.add('highlight');
  setTimeout(() => {
    element.classList.remove('highlight');
  }, 1000);
}

export function pulseElement(element) {
  element.classList.add('pulse');
  setTimeout(() => {
    element.classList.remove('pulse');
  }, 500);
} 
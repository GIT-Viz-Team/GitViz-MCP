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
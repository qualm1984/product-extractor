document.addEventListener('DOMContentLoaded', () => {
  const captureButton = document.getElementById('captureToggle');
  captureButton.textContent = 'Start Capturing';
  captureButton.setAttribute('data-capturing', 'false');

  const statusElement = document.getElementById('captureStatus');
  if (statusElement) {
    statusElement.textContent = 'Capture Status: waiting to start (0 requests captured)';
  }
});

document.getElementById('captureToggle').addEventListener('click', async () => {
  const button = document.getElementById('captureToggle');
  const isCapturing = button.getAttribute('data-capturing') !== 'true';
  
  button.textContent = isCapturing ? 'Stop Capturing' : 'Start Capturing';
  button.setAttribute('data-capturing', isCapturing.toString());

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleCapture',
    enable: isCapturing
  }, (response) => {
    if (response) {
      const statusElement = document.getElementById('captureStatus');
      if (statusElement) {
        statusElement.textContent = `Capture Status: ${response.status} (${response.captureCount} requests captured)`;
      }
    }
  });
});

// Listen for capture updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateCapture') {
    const statusElement = document.getElementById('captureStatus');
    if (statusElement) {
      const count = message.data.captureCount;
      statusElement.textContent = `Capture Status: capturing (${count} requests captured)`;
    }
  }
});

// Keep popup open
window.addEventListener('blur', (event) => {
  event.stopPropagation();
  return false;
});

document.addEventListener('click', (event) => {
  event.stopPropagation();
}); 
document.addEventListener('DOMContentLoaded', () => {
  const captureButton = document.getElementById('captureToggle');
  captureButton.textContent = 'Start Capturing';
  captureButton.setAttribute('data-capturing', 'false');
  
  // Reset capture state when popup opens
  chrome.storage.local.set({
    popupState: {
      isCapturing: false,
      captureCount: 0
    }
  });
});

function convertToCSV(data) {
  // Define CSV headers based on all possible fields
  const headers = [
    'title',
    'price',
    'rating',
    'vendor',
    'delivery',
    'discount',
    'originalPrice',
    'image'
  ];
  
  // Create CSV content
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.products.forEach(product => {
    const row = headers.map(header => {
      let value = product[header] || '';
      // Escape commas and quotes in the value
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('link');
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

let extractedData = null; // Store the extracted data
let isCapturing = false;
let popupWindow = null;

function createDetachedPopup() {
  const width = 400;
  const height = 300;
  const left = window.screenX + window.outerWidth - width;
  const top = window.screenY;

  chrome.windows.create({
    url: chrome.runtime.getURL('popup/popup.html'),
    type: 'popup',
    width: width,
    height: height,
    left: left,
    top: top
  }, (window) => {
    popupWindow = window;
  });
}

document.getElementById('extractBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    if (!tab.url.includes('google.com')) {
      throw new Error('Please navigate to a Google Shopping page first');
    }

    // Inject the content script if it hasn't been injected yet
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.productGridExtractor !== undefined
      });
      
      if (!result) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content_scripts/extractor.js']
        });
      }
    } catch (e) {
      console.log('Content script already injected or injection failed:', e);
    }

    const results = await chrome.tabs.sendMessage(tab.id, { action: 'extract' });
    if (results.success) {
      extractedData = results.data; // Store the data
      displayResults(results.data);
      document.getElementById('exportCsvBtn').style.display = 'block';
    } else {
      throw new Error(results.error || 'Failed to extract data');
    }
  } catch (error) {
    console.error('Extraction failed:', error);
    displayError(error);
    document.getElementById('exportCsvBtn').style.display = 'none';
  }
});

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  if (extractedData && extractedData.products.length > 0) {
    const csvContent = convertToCSV(extractedData);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `product-grid-export-${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  }
});

document.getElementById('captureToggle').addEventListener('click', function() {
  isCapturing = !isCapturing;
  
  if (isCapturing) {
    // Save current popup state
    const currentState = {
      isCapturing: true,
      captureCount: 0
    };
    chrome.storage.local.set({ popupState: currentState }, () => {
      // Create detached window and close current popup
      createDetachedPopup();
      window.close();
    });
  }
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'toggleCapture',
      enable: isCapturing
    }, response => {
      const button = document.getElementById('captureToggle');
      button.textContent = isCapturing ? 'Stop Capturing' : 'Start Capturing';
      button.setAttribute('data-capturing', isCapturing);
      updateCaptureStatus(response);
    });
  });
});

// Check if we're in a detached window
chrome.storage.local.get('popupState', (data) => {
  if (data.popupState?.isCapturing) {
    isCapturing = true;
    const button = document.getElementById('captureToggle');
    button.textContent = 'Stop Capturing';
    button.setAttribute('data-capturing', 'true');
    updateCaptureStatus({
      status: 'capturing',
      captureCount: data.popupState.captureCount || 0
    });
  }
});

function updateCaptureStatus(response) {
  const statusElement = document.getElementById('captureStatus');
  statusElement.textContent = `Capture Status: ${response.status} (${response.captureCount} requests captured)`;
  
  if (isCapturing) {
    chrome.storage.local.set({
      popupState: {
        isCapturing: true,
        captureCount: response.captureCount
      }
    });
  }
  
  statusElement.classList.remove('updated');
  void statusElement.offsetWidth;
  statusElement.classList.add('updated');
}

// Add listener for network captures
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'networkCapture') {
    updateCaptureStatus({
      status: 'capturing',
      captureCount: message.data.length
    });
  }
});

function displayResults(data) {
  if (!data || !data.products || !data.vendors) {
    throw new Error('Invalid data structure received');
  }

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <h3>Products Found: ${data.products.length}</h3>
    <h3>Vendors Found: ${data.vendors.length}</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

function displayError(error) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="error">
      ${error.message || 'Please navigate to a Google Shopping page and try again'}
    </div>
  `;
}

// Prevent popup from closing on clicks
document.addEventListener('click', (e) => {
  if (isCapturing) {
    e.stopPropagation();
  }
});

// Add this function to handle capture updates
function handleCaptureUpdate(data) {
  const statusElement = document.getElementById('captureStatus');
  statusElement.textContent = `Capture Status: capturing (${data.captureCount} requests captured)`;
  statusElement.classList.remove('updated');
  void statusElement.offsetWidth;
  statusElement.classList.add('updated');
}

// Add this to your existing message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateCapture') {
    handleCaptureUpdate(message.data);
  }
}); 
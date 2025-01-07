// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Product Grid Extractor installed');
});

// Initialize any required storage
chrome.storage.local.set({ 
  extractionHistory: [],
  lastExtraction: null
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'extractionComplete') {
    // Store extraction history
    chrome.storage.local.get('extractionHistory', (data) => {
      const history = data.extractionHistory || [];
      history.push({
        timestamp: new Date().toISOString(),
        products: message.data.products.length,
        vendors: message.data.vendors.length
      });
      
      // Keep only last 100 extractions
      if (history.length > 100) {
        history.shift();
      }
      
      chrome.storage.local.set({ 
        extractionHistory: history,
        lastExtraction: message.data
      });
    });
  }
}); 
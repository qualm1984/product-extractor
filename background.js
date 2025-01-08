chrome.action.onClicked.addListener((tab) => {
  // First inject the extractor script if not already injected
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.productGridExtractor !== undefined
  }).then((injectionResults) => {
    const isInjected = injectionResults[0].result;
    
    if (!isInjected) {
      // If not injected, inject the script first
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_scripts/extractor.js']
      }).then(() => {
        // Then initialize
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: toggleExtractor
        });
      });
    } else {
      // If already injected, just toggle
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: toggleExtractor
      });
    }
  });
});

function toggleExtractor() {
  if (window.productGridExtractor) {
    window.productGridExtractor.toggleUI();
  }
} 
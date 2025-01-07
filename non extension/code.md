// manifest.json
{
  "manifest_version": 3,
  "name": "Product Grid Extractor",
  "version": "1.0",
  "description": "Extract product information from Google Shopping results",
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "action": {
    "default_popup": "popup/popup.html"
  },
  "content_scripts": [{
    "matches": ["*://www.google.com/*"],
    "js": ["content_scripts/extractor.js"],
    "css": ["content_scripts/styles.css"]
  }],
  "background": {
    "service_worker": "background/worker.js"
  },
  "icons": {
    "16": "assets/icon16.png",
    "48": "assets/icon48.png",
    "128": "assets/icon128.png"
  }
}

// content_scripts/extractor.js
class ProductGridExtractor {
  constructor() {
    this.extractedData = {
      products: [],
      vendors: []
    };
  }

  // Find product elements using structural selectors rather than specific IDs
  findProductElements() {
    // Look for elements matching the general structure
    return document.querySelectorAll('div.uv2Bcc.BdPNpe div div div div div.SaPmZ div.aqszKe div');
  }

  // Extract product information
  extractProductInfo(productElement) {
    return {
      title: productElement.querySelector('h3')?.textContent || '',
      price: productElement.querySelector('[data-price]')?.textContent || '',
      rating: productElement.querySelector('[data-rating]')?.textContent || '',
      image: productElement.querySelector('img')?.src || ''
    };
  }

  // Extract vendor information when panel opens
  extractVendorInfo() {
    const vendorPanel = document.querySelector('#rSanR');
    if (!vendorPanel) return [];

    const vendors = vendorPanel.querySelectorAll('.Ncoygd');
    return Array.from(vendors).map(vendor => ({
      name: vendor.querySelector('.hP4iBf')?.textContent || '',
      price: vendor.querySelector('[data-price]')?.textContent || '',
      delivery: vendor.querySelector('[data-delivery]')?.textContent || ''
    }));
  }

  // Main extraction method
  async extract() {
    const products = this.findProductElements();
    this.extractedData.products = Array.from(products).map(product => 
      this.extractProductInfo(product)
    );

    // Wait for vendor panel to be visible
    const vendorInfo = this.extractVendorInfo();
    this.extractedData.vendors = vendorInfo;

    return this.extractedData;
  }
}

// Initialize extractor
const extractor = new ProductGridExtractor();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    extractor.extract().then(data => sendResponse(data));
    return true; // Keep connection open for async response
  }
});

// popup/popup.html
<!DOCTYPE html>
<html>
<head>
  <title>Product Grid Extractor</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h2>Product Grid Extractor</h2>
    <button id="extractBtn">Extract Products</button>
    <div id="results"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>

// popup/popup.js
document.getElementById('extractBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const results = await chrome.tabs.sendMessage(tab.id, { action: 'extract' });
    displayResults(results);
  } catch (error) {
    console.error('Extraction failed:', error);
    displayError(error);
  }
});

function displayResults(data) {
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
      Error: ${error.message}
    </div>
  `;
}

// popup/popup.css
.container {
  width: 400px;
  padding: 16px;
}

button {
  margin: 8px 0;
  padding: 8px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3367d6;
}

.error {
  color: red;
  margin-top: 8px;
}

pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
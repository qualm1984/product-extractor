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
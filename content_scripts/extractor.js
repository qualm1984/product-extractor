class CaptureUI {
  constructor(onToggleCapture) {
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 15px;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
      min-width: 250px;
    `;

    // Extract button
    this.extractBtn = document.createElement('button');
    this.extractBtn.textContent = 'Extract Products';
    this.extractBtn.style.cssText = `
      margin-right: 10px;
      padding: 5px 10px;
      background: #4285f4;
      border: 1px solid #2965c9;
      border-radius: 3px;
      cursor: pointer;
      color: white;
      font-weight: bold;
    `;

    // Capture button
    this.captureBtn = document.createElement('button');
    this.captureBtn.textContent = 'Start Capturing';
    this.captureBtn.style.cssText = `
      padding: 5px 10px;
      background: #34a853;
      border: 1px solid #1e8e3e;
      border-radius: 3px;
      cursor: pointer;
      color: white;
      font-weight: bold;
    `;

    // Add CSV Export button
    this.exportBtn = document.createElement('button');
    this.exportBtn.textContent = 'Export CSV';
    this.exportBtn.style.cssText = `
      padding: 5px 10px;
      background: #fbbc05;
      border: 1px solid #f9ab00;
      border-radius: 3px;
      cursor: pointer;
      color: white;
      font-weight: bold;
      margin-left: 10px;
      display: none; // Hidden initially
    `;

    // Status display
    this.status = document.createElement('div');
    this.status.textContent = 'Waiting to start...';
    this.status.style.cssText = `
      margin-top: 10px;
      font-size: 13px;
      color: #333;
      background: #f8f9fa;
      padding: 8px;
      border-radius: 3px;
      border: 1px solid #dadce0;
    `;

    // Create results container
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.style.cssText = `
      margin-top: 10px;
      max-height: 300px;
      overflow-y: auto;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 3px;
      border: 1px solid #dadce0;
      font-size: 13px;
      display: none;
    `;

    // Create sections for products and vendors
    this.productsSection = document.createElement('div');
    this.vendorsSection = document.createElement('div');
    this.resultsContainer.appendChild(this.productsSection);
    this.resultsContainer.appendChild(this.vendorsSection);

    // Add hover effects
    this.extractBtn.onmouseover = () => this.extractBtn.style.background = '#5094f5';
    this.extractBtn.onmouseout = () => this.extractBtn.style.background = '#4285f4';
    this.captureBtn.onmouseover = () => this.captureBtn.style.background = '#3cb85d';
    this.captureBtn.onmouseout = () => this.captureBtn.style.background = '#34a853';

    // Make panel draggable
    this.panel.style.cursor = 'move';
    this.makeDraggable(this.panel);

    // Add minimize button
    this.minimizeBtn = document.createElement('button');
    this.minimizeBtn.textContent = '−';
    this.minimizeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      padding: 2px 6px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #5f6368;
    `;

    // Assemble UI with export button
    this.panel.appendChild(this.minimizeBtn);
    this.panel.appendChild(this.extractBtn);
    this.panel.appendChild(this.captureBtn);
    this.panel.appendChild(this.exportBtn);
    this.panel.appendChild(this.status);
    this.panel.appendChild(this.resultsContainer);
    document.body.appendChild(this.panel);

    // Event handlers with visual feedback
    this.extractBtn.addEventListener('click', () => {
      this.extractBtn.style.background = '#3b78e7';
      this.status.textContent = 'Extracting products...';
      this.status.style.color = '#1967d2';
    });

    this.captureBtn.addEventListener('click', () => {
      const isCapturing = this.captureBtn.textContent === 'Start Capturing';
      this.captureBtn.textContent = isCapturing ? 'Stop Capturing' : 'Start Capturing';
      this.captureBtn.style.background = isCapturing ? '#ea4335' : '#34a853';
      this.status.textContent = isCapturing ? 
        'Capturing... Click products to capture data' : 
        'Capture stopped';
      onToggleCapture(isCapturing);
    });

    let isMinimized = false;
    this.minimizeBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      this.status.style.display = isMinimized ? 'none' : 'block';
      this.extractBtn.style.display = isMinimized ? 'none' : 'inline-block';
      this.captureBtn.style.display = isMinimized ? 'none' : 'inline-block';
      this.minimizeBtn.textContent = isMinimized ? '+' : '-';
      this.panel.style.padding = isMinimized ? '5px' : '15px';
    });

    // Export button handler
    this.exportBtn.addEventListener('click', () => {
      this.exportProductsToCSV();
    });
  }

  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.right = 'auto';
      element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  updateStatus(count) {
    this.status.textContent = `Captured ${count} product${count === 1 ? '' : 's'}`;
    this.status.style.color = '#1967d2';
  }

  updateExtractStatus(result) {
    if (result.success) {
      const productCount = result.data.products.length;
      const vendorCount = result.data.vendorCount;
      this.status.textContent = `Extracted ${productCount} products and found ${vendorCount} vendors`;
      this.status.style.color = '#34a853';
      this.exportBtn.style.display = 'inline-block';
      this._lastExtractResult = result;
      
      // Show detailed results
      this.showResults(result.data);
    } else {
      this.status.textContent = 'Extraction failed: ' + (result.error || 'Unknown error');
      this.status.style.color = '#ea4335';
      this.resultsContainer.style.display = 'none';
    }
    this.extractBtn.style.background = '#4285f4';
  }

  showResults(data) {
    let productsHtml = '<strong style="color: #000; font-size: 14px;">Products:</strong><br>';
    data.products.forEach((product, index) => {
      productsHtml += `
        <div style="margin: 8px 0; padding: 8px; border-bottom: 1px solid #dadce0;">
          <span style="color: #dc3545; font-weight: bold;">${index + 1}.</span> 
          <span style="color: #000; font-weight: 500;">${product.title}</span><br>
          <div style="margin-top: 4px;">
            <span style="color: #5f6368; display: inline-block; width: 70px;">Price:</span>
            <span style="color: #1967d2">${product.price || '-'}</span>
            ${product.hasDiscount ? `
              <span style="color: #dc3545; margin-left: 8px;">${product.discount}</span>
              <span style="color: #5f6368; text-decoration: line-through; margin-left: 8px;">${product.originalPrice}</span>
            ` : ''}
          </div>
          <div>
            <span style="color: #5f6368; display: inline-block; width: 70px;">Rating:</span>
            <span style="color: #188038">${product.rating || '-'}</span>
          </div>
          <div>
            <span style="color: #5f6368; display: inline-block; width: 70px;">Vendor:</span>
            <span style="color: #5f6368">${product.vendor || '-'}</span>
          </div>
          <div>
            <span style="color: #5f6368; display: inline-block; width: 70px;">Delivery:</span>
            <span style="color: #5f6368">${product.delivery || '-'}</span>
          </div>
        </div>
      `;
    });

    // Show vendors in 2-column layout
    let vendorsHtml = '<strong style="color: #000; font-size: 14px;">Vendors:</strong><br>';
    vendorsHtml += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px;">';
    data.vendors.forEach((vendor, index) => {
      vendorsHtml += `
        <div style="padding: 2px;">
          <span style="color: #dc3545; font-weight: bold;">${index + 1}.</span>
          <span style="color: #5f6368">${vendor}</span>
        </div>
      `;
    });
    vendorsHtml += '</div>';

    this.productsSection.innerHTML = productsHtml;
    this.vendorsSection.innerHTML = vendorsHtml;
    this.resultsContainer.style.display = 'block';
  }

  exportProductsToCSV() {
    if (!this._lastExtractResult?.data?.products) {
      this.status.textContent = 'No data to export';
      return;
    }

    const products = this._lastExtractResult.data.products;
    let csv = 'Title,Price,Rating,Vendor,Delivery\n';
    
    products.forEach(product => {
      const row = [
        `"${product.title.replace(/"/g, '""')}"`,
        product.price,
        product.rating,
        product.vendor || '',
        product.delivery || ''
      ].join(',');
      csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.status.textContent = `Exported ${products.length} products to CSV`;
    this.status.style.color = '#34a853';
  }

  onExtractClick(callback) {
    this.extractBtn.addEventListener('click', callback);
  }
}

class ProductGridExtractor {
  constructor() {
    this.extractedData = {
      products: [],
      vendors: new Set(),
      networkCaptures: []
    };
    this.isCapturingClicks = false;
    this.setupXHRInterceptor();
    this.ui = new CaptureUI((enable) => {
      this.toggleCapture(enable);
    });
    
    // Setup extract button
    this.ui.onExtractClick(() => {
      this.extract().then(result => {
        console.log('Extraction complete:', result);
        this.ui.updateExtractStatus(result);
      });
    });
  }

  findProductElements() {
    const productGroups = document.querySelectorAll('product-viewer-group');
    const products = [];
    
    productGroups.forEach(group => {
      const productItems = group.querySelectorAll('ul li');
      products.push(...Array.from(productItems));
    });
    
    console.log('Found products:', products.length);
    return products;
  }

  extractProductInfo(productElement) {
    // Define patterns at the top of the function
    const pricePattern = /^[£$€]\d+(\.\d{2})?/;
    const ratingPattern = /^\d\.\d$/;
    const deliveryPattern = /\b(delivery|free|by|collection)\b/i;

    // Find all text-containing elements
    const textElements = Array.from(productElement.querySelectorAll('*'))
      .filter(element => {
        const hasDirectText = Array.from(element.childNodes)
          .some(node => node.nodeType === 3 && node.textContent.trim().length > 0);
        const isNotScript = element.tagName !== 'SCRIPT';
        const isVisible = element.offsetParent !== null;
        const hasNoChildElements = element.children.length === 0;
        
        return hasDirectText && isNotScript && isVisible && hasNoChildElements;
      });

    const texts = textElements.map(el => el.textContent.trim())
      .filter(text => text.length > 0);

    // Helper function to categorize text by pattern
    const categorizeText = (text) => {
      // Price pattern: Starts with currency symbol followed by numbers
      if (pricePattern.test(text)) return 'price';
      
      // Rating pattern: Single digit followed by dot and single digit
      if (ratingPattern.test(text)) return 'rating';
      
      // Rating count pattern: Numbers in parentheses
      if (/^\(\d+\)$/.test(text)) return 'ratingCount';
      
      // Delivery pattern: Contains delivery-related words
      if (deliveryPattern.test(text)) return 'delivery';
      
      return 'other';
    };

    // Process text groups based on their position and structure
    const processTextGroups = (groups) => {
      const mainGroup = groups[0] || [];
      
      // Check if first item in mainGroup is a discount
      const hasDiscount = mainGroup[0] && mainGroup[0].includes('% OFF');
      const discount = hasDiscount ? mainGroup[0] : '';
      
      const title = mainGroup.reduce((longest, current) => 
        (current.length > longest.length ? current : longest), '');
      
      // Get the correct group based on discount presence
      const dataGroup = hasDiscount ? groups[2] : groups[1];
      
      // Handle prices and discount
      let originalPrice = '';
      let price = '';
      
      if (hasDiscount) {
        if (groups[1] && groups[1][0]) {
          price = groups[1][0];  // Discounted price
        }
        if (groups[2] && groups[2][0]) {
          originalPrice = groups[2][0];  // Original price
        }
      } else {
        if (dataGroup && dataGroup[0]) {
          price = dataGroup[0];
        }
      }

      // Get rating and review count
      let rating = '';
      let ratingCount = '';
      let vendor = '';
      let delivery = '';

      if (dataGroup) {
        const groupArray = dataGroup;
        
        // First try to find rating at the expected position
        const possibleRating = groupArray[groupArray.length - 2];
        if (possibleRating && /^\d\.\d/.test(possibleRating)) {
          rating = possibleRating;
          ratingCount = groupArray[groupArray.length - 1];
          
          // If we have a rating, vendor is likely in position 1 or 2
          if (groupArray[1] === '& more prices' || groupArray[1] === 'Refurbished') {
            vendor = groupArray[2];
          } else {
            vendor = groupArray[1];
          }
        } else {
          // No rating found, look for vendor and delivery differently
          // Check each item in the group for delivery pattern
          const deliveryIndex = groupArray.findIndex(text => 
            /\b(delivery|free|by|collection)\b/i.test(text));
          
          if (deliveryIndex !== -1) {
            delivery = groupArray[deliveryIndex];
            // If delivery found, vendor might be before it
            if (deliveryIndex > 0) {
              vendor = groupArray[deliveryIndex - 1];
            }
          } else {
            // If no delivery found in this group, vendor might be the last non-price item
            const lastItem = groupArray[groupArray.length - 1];
            if (lastItem && !lastItem.match(/^[£$€]\d+/) && !lastItem.includes('& more')) {
              vendor = lastItem;
            }
          }
        }
      }

      // Clean up vendor text
      if (vendor && (
        vendor === '& more prices' ||
        vendor.includes('and more') ||
        vendor.startsWith('£') ||
        vendor === 'Refurbished' ||
        /^\d\.\d/.test(vendor) ||  // Don't use rating as vendor
        /^\(\d+\)$/.test(vendor)   // Don't use rating count as vendor
      )) {
        vendor = '';
      }

      return {
        title,
        price,
        rating,
        ratingCount,
        vendor,
        delivery,
        hasDiscount,
        ...(hasDiscount && {
          discount,
          originalPrice
        })
      };
    };

    // Group texts and process them
    const textGroups = [];
    let currentGroup = [];
    texts.forEach(text => {
      if (pricePattern.test(text)) { // Start new group on price
        if (currentGroup.length > 0) {
          textGroups.push([...currentGroup]);
          currentGroup = [];
        }
      }
      currentGroup.push(text);
    });
    if (currentGroup.length > 0) {
      textGroups.push(currentGroup);
    }

    // Find image
    const imageElement = productElement.querySelector('img');

    // Process the text groups to extract information
    const { 
      title, 
      price, 
      rating, 
      ratingCount, 
      vendor, 
      delivery,
      hasDiscount,
      discount,
      originalPrice 
    } = processTextGroups(textGroups);

    return {
      title: title || '',
      price: price || '',
      rating: rating ? `${rating} ${ratingCount || ''}` : '',
      image: imageElement?.src || '',
      vendor: vendor || '',
      delivery: delivery || '',
      hasDiscount,
      ...(hasDiscount && {
        discount,
        originalPrice
      })
    };
  }

  async extract() {
    try {
      const products = this.findProductElements();
      console.log('Found product elements:', products.length);

      this.extractedData.products = Array.from(products).map(product => 
        this.extractProductInfo(product)
      );

      this.extractedData.products.forEach(product => {
        if (product.vendor) {
          this.extractedData.vendors.add(product.vendor);
        }
      });

      const uniqueVendors = Array.from(this.extractedData.vendors);
      console.log('Unique vendors found:', uniqueVendors);

      return {
        success: true,
        data: {
          products: this.extractedData.products,
          vendors: uniqueVendors,
          vendorCount: uniqueVendors.length
        }
      };
    } catch (error) {
      console.error('Extraction error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  setupXHRInterceptor() {
    const self = this;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function() {
      const url = arguments[1];
      this._url = url;
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
      const url = this._url;
      if (typeof url === 'string' && url.includes('async/oapv')) {
        console.log('Intercepted URL:', url);
        
        this.addEventListener('load', function() {
          if (self.isCapturingClicks) {
            try {
              const response = JSON.parse(this.responseText);
              console.log('Captured response:', response);
              
              self.extractedData.networkCaptures.push({
                url: url,
                response: response,
                timestamp: new Date().toISOString()
              });

              self.ui.updateStatus(self.extractedData.networkCaptures.length);
            } catch (error) {
              console.error('Failed to capture response:', error);
            }
          }
        });
      }
      return originalSend.apply(this, arguments);
    };
  }

  toggleCapture(enable) {
    this.isCapturingClicks = enable;
    console.log('Capture toggled:', enable);
    return {
      success: true,
      status: enable ? 'capturing' : 'stopped',
      captureCount: this.extractedData.networkCaptures.length
    };
  }
}

// Initialize the extractor
if (!window.productGridExtractor) {
  window.productGridExtractor = new ProductGridExtractor();
  console.log('Product Grid Extractor initialized');
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!window.productGridExtractor) {
    window.productGridExtractor = new ProductGridExtractor();
  }

  switch (request.action) {
    case 'extract':
      window.productGridExtractor.extract()
        .then(result => {
          console.log('Extract result:', result);
          sendResponse(result);
        })
        .catch(error => {
          console.error('Extract error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;

    case 'toggleCapture':
      const result = window.productGridExtractor.toggleCapture(request.enable);
      console.log('Toggle capture result:', result);
      sendResponse(result);
      break;
  }
  return true;
});

console.log('Product Grid Extractor content script loaded'); 
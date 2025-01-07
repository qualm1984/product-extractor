class ProductGridExtractor {
  constructor() {
    this.extractedData = {
      products: [],
      vendors: new Set()
    };
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
      if (/^[£$€]\d+(\.\d{2})?/.test(text)) return 'price';
      
      // Rating pattern: Single digit followed by dot and single digit
      if (/^\d\.\d$/.test(text)) return 'rating';
      
      // Rating count pattern: Numbers in parentheses
      if (/^\(\d+\)$/.test(text)) return 'ratingCount';
      
      // Delivery pattern: Contains delivery-related words
      if (/\b(delivery|free|by|collection)\b/i.test(text)) return 'delivery';
      
      return 'other';
    };

    // Process text groups based on their position and structure
    const processTextGroups = (groups) => {
      // First group usually contains the main product info
      const mainGroup = groups[0] || [];
      
      // Check if first item in mainGroup is a discount
      const hasDiscount = mainGroup[0] && mainGroup[0].includes('% OFF');
      // Store discount value if present
      const discount = hasDiscount ? mainGroup[0] : '';
      
      // Find the longest text in the first group (likely the title)
      const title = mainGroup.reduce((longest, current) => 
        (current.length > longest.length ? current : longest), '');
      
      // Get the correct group based on discount presence
      const dataGroup = hasDiscount ? groups[2] : groups[1];
      
      // For products with discount, get original price from group[1]
      let originalPrice = '';
      let price = '';
      
      if (hasDiscount) {
        if (groups[1] && groups[1][0]) {
          price = groups[1][0];  // This is the discounted price
        }
        if (groups[2] && groups[2][0]) {
          originalPrice = groups[2][0];  // This is the original price
        }
      } else {
        // If no discount, just use the first price found
        if (dataGroup && dataGroup[0]) {
          price = dataGroup[0];
        }
      }
      
      // Get rating and review count from their fixed positions
      let rating = '';
      let ratingCount = '';
      if (dataGroup) {
        const groupArray = dataGroup;
        // Check if the second-to-last item is a rating (matches the X.X pattern)
        const possibleRating = groupArray[groupArray.length - 2];
        if (possibleRating && /^\d\.\d/.test(possibleRating)) {
          rating = possibleRating;
          ratingCount = groupArray[groupArray.length - 1];
        }
      }
      
      // Look for vendor in subsequent groups
      let vendor = '';
      let delivery = '';
      
      // Get vendor from the correct group
      if (dataGroup) {
        const groupArray = dataGroup;
        // Check for different vendor position patterns
        if (!rating) {
          // For products without rating, vendor is second-to-last and delivery is last
          vendor = groupArray[groupArray.length - 2];
          delivery = groupArray[groupArray.length - 1];
        } else {
          // Normal case: check if second item is "& more prices" or "Refurbished"
          if (groupArray[1] === '& more prices' || groupArray[1] === 'Refurbished') {
            // Vendor is in the third position
            vendor = groupArray[2];
          } else {
            // Vendor is in the second position
            vendor = groupArray[1];
          }
        }
      }
      
      // Only look for delivery info if not already found
      if (!delivery) {
        groups.slice(1).forEach(group => {
          const deliveryText = group.find(t => 
            /\b(delivery|free|by|collection)\b/i.test(t));
          if (deliveryText) delivery = deliveryText;
        });
      }
      
      // Clean up vendor text
      if (vendor && (
        vendor === '& more prices' ||
        vendor.includes('and more') ||
        vendor.startsWith('£') ||
        vendor === 'Refurbished'
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
      if (/^[£$€]\d+/.test(text)) { // Start new group on price
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

    console.log('Text groups:', textGroups);

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
      vendor: vendor,
      delivery: delivery,
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

      if (!this.extractedData.products) this.extractedData.products = [];

      return {
        products: this.extractedData.products,
        vendors: uniqueVendors,
        vendorCount: uniqueVendors.length
      };
    } catch (error) {
      console.error('Extraction error:', error);
      return {
        products: [],
        vendors: [],
        vendorCount: 0
      };
    }
  }
}

window.productGridExtractor = window.productGridExtractor || null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    if (!window.productGridExtractor) {
      window.productGridExtractor = new ProductGridExtractor();
    }
    
    window.productGridExtractor.extract()
      .then(data => {
        console.log('Extracted data:', data);
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        console.error('Extraction error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  return true;
});

console.log('Product Grid Extractor content script loaded'); 
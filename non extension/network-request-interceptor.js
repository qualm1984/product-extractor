class ProductNetworkInterceptor {
    constructor() {
      this.setupXHRInterceptor();
      this.setupClickListener();
    }
  
    isProductTitleDiv(element) {
      if (element.tagName !== 'DIV') return false;
      if (element.offsetParent === null) return false;
      if (element.children.length > 0) return false;
      
      let parent = element.parentElement;
      while (parent) {
        if (parent.tagName === 'LI') {
          const ul = parent.parentElement;
          if (ul?.tagName === 'UL') {
            const group = ul.closest('product-viewer-group');
            return !!group;
          }
        }
        parent = parent.parentElement;
      }
      return false;
    }
  
    setupXHRInterceptor() {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        const url = arguments[1];
        if (typeof url === 'string' && url.includes('async/oapv')) {
          console.log('Intercepted URL:', url);
        }
        return originalOpen.apply(this, arguments);
      };
    }
  
    setupClickListener() {
      document.addEventListener('click', e => {
        if (this.isProductTitleDiv(e.target)) {
          console.log('Product clicked:', e.target.textContent.trim());
        }
      });
    }
  }
  
  new ProductNetworkInterceptor();
  console.log('Network interceptor active');
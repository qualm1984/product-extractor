const productGroups = document.querySelectorAll('product-viewer-group');
const results = [];

productGroups.forEach(group => {
    // Find all ULs within product-viewer-group, then find all LIs within those ULs (at any depth)
    const productItems = group.querySelectorAll('ul li');
    
    productItems.forEach(item => {
        // Find all elements that might contain text, at any depth
        const textElements = Array.from(item.querySelectorAll('*'))
            .filter(element => {
                // Check if element contains direct text (not just child elements)
                const hasDirectText = Array.from(element.childNodes)
                    .some(node => node.nodeType === 3 && node.textContent.trim().length > 0);
                const isNotScript = element.tagName !== 'SCRIPT';
                const isVisible = element.offsetParent !== null;
                const hasNoChildElements = element.children.length === 0;
                
                return hasDirectText && isNotScript && isVisible && hasNoChildElements;
            });

        const texts = textElements.map(el => {
            const text = el.textContent.trim();
            return text.length > 0 ? text : null;
        }).filter(text => text);

        if (texts.length > 0) {
            results.push(texts);
        }
    });
});

console.log(JSON.stringify(results, null, 2));
document.addEventListener('click', e => {
    const clicked = e.target;
    console.log('Element clicked:', {
        tag: clicked.tagName,
        id: clicked.id,
        classList: clicked.classList,
        textContent: clicked.textContent?.slice(0,50),
        attributes: Array.from(clicked.attributes).map(a => `${a.name}=${a.value}`),
        parentClass: clicked.parentElement?.className,
        coordinates: { x: e.clientX, y: e.clientY },
    });
    
    // Also log network requests immediately after click
    const origFetch = window.fetch;
    window.fetch = function() {
        if (arguments[0]?.includes('async/oapv')) {
            console.log('Product fetch URL:', arguments[0]);
        }
        return origFetch.apply(this, arguments);
    };
});

console.log('Click tracker active');
async function fetchProductDetails(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Version': '71133812',
                'Content-Type': 'application/json; charset=UTF-8',
                'X-Content-Type-Options': 'nosniff',
                'Accept-CH': 'Sec-CH-Prefers-Color-Scheme',
                'Content-Encoding': 'gzip',
                'X-Frame-Options': 'SAMEORIGIN',
                'Alt-Svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000'
            }
        });
        const text = await response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Test with your URL
fetchProductDetails('YOUR_URL_HERE');
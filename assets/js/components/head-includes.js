/**
 * Connect Tag - Head Includes (Meta & SEO)
 * Handles meta tags. CSS is now loaded directly in HTML to prevent flicker.
 */
(function () {
  'use strict';

  // Use global base URL
  const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';

  

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    const registerSW = () => {
      // Ensure sw.js is resolved from root correctly
      const swPath = baseUrl.endsWith('/') ? baseUrl + 'sw.js' : baseUrl + '/sw.js';

      // updateViaCache: 'none' forces the browser to bypass its own cache when checking for updates to sw.js
      navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
        .then(reg => {
          console.log('SW Registered at:', swPath);

          // Check for updates frequently
          reg.update();
        })
        .catch(err => console.log('SW Registration Failed', err));
    };

    // Force a one-time reload when a new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        console.log('SW: New controller found, reloading page to apply updates...');
        window.location.reload();
        refreshing = true;
      }
    });

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }
  }

})();

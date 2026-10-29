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
    const hadController = Boolean(navigator.serviceWorker.controller);

    const registerSW = () => {
      // Ensure sw.js is resolved from root correctly
      const swPath = baseUrl.endsWith('/') ? baseUrl + 'sw.js' : baseUrl + '/sw.js';

      // updateViaCache: 'none' forces the browser to bypass its own cache when checking for updates to sw.js
      navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
        .catch(() => {});
    };

    // Only reload when an existing controller is replaced by a new service worker update
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    const scheduleSW = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(registerSW, { timeout: 4000 });
      } else {
        setTimeout(registerSW, 2000);
      }
    };

    if (document.readyState === 'complete') {
      scheduleSW();
    } else {
      window.addEventListener('load', scheduleSW, { once: true });
    }
  }

})();

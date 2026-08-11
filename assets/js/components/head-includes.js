/**
 * Connect Tag - Head Includes (Meta & SEO)
 * Handles meta tags. CSS is now loaded directly in HTML to prevent flicker.
 */
(function () {
  'use strict';

  // Use global base URL
  const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';

  // Helper to add link tags (used for icons)
  const addLink = (rel, href, type = null) => {
    const fullHref = href.startsWith('http') ? href : baseUrl + href;
    if (!document.querySelector(`link[href="${fullHref}"]`)) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = fullHref;
      if (type) link.type = type;
      document.head.appendChild(link);
    }
  };

  // Helper to add meta tags
  const addMeta = (name, content) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  };

  // Favicon
  addLink('icon', baseUrl + 'favicon.webp', 'image/webp');
  addLink('apple-touch-icon', baseUrl + 'icon-192.png');

  // Manifest for PWA
  addLink('manifest', baseUrl + 'manifest.json');

  // Theme colors & mobile web app capability
  addMeta('theme-color', '#0077b6');
  addMeta('msapplication-navbutton-color', '#0077b6');
  addMeta('mobile-web-app-capable', 'yes'); // Standard
  addMeta('apple-mobile-web-app-capable', 'yes'); // Legacy
  addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = baseUrl + 'sw.js';
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          console.log('SW Registered');
          reg.update();
        })
        .catch(err => console.log('SW Registration Failed', err));
    });
  }

})();

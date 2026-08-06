/**
 * Connect Tag - Master Components Bundle
 * Include this single script to load all Web Components across the site.
 */
(function() {
  'use strict';

  // 1. Load Head Includes
  const basePath = 'https://connecttag.org/assets/js/components/';

  function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = false; // Execute in sequence
    document.head.appendChild(s);
  }

  // Load components sequentially
  loadScript(basePath + 'head-includes.js');
  loadScript(basePath + 'site-header.js');
  loadScript(basePath + 'site-footer.js');
  loadScript(basePath + 'ad-banner.js');
  loadScript(basePath + 'site-breadcrumb.js');
  loadScript(basePath + 'cookie-consent.js');
})();

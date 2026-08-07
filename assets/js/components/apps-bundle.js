/**
 * Connect Tag - Apps Specific Components Bundle
 * Loads all components required for application project pages.
 */
(function() {
  'use strict';

  const rootPath = window.CT_ROOT_PATH || 'https://connecttag.org/';

  function loadScript(src) {
    const fullSrc = src.startsWith('http') ? src : rootPath + src;
    if (document.querySelector(`script[src="${fullSrc}"]`)) return;

    const s = document.createElement('script');
    s.src = fullSrc;
    s.async = false;
    document.head.appendChild(s);
  }

  // Load app-specific components
  loadScript('assets/js/components/site-app-header.js');
  loadScript('assets/js/components/site-app-downloads.js');
  loadScript('assets/js/components/site-app-features.js');

})();

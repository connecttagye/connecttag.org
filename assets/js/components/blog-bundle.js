/**
 * Connect Tag - Blog Specific Components Bundle
 * Loads all components required for article pages.
 */
(function() {
  'use strict';

  // Use global base URL
  const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';

  function loadScript(src) {
    const fullSrc = src.startsWith('http') ? src : baseUrl + src;
    if (document.querySelector(`script[src="${fullSrc}"]`)) return;

    const s = document.createElement('script');
    s.src = fullSrc;
    s.async = false;
    document.head.appendChild(s);
  }

  // Load blog-specific components
  loadScript('assets/js/components/site-article-card.js');
  loadScript('assets/js/components/site-article-meta.js');
  loadScript('assets/js/components/site-share-buttons.js');
  loadScript('assets/js/components/site-related-posts.js');

})();

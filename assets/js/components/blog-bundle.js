/**
 * Connect Tag - Blog Specific Components Bundle
 * Loads all components required for article pages.
 */
(function() {
  'use strict';

  // Detect Root Path
  const scripts = document.getElementsByTagName('script');
  const currentScript = Array.from(scripts).find(s => s.src.includes('blog-bundle.js'));
  let rootPath = 'https://connecttag.org/';

  if (currentScript) {
    rootPath = currentScript.src.split('assets/js/components/')[0];
  }

  function loadScript(src) {
    const fullSrc = src.startsWith('http') ? src : rootPath + src;
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

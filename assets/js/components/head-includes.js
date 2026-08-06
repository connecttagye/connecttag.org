/**
 * Connect Tag - Head Includes & Core Resource Manager
 * Ensures critical styles, font preloading, and global configurations are injected seamlessly.
 */
(function () {
  'use strict';

  // Inject components.css if not present
  if (!document.querySelector('link[href*="components.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://connecttag.org/assets/css/components.css';
    document.head.appendChild(link);
  }

  // Preconnect to Google Fonts & AdSense domains for performance (Core Web Vitals)
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://pagead2.googlesyndication.com'
  ];

  preconnectDomains.forEach(domain => {
    if (!document.querySelector(`link[href="${domain}"]`)) {
      const pLink = document.createElement('link');
      pLink.rel = 'preconnect';
      pLink.href = domain;
      if (domain.includes('gstatic')) pLink.crossOrigin = 'anonymous';
      document.head.appendChild(pLink);
    }
  });

  window.CT_PATH_PREFIX = 'https://connecttag.org/';
})();

/**
 * Connect Tag - Head Includes & Core Resource Manager
 * Ensures critical styles, font preloading, and global configurations are injected seamlessly.
 */
(function () {
  'use strict';

  const baseUrl = 'https://connecttag.org/';
  window.CT_PATH_PREFIX = baseUrl;

  // Helper to add link tags
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

  // Helper to add script tags
  const addScript = (src, type = 'text/javascript') => {
    const fullSrc = src.startsWith('http') ? src : baseUrl + src;
    if (!document.querySelector(`script[src="${fullSrc}"]`)) {
      const script = document.createElement('script');
      script.src = fullSrc;
      script.type = type;
      document.head.appendChild(script);
    }
  };

  // Favicon
  addLink('icon', 'https://connecttag.org/favicon.webp', 'image/webp');

  // Theme colors & mobile web app capability
  addMeta('theme-color', '#317EFB');
  addMeta('msapplication-navbutton-color', '#d69503');
  addMeta('apple-mobile-web-app-capable', 'yes');
  addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

  // Stylesheets
  addLink('stylesheet', 'assets/css/bootstrap.css');
  addLink('stylesheet', 'assets/css/styles.min.css');
  addLink('stylesheet', 'assets/css/components.css');
  addLink('stylesheet', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
  addLink('stylesheet', 'https://unpkg.com/aos@2.3.1/dist/aos.css');
  addLink('stylesheet', 'assets/css/animate-custom.css');

  // Scripts
  addScript('assets/js/jquery.min.js');
  addScript('assets/js/modernizr.custom.js');
  addScript('https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js');
  addScript('https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js');

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

})();

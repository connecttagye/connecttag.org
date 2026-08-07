/**
 * Connect Tag - Head Includes (Styles & Meta)
 * Handles CSS injection and meta tags. Scripts are managed by components-bundle.js
 */
(function () {
  'use strict';

  // Detect Root Path
  const scripts = document.getElementsByTagName('script');
  const bundleScript = Array.from(scripts).find(s => s.src.includes('components-bundle.js'));
  let rootPath = 'https://connecttag.org/';

  if (bundleScript) {
      rootPath = bundleScript.src.split('assets/js/components/')[0];
  }

  // Helper to add link tags
  const addLink = (rel, href, type = null) => {
    const fullHref = href.startsWith('http') ? href : rootPath + href;
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
  addLink('icon', rootPath + 'favicon.webp', 'image/webp');

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

  // Preconnect
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

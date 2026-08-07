/**
 * Connect Tag - Master Components Bundle
 * Include this single script to load all resources in the correct sequence.
 */
(function() {
  'use strict';

  // 1. Path Resolution Logic (SEO-Friendly & Local-Safe)
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168');
  let baseUrl = 'https://connecttag.org/';

  if (isLocal) {
    const scripts = document.getElementsByTagName('script');
    const bundleScript = Array.from(scripts).find(s => s.src.includes('components-bundle.js'));
    if (bundleScript) {
      baseUrl = bundleScript.src.split('assets/js/components/')[0];
    }
  }

  // Define global constants
  window.CT_BASE_URL = baseUrl;
  window.CT_ROOT_PATH = baseUrl; // Compatibility alias

  function loadScript(src) {
    const fullSrc = src.startsWith('http') ? src : baseUrl + src;
    if (document.querySelector(`script[src="${fullSrc}"]`)) return;

    const s = document.createElement('script');
    s.src = fullSrc;
    s.async = false; // Force sequential execution
    document.head.appendChild(s);
  }

  // --- STAGE 1: CORE LIBRARIES (Critical Order) ---
  loadScript('assets/js/jquery.min.js');
  loadScript('assets/js/modernizr.custom.js');

  // --- STAGE 2: META & STYLES ---
  loadScript('assets/js/components/head-includes.js');

  // --- STAGE 3: UI COMPONENTS (Web Components) ---
  loadScript('assets/js/components/site-header.js');
  loadScript('assets/js/components/site-footer.js');
  loadScript('assets/js/components/site-breadcrumb.js');
  loadScript('assets/js/components/cookie-consent.js');

  // --- STAGE 4: PLUGINS & FUNCTIONALITY ---
  // Note: These will run after jQuery due to async=false
  loadScript('assets/js/bootstrap.min.js');
  loadScript('assets/js/jquery.easing.1.3.js');
  loadScript('assets/js/smoothscroll.js');
  loadScript('https://unpkg.com/aos@2.3.1/dist/aos.js');

  // --- STAGE 5: SITE LOGIC ---
  loadScript('assets/js/components/site-scripts.js');

  // IE Compatibility
  loadScript('https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js');
  loadScript('https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js');

})();

/**
 * Connect Tag - Master Components Bundle (Optimized & jQuery-Free)
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
    s.async = false; // Maintain execution order for components
    document.head.appendChild(s);
  }

  // --- STAGE 1: CORE LIBRARIES ---
  // jQuery and Modernizr removed (Modernizr replaced by native features or skipped if unused)
  // loadScript('assets/js/modernizr.custom.js'); // Keeping only if specific features needed

  // --- STAGE 2: META & STYLES ---
  loadScript('assets/js/components/head-includes.js');

  // --- STAGE 3: UI COMPONENTS (Web Components - Native JS) ---
  loadScript('assets/js/components/site-preloader.js');
  loadScript('assets/js/components/site-header.js');
  loadScript('assets/js/components/site-footer.js');
  loadScript('assets/js/components/site-breadcrumb.js');
  loadScript('assets/js/components/cookie-consent.js');
  loadScript('assets/js/components/pwa-install-prompt.js');

  // --- STAGE 4: THIRD PARTY PLUGINS ---
  loadScript('https://unpkg.com/aos@2.3.1/dist/aos.js');

  // --- STAGE 5: SITE LOGIC ---
  loadScript('assets/js/components/site-scripts.js');

  // --- STAGE 6: PWA EVENT CAPTURE (Early Listener) ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.CT_DEFERRED_PROMPT = e;
    console.log('PWA: Event captured in master bundle');
  });

})();

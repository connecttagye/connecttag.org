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

  function loadScript(src, isAsync = false) {
    const fullSrc = src.startsWith('http') ? src : baseUrl + src;
    if (document.querySelector(`script[src="${fullSrc}"]`)) return;

    const s = document.createElement('script');
    s.src = fullSrc;
    s.async = isAsync;
    document.head.appendChild(s);
  }

  // --- STAGE 1: CORE LIBRARIES ---
  // Load heavy third party libraries first and async
  loadScript('https://unpkg.com/aos@2.3.1/dist/aos.js', true);

  // --- STAGE 2: UI COMPONENTS (Web Components) ---
  // Load these in parallel (async=true) as they are independent Web Components
  const components = [
    'assets/js/components/head-includes.js',
    'assets/js/components/site-preloader.js',
    'assets/js/components/site-header.js',
    'assets/js/components/site-footer.js',
    'assets/js/components/site-breadcrumb.js',
    'assets/js/components/cookie-consent.js',
    'assets/js/components/pwa-install-prompt.js'
  ];

  components.forEach(c => loadScript(c, true));

  // --- STAGE 3: SITE LOGIC (Must wait for DOM, but can be loaded async) ---
  loadScript('assets/js/components/site-scripts.js', true);

  // --- STAGE 6: PWA EVENT CAPTURE (Early Listener) ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.CT_DEFERRED_PROMPT = e;
    console.log('PWA: Event captured in master bundle');
  });

})();

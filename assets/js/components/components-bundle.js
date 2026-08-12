/**
 * Connect Tag - Master Components Bundle (Optimized & jQuery-Free)
 * Include this single script to load all resources in the correct sequence.
 */
(function() {
  'use strict';

  // --- STAGE 0: EARLY PWA EVENT CAPTURE ---
  // We capture this as soon as possible, even before other logic
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.CT_DEFERRED_PROMPT = e;
    console.log('PWA: Event captured early in bundle');
    // If the UI script is already loaded, it will pick this up
  });

  // 1. Path Resolution Logic (Dynamic & Multi-Environment)
  const scripts = document.getElementsByTagName('script');
  const bundleScript = Array.from(scripts).find(s => s.src.includes('assets/js/components/components-bundle.js'));
  let baseUrl = '/';

  if (bundleScript) {
    // Extract base URL from the script src itself
    baseUrl = bundleScript.src.split('assets/js/components/')[0];
  } else {
    // Fallback if script path detection fails
    baseUrl = window.location.origin + '/';
  }

  // Ensure it ends with slash
  if (!baseUrl.endsWith('/')) baseUrl += '/';

  // Define global constants
  window.CT_BASE_URL = baseUrl;
  window.CT_ROOT_PATH = baseUrl; // Compatibility alias
  const ASSET_VERSION = '1.1.0';

  function loadScript(src, isAsync = false) {
    let fullSrc = src.startsWith('http') ? src : baseUrl + src;

    // Add versioning to internal scripts
    if (!src.startsWith('http')) {
      fullSrc += (fullSrc.includes('?') ? '&' : '?') + 'v=' + ASSET_VERSION;
    }

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

})();

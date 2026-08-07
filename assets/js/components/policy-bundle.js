/**
 * Connect Tag - Policy & Legal Specific Components Bundle
 */
(function() {
  'use strict';

  const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';

  function loadScript(src) {
    const fullSrc = src.startsWith('http') ? src : baseUrl + src;
    if (document.querySelector(`script[src="${fullSrc}"]`)) return;

    const s = document.createElement('script');
    s.src = fullSrc;
    s.async = false;
    document.head.appendChild(s);
  }

  loadScript('assets/js/components/site-policy-header.js');
  loadScript('assets/js/components/site-policy-section.js');

})();

/**
 * Connect Tag - Body Includes Component
 * Dynamically injects global scripts at the end of the body.
 */
(function() {
    'use strict';

    const baseUrl = 'https://connecttag.org/';
    const scripts = [
        'assets/js/bootstrap.min.js',
        'assets/js/jquery.easing.1.3.js',
        'assets/js/smoothscroll.js',
        'assets/js/custom-scripts.js',
        'https://unpkg.com/aos@2.3.1/dist/aos.js'
    ];

    function injectScripts() {
        scripts.forEach(src => {
            const scriptPath = src.startsWith('http') ? src : baseUrl + src;

            // Check if already exists
            if (document.querySelector(`script[src="${scriptPath}"]`)) return;

            const script = document.createElement('script');
            script.src = scriptPath;
            script.async = false;
            document.body.appendChild(script);
        });
    }

    // Initialize injection
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        injectScripts();
    } else {
        document.addEventListener('DOMContentLoaded', injectScripts);
    }
})();

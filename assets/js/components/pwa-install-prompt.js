/**
 * Connect Tag - PWA Install Prompt Component
 * Handles the custom "Install App" banner for better user engagement.
 */
(function() {
  'use strict';

  let deferredPrompt = null;
  const STORAGE_KEY = 'ct_pwa_prompt_dismissed';
  const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone;

  // Clear cache/dismiss state if requested via URL
  if (window.location.search.includes('reset_pwa=true')) {
    localStorage.removeItem(STORAGE_KEY);
  }

  const createPrompt = (type = 'android') => {
    let bodyContent = '';

    if (type === 'ios') {
      bodyContent = `
        <div class="pwa-prompt-icon">
          <img src="${window.CT_BASE_URL}icon-192.png" alt="Connect Tag Logo" width="40" height="40">
        </div>
        <div class="pwa-prompt-text">
          <h3>تثبيت تطبيق كونكت تاق</h3>
          <p>اضغط على أيقونة <i class="fa-regular fa-share-from-square" aria-hidden="true"></i> ثم <strong>"Add to Home Screen"</strong> لتثبيت التطبيق على جهازك.</p>
        </div>
      `;
    } else {
      bodyContent = `
        <div class="pwa-prompt-icon">
          <img src="${window.CT_BASE_URL}icon-192.png" alt="Connect Tag Logo" width="40" height="40">
        </div>
        <div class="pwa-prompt-text">
          <h3>تثبيت تطبيق كونكت تاق</h3>
          <p>احصل على وصول أسرع وتجربة أفضل على هاتفك</p>
        </div>
        <button type="button" id="pwa-install-btn" class="pwa-install-button">تثبيت</button>
      `;
    }

    const promptHtml = `
      <div id="pwa-install-prompt" class="pwa-prompt-container ${type === 'ios' ? 'is-ios' : ''}">
        <div class="pwa-prompt-content">
          <button type="button" class="pwa-prompt-close" aria-label="إغلاق">&times;</button>
          <div class="pwa-prompt-body">
            ${bodyContent}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', promptHtml);

    const promptElement = document.getElementById('pwa-install-prompt');
    const installBtn = document.getElementById('pwa-install-btn');
    const closeBtn = promptElement.querySelector('.pwa-prompt-close');

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        const promptToUse = deferredPrompt || window.CT_DEFERRED_PROMPT;
        if (promptToUse) {
          promptToUse.prompt();
          const { outcome } = await promptToUse.userChoice;
          deferredPrompt = null;
          window.CT_DEFERRED_PROMPT = null;
          hidePrompt();
        }
      });
    }

    closeBtn.addEventListener('click', () => {
      hidePrompt();
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    });
  };

  const showPrompt = () => {
    const cookieBanner = document.getElementById('ct-cookie-banner');
    if (cookieBanner && !cookieBanner.classList.contains('hidden') && !window.location.search.includes('debug_pwa=true')) {
      cookieBanner.addEventListener('click', (e) => {
        if (e.target.closest('.ct-cookie-btn')) {
          setTimeout(showPrompt, 600);
        }
      }, { once: true });
      return;
    }
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.classList.add('is-visible');
    } else {
      console.error('PWA: Prompt element not found when trying to show');
    }
  };

  const hidePrompt = () => {
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.classList.remove('is-visible');
    }
  };

  const isDismissed = () => {
    const lastDismissed = localStorage.getItem(STORAGE_KEY);
    if (!lastDismissed) return false;
    const dismissed = (Date.now() - parseInt(lastDismissed)) < DISMISS_DURATION;
    if (dismissed) console.log('PWA: Prompt is currently in dismissed state (last dismissed: ' + new Date(parseInt(lastDismissed)).toLocaleString() + ')');
    return dismissed;
  };

  const init = () => {
    const deferredPromptToUse = window.CT_DEFERRED_PROMPT;

    // Logic for iOS
    if (isIOS && !isStandalone && !isDismissed()) {
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('ios');
      }
      setTimeout(showPrompt, 4000);
    }

    // Debugging: Force show for UI testing
    if (window.location.search.includes('debug_pwa=true')) {
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('android');
      }
      setTimeout(showPrompt, 1000);
      return;
    }

    // Logic for Android/Chrome/Windows (Global captured event)
    if (deferredPromptToUse && !isStandalone && !isDismissed()) {
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('android');
      }
      setTimeout(showPrompt, 2000);
    }
  };

  // Run init when ready
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Listen for the beforeinstallprompt event (if missed by bundle)
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: beforeinstallprompt event fired (local listener)');
    e.preventDefault();
    deferredPrompt = e;
    window.CT_DEFERRED_PROMPT = e;

    if (!isStandalone && !isDismissed()) {
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('android');
      }
      setTimeout(showPrompt, 1000);
    }
  });

  // Hide prompt if app is installed
  window.addEventListener('appinstalled', (evt) => {
    hidePrompt();
    deferredPrompt = null;
  });

})();

/**
 * Connect Tag - PWA Install Prompt Component
 * Handles the custom "Install App" banner for better user engagement.
 */
(function() {
  'use strict';

  let deferredPrompt;
  const STORAGE_KEY = 'ct_pwa_prompt_dismissed';
  const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  // Clear cache/dismiss state if requested via URL
  if (window.location.search.includes('reset_pwa=true')) {
    localStorage.removeItem(STORAGE_KEY);
    console.log('PWA: Dismiss state cleared');
  }

  const createPrompt = (type = 'android') => {
    let bodyContent = '';

    if (type === 'ios') {
      bodyContent = `
        <div class="pwa-prompt-icon">
          <img src="${window.CT_BASE_URL}icon-192.png" alt="Connect Tag Logo">
        </div>
        <div class="pwa-prompt-text">
          <h3>تثبيت تطبيق كونكت تاق</h3>
          <p>اضغط على أيقونة <i class="fa-regular fa-share-from-square"></i> ثم <strong>"Add to Home Screen"</strong> لتثبيت التطبيق على جهازك.</p>
        </div>
      `;
    } else {
      bodyContent = `
        <div class="pwa-prompt-icon">
          <img src="${window.CT_BASE_URL}icon-192.png" alt="Connect Tag Logo">
        </div>
        <div class="pwa-prompt-text">
          <h3>تثبيت تطبيق كونكت تاق</h3>
          <p>احصل على وصول أسرع وتجربة أفضل على هاتفك</p>
        </div>
        <button id="pwa-install-btn" class="pwa-install-button">تثبيت</button>
      `;
    }

    const promptHtml = `
      <div id="pwa-install-prompt" class="pwa-prompt-container ${type === 'ios' ? 'is-ios' : ''}">
        <div class="pwa-prompt-content">
          <button class="pwa-prompt-close" aria-label="إغلاق">&times;</button>
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
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`PWA Install Choice: ${outcome}`);
          deferredPrompt = null;
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
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.classList.add('is-visible');
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
    return (Date.now() - parseInt(lastDismissed)) < DISMISS_DURATION;
  };

  const init = () => {
    // Logic for iOS
    if (isIOS && !isStandalone && !isDismissed()) {
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('ios');
      }
      setTimeout(showPrompt, 4000);
    }

    // Debugging: Force show for UI testing
    if (window.location.search.includes('debug_pwa=true')) {
      console.log('PWA: Debug mode active - forcing UI');
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('android');
      }
      setTimeout(showPrompt, 1000);
    }
  };

  // Run init when ready
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Listen for the beforeinstallprompt event (Android/Chrome/Windows)
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;

    if (!isDismissed()) {
      if (!document.getElementById('pwa-install-prompt')) {
        createPrompt('android');
      }
      setTimeout(showPrompt, 3000);
    }
  });

  // Hide prompt if app is installed
  window.addEventListener('appinstalled', (evt) => {
    console.log('Connect Tag PWA was installed');
    hidePrompt();
    deferredPrompt = null;
  });

})();

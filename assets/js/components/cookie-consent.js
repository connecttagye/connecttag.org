/**
 * Connect Tag - Web Component: <cookie-consent>
 * GDPR, Google Consent Mode v2 & Google AdSense Privacy Policy Compliant Cookie Banner.
 */
(function initGoogleConsentModeDefault() {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  const savedChoice = localStorage.getItem('ct_cookie_accepted');
  if (savedChoice === 'true' || savedChoice === 'essential') {
    const granted = savedChoice === 'true' ? 'granted' : 'denied';
    gtag('consent', 'default', {
      'ad_storage': granted,
      'ad_user_data': granted,
      'ad_personalization': granted,
      'analytics_storage': granted
    });
  } else {
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 500
    });
  }
})();

class CookieConsent extends HTMLElement {
  connectedCallback() {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    const savedChoice = localStorage.getItem('ct_cookie_accepted');
    if (savedChoice === 'true' || savedChoice === 'essential') {
      return;
    }

    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';

    this.innerHTML = `
      <div class="ct-cookie-banner" id="ct-cookie-banner" role="dialog" aria-live="polite" aria-label="إشعار ملفات تعريف الارتباط">
        <div class="ct-cookie-content">
          <div class="ct-cookie-text">
            <p>
              نحن وشركاؤنا (بما في ذلك Google) نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح وتحليل الزيارات وتخصيص الإعلانات وفقاً لـ
              <a href="${baseUrl}privacy-policy">سياسة الخصوصية</a>. يمكنك قبول جميع الملفات أو الاكتفاء بالملفات الضرورية فقط.
            </p>
          </div>
          <div class="ct-cookie-actions" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; width:100%;">
            <button class="ct-cookie-btn" id="ct-accept-cookies">موافق على الكل</button>
            <button class="ct-cookie-btn ct-cookie-btn-reject" id="ct-reject-cookies" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); box-shadow:none;">الضرورية فقط</button>
          </div>
        </div>
      </div>
    `;

    const banner = this.querySelector('#ct-cookie-banner');
    const acceptBtn = this.querySelector('#ct-accept-cookies');
    const rejectBtn = this.querySelector('#ct-reject-cookies');

    const closeBanner = (choiceValue, consentState) => {
      localStorage.setItem('ct_cookie_accepted', choiceValue);
      gtag('consent', 'update', {
        'ad_storage': consentState,
        'ad_user_data': consentState,
        'ad_personalization': consentState,
        'analytics_storage': consentState
      });
      if (banner) {
        banner.classList.add('hidden');
        setTimeout(() => {
          this.remove();
        }, 300);
      }
    };

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => closeBanner('true', 'granted'));
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => closeBanner('essential', 'denied'));
    }
  }
}

if (!customElements.get('cookie-consent')) {
  customElements.define('cookie-consent', CookieConsent);
}

// Auto-mount <cookie-consent> on any page where the HTML tag was omitted
function ensureCookieConsentMounted() {
  if (document.body && !document.querySelector('cookie-consent')) {
    document.body.appendChild(document.createElement('cookie-consent'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureCookieConsentMounted);
} else {
  ensureCookieConsentMounted();
}

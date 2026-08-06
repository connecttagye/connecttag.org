/**
 * Connect Tag - Web Component: <cookie-consent>
 * GDPR & Google AdSense Privacy Policy Compliant Cookie Banner.
 */
class CookieConsent extends HTMLElement {
  connectedCallback() {
    if (localStorage.getItem('ct_cookie_accepted')) {
      return; // Already accepted
    }

    this.innerHTML = `
      <div class="ct-cookie-banner" id="ct-cookie-banner">
        <div class="ct-cookie-text">
          <p>
            نحن نستخدم ملفات تعريف الارتباط (Cookies) لضمان تقديم أفضل تجربة للمستخدم وتحسين خدماتنا وإعلاناتنا وفقاً لـ 
            <a href="https://connecttag.org/privacy-policy">سياسة الخصوصية</a>.
          </p>
        </div>
        <button class="ct-cookie-btn" id="ct-accept-cookies">موافق ومتابعة</button>
      </div>
    `;

    const banner = this.querySelector('#ct-cookie-banner');
    const acceptBtn = this.querySelector('#ct-accept-cookies');

    if (acceptBtn && banner) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('ct_cookie_accepted', 'true');
        banner.classList.add('hidden');
        setTimeout(() => {
          this.remove();
        }, 300);
      });
    }
  }
}

customElements.define('cookie-consent', CookieConsent);

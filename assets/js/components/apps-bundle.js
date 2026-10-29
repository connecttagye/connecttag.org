// --- site-app-header.js ---
/**
 * Connect Tag - Web Component: <site-app-header>
 */
class SiteAppHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || '';
    const subtitle = this.getAttribute('subtitle') || '';
    const logo = this.getAttribute('logo') || '';

    this.innerHTML = `
      <div class="ct-app-header">
        <div class="container text-center">
          ${logo ? `<img src="${logo}" class="ct-app-logo" alt="${title}" width="120" height="120" fetchpriority="high">` : ''}
          <h1 class="ct-app-title">${title}</h1>
          <p class="ct-app-subtitle">${subtitle}</p>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('site-app-header')) {
if (!customElements.get('site-app-header')) {
  customElements.define('site-app-header', SiteAppHeader);
}
}


// --- site-app-downloads.js ---
/**
 * Connect Tag - Web Component: <site-app-downloads>
 */
class SiteAppDownloads extends HTMLElement {
  connectedCallback() {
    const googlePlay = this.getAttribute('google-play');
    const appStore = this.getAttribute('app-store');
    const apkLink = this.getAttribute('apk-link');

    this.innerHTML = `
      <div class="ct-app-downloads">
        ${googlePlay ? `
        <a href="${googlePlay}" target="_blank" rel="noopener" class="ct-download-btn google-play">
          <i class="fa-brands fa-google-play"></i>
          <div class="btn-text">
            <span class="small-text">تحميل من</span>
            <span class="large-text">Google Play</span>
          </div>
        </a>` : ''}

        ${appStore ? `
        <a href="${appStore}" target="_blank" rel="noopener" class="ct-download-btn app-store">
          <i class="fa-brands fa-apple"></i>
          <div class="btn-text">
            <span class="small-text">تحميل من</span>
            <span class="large-text">App Store</span>
          </div>
        </a>` : ''}

        ${apkLink ? `
        <a href="${apkLink}" target="_blank" rel="noopener" class="ct-download-btn apk">
          <i class="fa-brands fa-android"></i>
          <div class="btn-text">
            <span class="small-text">تحميل ملف</span>
            <span class="large-text">Direct APK</span>
          </div>
        </a>` : ''}
      </div>
    `;
  }
}if (!customElements.get('site-app-downloads')) {
  customElements.define('site-app-downloads', SiteAppDownloads);
}


// --- site-app-features.js ---
/**
 * Connect Tag - Web Component: <site-app-features>
 * Standard grid for app features/results.
 */
class SiteAppFeatures extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="ct-app-features-grid">
        <slot></slot>
      </div>
    `;
  }
}

class SiteAppFeatureItem extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || '';
    const text = this.getAttribute('text') || '';
    const icon = this.getAttribute('icon') || '';

    this.innerHTML = `
      <div class="ct-feature-card">
        ${icon ? `<i class="fa ${icon}"></i>` : ''}
        <span class="ct-feature-label">${label}</span>
        <p class="ct-feature-text">${text}</p>
      </div>
    `;
  }
}if (!customElements.get('site-app-features')) {
  customElements.define('site-app-features', SiteAppFeatures);
}if (!customElements.get('site-app-feature-item')) {
  customElements.define('site-app-feature-item', SiteAppFeatureItem);
}


// --- site-share-buttons.js ---
/**
 * Connect Tag - Web Component: <site-share-buttons>
 * Dynamic social sharing buttons for articles.
 */
class SiteShareButtons extends HTMLElement {
  connectedCallback() {
    const url = window.location.href;
    const title = document.title;
    const text = this.getAttribute('text') || title;

    const isShareSupported = !!navigator.share;

    this.innerHTML = `
      <div class="ct-share-container">
        <h3 class="ct-share-title" style="margin-top:0;">شارك :</h3>
        <div class="ct-share-grid">
          ${isShareSupported ? `
            <a href="#" class="ct-share-btn native-share" title="مشاركة عبر الهاتف" aria-label="مشاركة عبر الهاتف">
              <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
            </a>
          ` : ''}
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}" target="_blank" rel="noopener" class="ct-share-btn whatsapp" title="مشاركة عبر واتساب" aria-label="مشاركة عبر واتساب">
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" class="ct-share-btn facebook" title="مشاركة عبر فيسبوك" aria-label="مشاركة عبر فيسبوك">
            <i class="fa-brands fa-facebook" aria-hidden="true"></i>
          </a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener" class="ct-share-btn telegram" title="مشاركة عبر تليجرام" aria-label="مشاركة عبر تليجرام">
            <i class="fa-brands fa-telegram" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    `;

    // Add event listener for native share
    if (isShareSupported) {
      this.querySelector('.native-share').addEventListener('click', (e) => {
        e.preventDefault();
        navigator.share({
          title: title,
          text: text,
          url: url
        }).then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      });
    }
  }
}

if (!customElements.get('site-share-buttons')) {
if (!customElements.get('site-share-buttons')) {
  customElements.define('site-share-buttons', SiteShareButtons);
}
}

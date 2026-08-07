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
          <i class="fa fa-play"></i>
          <div class="btn-text">
            <span class="small-text">تحميل من</span>
            <span class="large-text">Google Play</span>
          </div>
        </a>` : ''}

        ${appStore ? `
        <a href="${appStore}" target="_blank" rel="noopener" class="ct-download-btn app-store">
          <i class="fa fa-apple"></i>
          <div class="btn-text">
            <span class="small-text">تحميل من</span>
            <span class="large-text">App Store</span>
          </div>
        </a>` : ''}

        ${apkLink ? `
        <a href="${apkLink}" target="_blank" rel="noopener" class="ct-download-btn apk">
          <i class="fa fa-android"></i>
          <div class="btn-text">
            <span class="small-text">تحميل ملف</span>
            <span class="large-text">Direct APK</span>
          </div>
        </a>` : ''}
      </div>
    `;
  }
}

customElements.define('site-app-downloads', SiteAppDownloads);

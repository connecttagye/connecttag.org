class SiteAppHeader extends HTMLElement {
connectedCallback() {
const title = this.getAttribute('title') || '';
const subtitle = this.getAttribute('subtitle') || '';
const logo = this.getAttribute('logo') || '';
this.innerHTML = `
<div class="ct-app-header"><div class="container text-center">
${logo ? `<img src="${logo}" class="ct-app-logo" alt="${title}" width="120" height="120" fetchpriority="high">` : ''}
<h1 class="ct-app-title">${title}</h1><p class="ct-app-subtitle">${subtitle}</p></div></div>
`;
}
}
if (!customElements.get('site-app-header')) {
customElements.define('site-app-header', SiteAppHeader);
}
class SiteAppDownloads extends HTMLElement {
connectedCallback() {
const googlePlay = this.getAttribute('google-play');
const appStore = this.getAttribute('app-store');
const apkLink = this.getAttribute('apk-link');
this.innerHTML = `
<div class="ct-app-downloads">
${googlePlay ? `
<a href="${googlePlay}" target="_blank" rel="noopener" class="ct-download-btn google-play"><i class="fa-brands fa-google-play"></i><div class="btn-text"><span class="small-text">تحميل من</span><span class="large-text">Google Play</span></div></a>` : ''}
${appStore ? `
<a href="${appStore}" target="_blank" rel="noopener" class="ct-download-btn app-store"><i class="fa-brands fa-apple"></i><div class="btn-text"><span class="small-text">تحميل من</span><span class="large-text">App Store</span></div></a>` : ''}
${apkLink ? `
<a href="${apkLink}" target="_blank" rel="noopener" class="ct-download-btn apk"><i class="fa-brands fa-android"></i><div class="btn-text"><span class="small-text">تحميل ملف</span><span class="large-text">Direct APK</span></div></a>` : ''}
</div>
`;
}
}
if (!customElements.get('site-app-downloads')) {
customElements.define('site-app-downloads', SiteAppDownloads);
}
class SiteAppFeatures extends HTMLElement {
connectedCallback() {
this.innerHTML = `
<div class="ct-app-features-grid"><slot></slot></div>
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
<span class="ct-feature-label">${label}</span><p class="ct-feature-text">${text}</p></div>
`;
}
}
if (!customElements.get('site-app-features')) {
customElements.define('site-app-features', SiteAppFeatures);
}
if (!customElements.get('site-app-feature-item')) {
customElements.define('site-app-feature-item', SiteAppFeatureItem);
}
class SiteShareButtons extends HTMLElement {
connectedCallback() {
const url = window.location.href;
const title = document.title;
const text = this.getAttribute('text') || title;
const isShareSupported = !!navigator.share;
this.innerHTML = `
<div class="ct-share-container"><h3 class="ct-share-title" style="margin-top:0;">شارك :</h3><div class="ct-share-grid">
${isShareSupported ? `
<button type="button" class="ct-share-btn native-share" title="مشاركة عبر الهاتف" aria-label="مشاركة عبر الهاتف" style="border:none;cursor:pointer;"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i></button>` : ''}
<a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}" target="_blank" rel="noopener" class="ct-share-btn whatsapp" title="مشاركة عبر واتساب" aria-label="مشاركة عبر واتساب"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" class="ct-share-btn facebook" title="مشاركة عبر فيسبوك" aria-label="مشاركة عبر فيسبوك"><i class="fa-brands fa-facebook" aria-hidden="true"></i></a><a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener" class="ct-share-btn telegram" title="مشاركة عبر تليجرام" aria-label="مشاركة عبر تليجرام"><i class="fa-brands fa-telegram" aria-hidden="true"></i></a></div></div>
`;
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
customElements.define('site-share-buttons', SiteShareButtons);
}


/**
 * Connect Tag - Web Components: <app-metrics-ribbon> and <app-specs-table>
 * Unified Architecture Components driven by assets/data/apps.json
 */
let appsDataPromise = null;
function getAppsData() {
  if (window.__CT_APPS_DATA__) {
    return Promise.resolve(window.__CT_APPS_DATA__);
  }
  if (!appsDataPromise) {
    const primaryUrl = '/assets/data/apps.json';
    const fallbackUrl = 'https://connecttag.org/assets/data/apps.json';
    appsDataPromise = fetch(primaryUrl)
      .then(res => {
        if (!res.ok) throw new Error('Primary URL failed');
        return res.json();
      })
      .catch(() => fetch(fallbackUrl).then(r => r.json()))
      .then(data => {
        window.__CT_APPS_DATA__ = data;
        return data;
      })
      .catch(err => {
        console.error('Failed to load apps.json', err);
        return {};
      });
  }
  return appsDataPromise;
}

class AppMetricsRibbon extends HTMLElement {
  async connectedCallback() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const fallbackId = pathParts[pathParts.length - 1] || '';
    const appId = this.getAttribute('app-id') || fallbackId;
    const allApps = await getAppsData();
    const data = allApps[appId];
    if (!data) return;

    this.innerHTML = `
      <div class="as-lazy-row-wrapper" data-aos="fade-up">
        <div class="as-metrics-ribbon as-lazy-row">
          <!-- 1. السعر -->
          <div class="as-metric-item as-lazy-card">
            <span class="as-metric-label">السعر</span>
            <span class="as-metric-value">${data.price}</span>
            <span class="as-metric-sub">${data.priceSub}</span>
          </div>
          <div class="as-metric-divider as-lazy-divider"></div>

          <!-- 2. الفئة -->
          <div class="as-metric-item as-lazy-card">
            <span class="as-metric-label">الفئة</span>
            <span class="as-metric-value"><i class="${data.categoryIcon}" style="color: #0071e3; font-size: 20px;"></i></span>
            <span class="as-metric-sub">${data.category}</span>
          </div>
          <div class="as-metric-divider as-lazy-divider"></div>

          <!-- 3. الفئة المستهدفة / العمرية -->
          <div class="as-metric-item as-lazy-card">
            <span class="as-metric-label">${data.targetLabel}</span>
            <span class="as-metric-value">${data.targetValue}</span>
            <span class="as-metric-sub">${data.targetSub}</span>
          </div>
          <div class="as-metric-divider as-lazy-divider"></div>

          <!-- 4. التوافق -->
          <div class="as-metric-item as-lazy-card">
            <span class="as-metric-label">التوافق</span>
            <span class="as-metric-value">${data.platformIcon ? `<i class="${data.platformIcon}" style="color: #0071e3; font-size: 18px;"></i> ` : ''}${data.platform}</span>
            <span class="as-metric-sub">${data.platformSub}</span>
          </div>
          <div class="as-metric-divider as-lazy-divider"></div>

          <!-- 5. اللغات -->
          <div class="as-metric-item as-lazy-card">
            <span class="as-metric-label">اللغات</span>
            <span class="as-metric-value">${data.languages}</span>
            <span class="as-metric-sub">${data.languagesSub}</span>
          </div>
          <div class="as-metric-divider as-lazy-divider"></div>

          <!-- 6. الحجم -->
          <div class="as-metric-item as-lazy-card">
            <span class="as-metric-label">الحجم</span>
            <span class="as-metric-value">${data.size}</span>
            <span class="as-metric-sub">MB</span>
          </div>
        </div>
      </div>
    `;

    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }
}

if (!customElements.get('app-metrics-ribbon')) {
  customElements.define('app-metrics-ribbon', AppMetricsRibbon);
}

class AppSpecsTable extends HTMLElement {
  async connectedCallback() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const fallbackId = pathParts[pathParts.length - 1] || '';
    const appId = this.getAttribute('app-id') || fallbackId;
    const allApps = await getAppsData();
    const data = allApps[appId];
    if (!data) return;

    this.innerHTML = `
      <div class="as-section" data-aos="fade-up">
        <h2 class="as-section-title" style="margin-bottom: 18px;">تفاصيل إضافية</h2>
        <div class="as-info-group">
          <div class="as-info-row">
            <span class="as-info-label">المطور</span>
            <span class="as-info-val">${data.developer}</span>
          </div>
          <div class="as-info-row">
            <span class="as-info-label">المنصة</span>
            <span class="as-info-val">${data.platformIcon ? `<i class="${data.platformIcon}" style="color: #3ddc84; margin-left: 6px;"></i> ` : ''}${data.platformInfo}</span>
          </div>
          <div class="as-info-row">
            <span class="as-info-label">الجهة المستفيدة</span>
            <span class="as-info-val">${data.isCustomClient ? '<i class="fa-solid fa-lock" style="color: #64748b; margin-left: 6px; font-size: 13px;"></i> ' : ''}${data.audience}</span>
          </div>
          <div class="as-info-row">
            <span class="as-info-label">معرّف التطبيق</span>
            <span class="as-info-val" style="font-family: monospace; font-size: 13px;">${data.packageId}</span>
          </div>
          <div class="as-info-row">
            <span class="as-info-label">سياسة الخصوصية</span>
            <span class="as-info-val"><a href="${data.privacyPolicyUrl}">عرض السياسة</a></span>
          </div>
          <div class="as-info-row">
            <span class="as-info-label">شروط الاستخدام</span>
            <span class="as-info-val"><a href="${data.termsOfUseUrl}">عرض الشروط</a></span>
          </div>
          ${data.deleteDataUrl ? `
          <div class="as-info-row">
            <span class="as-info-label">حذف الحساب والبيانات</span>
            <span class="as-info-val"><a href="${data.deleteDataUrl}">بوابة الحذف وإلغاء الإدراج</a></span>
          </div>` : ''}
          ${data.supportEmail ? `
          <div class="as-info-row">
            <span class="as-info-label">الدعم الفني</span>
            <span class="as-info-val"><a href="mailto:${data.supportEmail}">${data.supportEmail}</a></span>
          </div>` : ''}
        </div>
      </div>
    `;

    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
  }
}

if (!customElements.get('app-specs-table')) {
  customElements.define('app-specs-table', AppSpecsTable);
}

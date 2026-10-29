(function() {
'use strict';
window.CT_DEFERRED_PROMPT = null;
window.addEventListener('beforeinstallprompt', (e) => {
e.preventDefault();
window.CT_DEFERRED_PROMPT = e;
});
const getBaseUrl = () => {
const { hostname, origin, pathname } = window.location;
if (hostname.includes('connecttag.org') && !hostname.includes('github.io')) {
return origin + '/';
}
if (hostname.includes('github.io')) {
const parts = pathname.split('/').filter(Boolean);
if (parts.length > 0 && parts[0].includes('connecttag')) {
return origin + '/' + parts[0] + '/';
}
}
const scripts = document.getElementsByTagName('script');
for (let i = 0; i < scripts.length; i++) {
const src = scripts[i].src;
if (src.includes('assets/js/components/components-bundle.js')) {
return src.split('assets/js/components/components-bundle.js')[0];
}
}
return origin + '/';
};
window.CT_BASE_URL = getBaseUrl();
})();
(function () {
'use strict';
const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
if ('serviceWorker' in navigator) {
const hadController = Boolean(navigator.serviceWorker.controller);
const registerSW = () => {
const swPath = baseUrl.endsWith('/') ? baseUrl + 'sw.js' : baseUrl + '/sw.js';
navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
.catch(() => {});
};
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
if (hadController && !refreshing) {
refreshing = true;
window.location.reload();
}
});
const scheduleSW = () => {
if ('requestIdleCallback' in window) {
window.requestIdleCallback(registerSW, { timeout: 4000 });
} else {
setTimeout(registerSW, 2000);
}
};
if (document.readyState === 'complete') {
scheduleSW();
} else {
window.addEventListener('load', scheduleSW, { once: true });
}
}
})();
class SitePreloader extends HTMLElement {
connectedCallback() {
if (document.body.classList.contains('preloader-visible')) {
document.body.classList.remove('preloader-visible');
document.body.style.overflow = '';
}
document.body.classList.add('loaded', 'page-entered');
const home = document.getElementById('home-content');
if (home) {
home.classList.add('visible');
}
}
}
if (!customElements.get('site-preloader')) {
customElements.define('site-preloader', SitePreloader);
}
class SiteHeader extends HTMLElement {
connectedCallback() {
const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
const currentHref = window.location.href.toLowerCase();
const currentPath = window.location.pathname.toLowerCase();
const isActive = (targetUrl) => {
const target = targetUrl.toLowerCase().replace(/\/$/, '');
if (!target) return false;
return currentHref === target || currentHref.startsWith(target + '/') || currentPath === target;
};
const isHome = currentPath === '/' || currentPath === '/index.html' || currentHref === (baseUrl + '/').toLowerCase();
const isCompanyPage = [
'/company/',
'/company/index.html',
'/company/our-company',
'/company/our-company.html'
].includes(currentPath);
this.innerHTML = `
<header class="ct-header-navbar"><a href="#main-content" class="ct-skip-link">تخطي إلى المحتوى الرئيسي</a><div class="ct-header-container"><a href="${baseUrl}/" class="ct-logo-brand" aria-label="كونكت تاق - الصفحة الرئيسية"><img src="${baseUrl}/assets/img/connect-tag-horizontal-light.webp?v=1.1.35" alt="كونكت تاق - Connect Tag" width="105" height="42" /></a><nav aria-label="التنقل الرئيسي"><ul class="ct-nav-menu" id="ct-nav-menu"><li class="ct-nav-item ${isHome ? 'active' : ''}"><a href="${baseUrl}/" class="ct-nav-link" ${isHome ? 'aria-current="page"' : ''}>الرئيسية</a></li><li class="ct-nav-item ${isCompanyPage ? 'active' : ''}"><a href="${baseUrl}/company/" class="ct-nav-link" ${isCompanyPage ? 'aria-current="page"' : ''}>من نحن</a></li><li class="ct-nav-item ${isActive(baseUrl + '/company/projects/') ? 'active' : ''}"><a href="${baseUrl}/company/projects/" class="ct-nav-link" ${isActive(baseUrl + '/company/projects/') ? 'aria-current="page"' : ''}>أعمالنا</a></li><li class="ct-nav-item ${isActive(baseUrl + '/company/services/') ? 'active' : ''}"><a href="${baseUrl}/company/services/" class="ct-nav-link" ${isActive(baseUrl + '/company/services/') ? 'aria-current="page"' : ''}>الخدمات</a></li><li class="ct-nav-item ${isActive(baseUrl + '/blog/') ? 'active' : ''}"><a href="${baseUrl}/blog/" class="ct-nav-link" ${isActive(baseUrl + '/blog/') ? 'aria-current="page"' : ''}>المدونة</a></li><li class="ct-nav-item ${isActive(baseUrl + '/store/') ? 'active' : ''}"><a href="${baseUrl}/store/" class="ct-nav-link" ${isActive(baseUrl + '/store/') ? 'aria-current="page"' : ''}>المتجر</a></li><li class="ct-nav-item ${isActive(baseUrl + '/tools/') ? 'active' : ''}"><a href="${baseUrl}/tools/" class="ct-nav-link" ${isActive(baseUrl + '/tools/') ? 'aria-current="page"' : ''}>الأدوات</a></li></ul></nav><button type="button" class="ct-mobile-toggle" aria-label="فتح القائمة الرئيسية" aria-expanded="false" aria-controls="ct-nav-menu" id="ct-menu-btn"><i class="fa-solid fa-bars" aria-hidden="true"></i></button></div></header>
`;
if (!document.getElementById('main-content')) {
const mainEl = document.querySelector('main') || this.nextElementSibling;
if (mainEl && !mainEl.id) {
mainEl.id = 'main-content';
}
}
const toggleBtn = this.querySelector('#ct-menu-btn');
const menu = this.querySelector('#ct-nav-menu');
if (toggleBtn && menu) {
toggleBtn.addEventListener('click', () => {
const isOpen = menu.classList.toggle('open');
toggleBtn.setAttribute('aria-expanded', isOpen);
toggleBtn.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && menu.classList.contains('open')) {
menu.classList.remove('open');
toggleBtn.setAttribute('aria-expanded', 'false');
toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
toggleBtn.focus();
}
});
menu.querySelectorAll('a').forEach(link => {
link.addEventListener('click', () => {
menu.classList.remove('open');
toggleBtn.setAttribute('aria-expanded', 'false');
toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
});
});
}
}
}
if (!customElements.get('site-header')) {
customElements.define('site-header', SiteHeader);
}
class SiteFooter extends HTMLElement {
connectedCallback() {
const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
const currentYear = new Date().getFullYear();
this.innerHTML = `
<footer class="ct-footer-main"><div class="ct-footer-grid"><div class="ct-footer-col"><h2 class="ct-footer-heading">كونكت تاق</h2><p>كونكت تاق للخدمات والمستلزمات التقنية والتسويق الرقمي. شركة يمنية رائدة في تقديم الحلول البرمجية والأنظمة المحاسبية بأعلى معايير الجودة والاحترافية.</p><div class="ct-social-icons"><a href="https://www.facebook.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Facebook" aria-label="فيسبوك - Facebook"><i class="fa-brands fa-facebook" aria-hidden="true"></i></a><a href="https://x.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="X (Twitter)" aria-label="منصة إكس - X (Twitter)"><svg aria-hidden="true" style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a><a href="https://www.instagram.com/connecttagye/" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Instagram" aria-label="إنستغرام - Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a><a href="https://www.linkedin.com/in/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="LinkedIn" aria-label="لينكد إن - LinkedIn"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a><a href="https://www.pinterest.com/connecttagye/" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Pinterest" aria-label="بينتريست - Pinterest"><i class="fa-brands fa-pinterest" aria-hidden="true"></i></a><a href="https://whatsapp.com/channel/0029VaasCef8qIztDeS8Sp1R" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="WhatsApp Channel" aria-label="قناة واتساب - WhatsApp Channel"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a><a href="https://www.youtube.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="YouTube" aria-label="يوتيوب - YouTube"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a><a href="https://t.me/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Telegram" aria-label="تيليجرام - Telegram"><i class="fa-brands fa-telegram" aria-hidden="true"></i></a><a href="https://www.tiktok.com/@connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="TikTok" aria-label="تيك توك - TikTok"><svg aria-hidden="true" style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.64-.13.47-.1.99.09 1.44.35 1.03 1.5 1.74 2.59 1.61.88-.04 1.65-.58 2.02-1.37.15-.33.24-.69.24-1.05V0z"/></svg></a><a href="https://www.snapchat.com/add/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Snapchat" aria-label="سناب شات - Snapchat"><i class="fa-brands fa-snapchat" aria-hidden="true"></i></a></div></div><div class="ct-footer-col"><h2 class="ct-footer-heading">من نحن وهويتنا</h2><ul class="ct-footer-links"><li><a href="${baseUrl}/"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> الرئيسية</a></li><li><a href="${baseUrl}/company/"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> من نحن</a></li><li><a href="${baseUrl}/company/our-company"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> الشركة</a></li><li><a href="${baseUrl}/company/support/"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> الدعم والطلبات</a></li><li><a href="${baseUrl}/company/support/faq"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> الأسئلة الشائعة</a></li><li><a href="${baseUrl}/contact"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> اتصل بنا</a></li></ul></div><div class="ct-footer-col"><h2 class="ct-footer-heading">أعمالنا وخدماتنا</h2><ul class="ct-footer-links"><li><a href="${baseUrl}/company/projects/"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> معرض الأعمال</a></li><li><a href="${baseUrl}/company/projects/apps/"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> التطبيقات</a></li><li><a href="${baseUrl}/company/projects/sites/"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> المواقع</a></li><li><a href="${baseUrl}/about"><i class="fa-solid fa-angle-left" aria-hidden="true"></i> حول هذا الموقع</a></li></ul></div><div class="ct-footer-col"><h2 class="ct-footer-heading">معلومات التواصل</h2><p><i class="fa-solid fa-location-dot" style="color: var(--ct-secondary);" aria-hidden="true"></i> اليمن، صنعاء</p><p><i class="fa-solid fa-envelope" style="color: var(--ct-secondary);" aria-hidden="true"></i> info@connecttag.org</p><div class="ct-qr-contact" style="margin-top: 15px;"><img src="${baseUrl}/assets/img/qr-contact.webp"
alt="رمز الاستجابة السريعة للتواصل مع كونكت تاق"
width="100"
height="100"
style="border: 5px solid #fff; border-radius: 8px; width: 100px; height: 100px; background: #fff;"
loading="lazy"></div></div></div><div class="ct-footer-bottom"><div class="ct-footer-bottom-container"><p style="margin: 0; font-size: 13px; color: #94a3b8;">
جميع الحقوق محفوظة &copy; ${currentYear} | تم التطوير بواسطة
<a href="${baseUrl}/" class="ct-footer-credit-link">Connect Tag</a></p><ul class="ct-footer-legal-links"><li><a href="${baseUrl}/privacy-policy">سياسة الخصوصية</a></li><li><a href="${baseUrl}/terms-of-use">اتفاقية الاستخدام</a></li><li><a href="${baseUrl}/company/support/order">طلب خدمة</a></li><li><a href="${baseUrl}/contact">الدعم الفني</a></li></ul></div></div></footer><button type="button" id="back-to-top" title="العودة للأعلى" aria-label="العودة للأعلى"><i class="fa-solid fa-chevron-up" aria-hidden="true"></i></button>
`;
}
}
if (!customElements.get('site-footer')) {
customElements.define('site-footer', SiteFooter);
}
class SiteBreadcrumb extends HTMLElement {
static get observedAttributes() {
return ['items'];
}
attributeChangedCallback(name, oldValue, newValue) {
if (name === 'items' && oldValue !== newValue && this.isConnected) {
this.render();
}
}
connectedCallback() {
this.render();
}
render() {
const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
const itemsAttr = this.getAttribute('items');
let breadcrumbItems = [];
if (itemsAttr) {
try {
breadcrumbItems = JSON.parse(itemsAttr);
} catch (e) {
console.error('Breadcrumb JSON parse error:', e);
}
}
if (!breadcrumbItems.length) {
const pathSegments = window.location.pathname.split('/').filter(Boolean);
breadcrumbItems.push({ title: 'الرئيسية', url: baseUrl.replace(/\/+$/, '') + '/' });
const segmentMap = {
'blog': 'المدونة',
'projects': 'أعمالنا',
'apps': 'التطبيقات',
'sites': 'أعمال الويب',
'design': 'أعمال التصميم',
'bots': 'بوتات تليجرام',
'desktop': 'برامج سطح المكتب',
'libraries': 'المكاتب البرمجية',
'store': 'المتجر',
'tools': 'الأدوات',
'telecom': 'الاتصالات والإنترنت',
'web': 'أدوات الويب',
'mobile': 'تطبيقات الجوال',
'security': 'الأمن والخصوصية',
'finance': 'الخدمات المالية',
'energy': 'حساب الطاقة',
'misc': 'أدوات متنوعة',
'services': 'الخدمات',
'company': 'الشركة',
'commerce': 'الطلبات والدفع',
'advertising': 'أعلن معنا',
'our-network': 'شبكتنا الإعلانية',
'third-party-networks': 'شبكات الإعلانات الخارجية',
'support': 'الدعم والطلبات',
'hardware-solutions': 'دليل المنتجات',
'api-solutions': 'حلول الـ API والبيانات',
'store': 'المتجر',
'products': 'الأجهزة والمنتجات',
'databases': 'قواعد البيانات وجداول التهيئة',
'digital-assets': 'التراخيص والاشتراكات البرمجية',
'licenses': 'التراخيص والاشتراكات',
'crypto-exchange': 'بيع وشراء العملات المشفرة',
'local-seo': 'خرائط Google والسيو المحلي',
'about': 'من نحن',
'our-company': 'عن الشركة',
'about-site': 'حول الموقع',
'contact': 'اتصل بنا',
'faq': 'الأسئلة الشائعة',
'payment-methods': 'طرق الدفع',
'advertise': 'أعلن معنا',
'advertise.html': 'أعلن معنا'
};
let currentAccUrl = baseUrl.replace(/\/+$/, '') + '/';
pathSegments.forEach((seg, idx) => {
const skipSegments = ['connecttag.org', 'connecttagsite', 'index', 'index.html', 'index.php', ''];
if (skipSegments.includes(seg.toLowerCase())) return;
const isHtml = seg.endsWith('.html');
const cleanSeg = seg.replace(/\.(html|php)$/i, '');
const isLast = idx === pathSegments.length - 1;
currentAccUrl += cleanSeg;
if (!isHtml && (!isLast || window.location.pathname.endsWith('/'))) {
currentAccUrl += '/';
}
let title = decodeURIComponent(cleanSeg);
if (segmentMap[title.toLowerCase()]) {
title = segmentMap[title.toLowerCase()];
} else {
title = title.replace(/-/g, ' ');
title = title.charAt(0).toUpperCase() + title.slice(1);
}
breadcrumbItems.push({
title: title,
url: currentAccUrl
});
});
}
const listHtml = breadcrumbItems.map((item, index) => {
const isLast = index === breadcrumbItems.length - 1;
const idAttr = item.id ? ` id="${item.id}"` : '';
return `
<li class="ct-breadcrumb-item ${isLast ? 'active' : ''}">
${isLast ? `<span${idAttr}>${item.title}</span>` : `<a href="${item.url || '#'}"${idAttr}>${item.title}</a>`}
${!isLast ? '<span class="ct-breadcrumb-separator" aria-hidden="true"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></span>' : ''}
</li>
`;
}).join('');
this.innerHTML = `
<nav aria-label="مسار التصفح" class="ct-breadcrumb-container"><ol class="ct-breadcrumb-list">
${listHtml}
</ol></nav>
`;
this.injectSchema(breadcrumbItems);
}
injectSchema(items) {
const existingScript = document.getElementById('ds-breadcrumb-schema');
if (existingScript) existingScript.remove();
const hasStaticBreadcrumb = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
.some(script => script.textContent && script.textContent.includes('"BreadcrumbList"'));
if (hasStaticBreadcrumb) return;
const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
const canonicalEl = document.querySelector('link[rel="canonical"]');
const pageUrl = canonicalEl ? canonicalEl.href : window.location.href;
const schemaData = {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": items.map((item, index) => {
const isLast = index === items.length - 1;
let absoluteUrl = item.url;
if (!absoluteUrl || absoluteUrl === '#' || absoluteUrl.trim() === '') {
absoluteUrl = isLast ? pageUrl : (baseUrl.replace(/\/+$/, '') + '/');
} else if (!absoluteUrl.startsWith('http://') && !absoluteUrl.startsWith('https://') && !absoluteUrl.startsWith('/')) {
try {
absoluteUrl = new URL(item.url, window.location.href).href;
} catch (e) {
absoluteUrl = baseUrl.replace(/\/+$/, '') + '/' + item.url.replace(/^\.\//, '');
}
} else if (absoluteUrl.startsWith('/')) {
if (absoluteUrl.startsWith('/http')) {
absoluteUrl = absoluteUrl.replace(/^\/+/, '');
} else {
absoluteUrl = baseUrl.replace(/\/+$/, '') + absoluteUrl;
}
}
absoluteUrl = absoluteUrl.replace(/([^:])\/\/+/g, '$1/');
return {
"@type": "ListItem",
"position": index + 1,
"name": item.title,
"item": absoluteUrl
};
})
};
const script = document.createElement('script');
script.id = 'ds-breadcrumb-schema';
script.type = 'application/ld+json';
script.text = JSON.stringify(schemaData);
document.head.appendChild(script);
}
}
if (!customElements.get('site-breadcrumb')) {
customElements.define('site-breadcrumb', SiteBreadcrumb);
}
class SiteCodeBlock extends HTMLElement {
connectedCallback() {
const language = this.getAttribute('language') || 'Code';
const title = this.getAttribute('title') || '';
const codeContent = this.innerHTML.trim();
this.innerHTML = `
<div class="ct-code-wrapper"><div class="ct-code-header"><div class="ct-code-controls"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="ct-code-title">${title || language}</div><button type="button" class="ct-copy-btn" title="نسخ الكود" aria-label="نسخ الكود"><i class="fa-regular fa-copy" aria-hidden="true"></i><span class="copy-text">نسخ</span></button></div><div class="ct-code-body"><pre><code class="language-${language.toLowerCase()}">${this.escapeHtml(codeContent)}</code></pre></div></div>
`;
const copyBtn = this.querySelector('.ct-copy-btn');
copyBtn.addEventListener('click', () => {
navigator.clipboard.writeText(codeContent).then(() => {
const icon = copyBtn.querySelector('i');
const text = copyBtn.querySelector('.copy-text');
icon.className = 'fa-solid fa-check';
text.textContent = 'تم النسخ';
copyBtn.classList.add('copied');
setTimeout(() => {
icon.className = 'fa-regular fa-copy';
text.textContent = 'نسخ';
copyBtn.classList.remove('copied');
}, 2000);
});
});
}
escapeHtml(text) {
const map = {
'&': '&amp;',
'<': '&lt;',
'>': '&gt;',
'"': '&quot;',
"'": '&#039;'
};
return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
}
if (!customElements.get('site-code-block')) {
customElements.define('site-code-block', SiteCodeBlock);
}
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
<div class="ct-cookie-banner" id="ct-cookie-banner" role="dialog" aria-live="polite" aria-label="إشعار ملفات تعريف الارتباط"><div class="ct-cookie-content"><div class="ct-cookie-text"><p>
نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل الزيارات وعرض الإعلانات وفقاً لـ
<a href="${baseUrl}privacy-policy">سياسة الخصوصية</a>.
</p></div><div class="ct-cookie-actions" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; width:100%;"><button class="ct-cookie-btn" id="ct-accept-cookies">موافق على الكل</button><button class="ct-cookie-btn ct-cookie-btn-reject" id="ct-reject-cookies" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); box-shadow:none;">الضرورية فقط</button></div></div></div>
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
(function() {
'use strict';
let deferredPrompt = null;
const STORAGE_KEY = 'ct_pwa_prompt_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone;
if (window.location.search.includes('reset_pwa=true')) {
localStorage.removeItem(STORAGE_KEY);
}
const createPrompt = (type = 'android') => {
let bodyContent = '';
if (type === 'ios') {
bodyContent = `
<div class="pwa-prompt-icon"><img src="${window.CT_BASE_URL}icon-192.png" alt="Connect Tag Logo" width="40" height="40"></div><div class="pwa-prompt-text"><h3>تثبيت تطبيق كونكت تاق</h3><p>اضغط على أيقونة <i class="fa-regular fa-share-from-square" aria-hidden="true"></i> ثم <strong>"Add to Home Screen"</strong> لتثبيت التطبيق على جهازك.</p></div>
`;
} else {
bodyContent = `
<div class="pwa-prompt-icon"><img src="${window.CT_BASE_URL}icon-192.png" alt="Connect Tag Logo" width="40" height="40"></div><div class="pwa-prompt-text"><h3>تثبيت تطبيق كونكت تاق</h3><p>احصل على وصول أسرع وتجربة أفضل على هاتفك</p></div><button type="button" id="pwa-install-btn" class="pwa-install-button">تثبيت</button>
`;
}
const promptHtml = `
<div id="pwa-install-prompt" class="pwa-prompt-container ${type === 'ios' ? 'is-ios' : ''}"><div class="pwa-prompt-content"><button type="button" class="pwa-prompt-close" aria-label="إغلاق">&times;</button><div class="pwa-prompt-body">
${bodyContent}
</div></div></div>
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
if (isIOS && !isStandalone && !isDismissed()) {
if (!document.getElementById('pwa-install-prompt')) {
createPrompt('ios');
}
setTimeout(showPrompt, 4000);
}
if (window.location.search.includes('debug_pwa=true')) {
if (!document.getElementById('pwa-install-prompt')) {
createPrompt('android');
}
setTimeout(showPrompt, 1000);
return;
}
if (deferredPromptToUse && !isStandalone && !isDismissed()) {
if (!document.getElementById('pwa-install-prompt')) {
createPrompt('android');
}
setTimeout(showPrompt, 2000);
}
};
if (document.readyState === 'complete') {
init();
} else {
window.addEventListener('load', init);
}
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
window.addEventListener('appinstalled', (evt) => {
hidePrompt();
deferredPrompt = null;
});
})();
(function() {
'use strict';
function hidePreloader() {
const preloader = document.getElementById('preloader') || document.getElementById('preloader-skeleton');
if (document.body.classList.contains('preloader-visible')) {
document.body.classList.remove('preloader-visible');
document.body.style.overflow = '';
}
document.body.classList.add('loaded', 'page-entered');
if (!preloader || preloader.classList.contains('preloader-hidden')) return;
preloader.classList.add('preloader-hidden');
setTimeout(() => {
preloader.style.display = 'none';
}, 500);
}
if (document.readyState === 'interactive' || document.readyState === 'complete') {
hidePreloader();
} else {
document.addEventListener('DOMContentLoaded', hidePreloader, { once: true });
}
})();
(function() {
'use strict';
function initSiteLogic() {
function triggerAOS() {
            setTimeout(() => {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800,
                        once: true,
                        startEvent: 'DOMContentLoaded'
                    });
                } else {
                    document.querySelectorAll('[data-aos]').forEach(el => {
                        el.classList.add('aos-animate');
                        el.removeAttribute('data-aos');
                    });
                }
            }, 50);
        }

        triggerAOS();
const backToTop = document.getElementById('back-to-top');
const homeSection = document.getElementById('home');
if (backToTop && homeSection) {
const bttObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
backToTop.style.opacity = "0";
setTimeout(() => { if(!backToTop.matches(':hover')) backToTop.style.display = "none"; }, 300);
} else {
backToTop.style.display = "flex";
setTimeout(() => { backToTop.style.opacity = "1"; }, 10);
}
});
}, { threshold: 0.1 });
bttObserver.observe(homeSection);
backToTop.addEventListener('click', function(e) {
e.preventDefault();
window.scrollTo({ top: 0, behavior: 'smooth' });
});
}
const statsSection = document.getElementById('stats');
const counters = document.querySelectorAll('.counter');
if (statsSection && counters.length > 0) {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
startCounters();
observer.unobserve(entry.target);
}
});
}, { threshold: 0.5 });
observer.observe(statsSection);
function startCounters() {
counters.forEach(counter => {
const target = parseInt(counter.getAttribute('data-target'));
const duration = 2000;
let current = 0;
const timer = setInterval(() => {
current += Math.ceil(target / (duration / 50));
if (current >= target) {
counter.innerText = target + "+";
clearInterval(timer);
} else {
counter.innerText = current;
}
}, 50);
});
}
}
const typedTextSpan = document.querySelector("#typed-text");
if (typedTextSpan) {
const textArray = ["كونكت تاق", "حلولك التقنية", "شريكك الرقمي"];
const typingSpeed = 150;
const erasingSpeed = 100;
const newTextDelay = 2000;
let textArrayIndex = 0;
let charIndex = textArray[0].length;
function type() {
if (charIndex < textArray[textArrayIndex].length) {
typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex + 1);
charIndex++;
setTimeout(type, typingSpeed);
} else {
setTimeout(erase, newTextDelay);
}
}
function erase() {
if (charIndex > 0) {
typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
charIndex--;
setTimeout(erase, erasingSpeed);
} else {
textArrayIndex++;
if (textArrayIndex >= textArray.length) textArrayIndex = 0;
setTimeout(type, typingSpeed + 500);
}
}
if (textArray.length) setTimeout(erase, newTextDelay + 2500);
}
const navLinks = document.querySelectorAll('.ct-nav-link, .page-scroll');
navLinks.forEach(anchor => {
anchor.addEventListener('click', function(e) {
const href = this.getAttribute('href');
if (href && href.startsWith('#') && href.length > 1) {
const targetElement = document.querySelector(href);
if (targetElement) {
e.preventDefault();
const offsetTop = targetElement.offsetTop - 70;
window.scrollTo({
top: offsetTop,
behavior: 'smooth'
});
const menu = document.getElementById('ct-nav-menu');
if (menu && menu.classList.contains('open')) {
const btn = document.getElementById('ct-menu-btn');
if (btn) btn.click();
}
}
}
});
});
const sections = document.querySelectorAll('div[id]');
const navItems = document.querySelectorAll('.ct-nav-item');
if (sections.length > 0 && navItems.length > 0) {
const observerOptions = {
root: null,
rootMargin: '-20% 0px -70% 0px',
threshold: 0
};
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const id = entry.target.getAttribute('id');
navItems.forEach(item => {
item.classList.remove('active');
const link = item.querySelector('a');
if (link && link.getAttribute('href') === `#${id}`) {
item.classList.add('active');
}
});
}
});
}, observerOptions);
sections.forEach(section => observer.observe(section));
}
const mobileToggle = document.getElementById('ct-menu-btn');
if (mobileToggle) {
mobileToggle.addEventListener('click', function() {
let overlay = document.querySelector('.nav-overlay');
if (!overlay) {
overlay = document.createElement('div');
overlay.className = 'nav-overlay';
overlay.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:998;";
document.body.appendChild(overlay);
overlay.addEventListener('click', () => {
mobileToggle.click();
});
}
setTimeout(() => {
const isOpen = document.getElementById('ct-nav-menu').classList.contains('open');
if (isOpen) {
overlay.style.display = 'block';
overlay.style.opacity = '1';
} else {
overlay.style.opacity = '0';
setTimeout(() => { overlay.style.display = 'none'; }, 300);
}
}, 10);
});
}
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initSiteLogic);
} else {
initSiteLogic();
}
})();
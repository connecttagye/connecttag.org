/**
 * Connect Tag - Web Component: <site-preloader>
 * Non-blocking instant content reveal for optimal Core Web Vitals (FCP & LCP).
 */
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

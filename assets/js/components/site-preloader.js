/**
 * Connect Tag - Web Component: <site-preloader>
 * Non-blocking instant content reveal for optimal Core Web Vitals (FCP & LCP).
 */
class SitePreloader extends HTMLElement {
  connectedCallback() {
    document.body.classList.remove('preloader-visible');
    document.body.classList.add('loaded', 'page-entered');
    document.body.style.overflow = 'auto';
    const home = document.getElementById('home-content');
    if (home) {
      home.classList.add('visible');
    }
  }
}
if (!customElements.get('site-preloader')) {
  customElements.define('site-preloader', SitePreloader);
}

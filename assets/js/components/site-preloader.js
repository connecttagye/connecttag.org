/**
 * Connect Tag - Web Component: <site-preloader>
 * Centralized Preloader UI & Logic for optimal performance.
 */
class SitePreloader extends HTMLElement {
  connectedCallback() {
    // 1. Render Skeleton Preloader HTML
    this.innerHTML = `
      <div id="preloader-skeleton">
          <div class="skeleton-header">
              <div class="skeleton-box skeleton-logo"></div>
              <div class="skeleton-box skeleton-nav"></div>
          </div>
          <div class="skeleton-box skeleton-hero"></div>
          <div class="skeleton-box skeleton-text-center"></div>
          <div class="skeleton-box skeleton-text-center" style="width: 40%"></div>
          <div class="skeleton-box skeleton-btn"></div>
      </div>
    `;

    // Wait for page to load then hide skeleton
    window.addEventListener('load', () => {
      const skeleton = document.getElementById('preloader-skeleton');
      if (skeleton) {
        skeleton.style.opacity = '0';
        skeleton.style.visibility = 'hidden';
        setTimeout(() => skeleton.remove(), 500);
      }
      this.prepareContent();
    });
  }

  prepareContent() {
    // We target 'home-content' which is the main wrapper in most pages.
    // We do this via CSS class to ensure smooth transition managed by shared-styles.css
    const home = document.getElementById('home-content');
    if (home) {
      // We don't force opacity=1 here anymore, instead we let site-scripts.js
      // handle the 'page-entered' class which triggers the CSS transition.
      home.classList.add('visible');
    }
  }
}

customElements.define('site-preloader', SitePreloader);

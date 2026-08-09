/**
 * Connect Tag - Web Component: <site-preloader>
 * Centralized Preloader UI & Logic for optimal performance.
 */
class SitePreloader extends HTMLElement {
  connectedCallback() {
    // 1. Render Preloader HTML
    this.innerHTML = `
      <div id="preloader">
          <div class="preloader-bg"></div>
          <div class="preloader-content">
              <div class="loader-logo">
                  <i class="fa fa-terminal"></i>
                  <span>ConnectTag</span>
              </div>
              <div id="loader-log" class="loader-status">> System Ready...</div>
              <div class="progress-container">
                  <div id="progress-fill" class="progress-bar"></div>
              </div>
          </div>
      </div>
    `;

    // 2. Immediate Logic to ensure home-content is prepared
    // This replaces the inline script that was duplicated in every page.
    this.prepareContent();
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

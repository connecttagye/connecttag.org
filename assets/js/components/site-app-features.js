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
}

customElements.define('site-app-features', SiteAppFeatures);
customElements.define('site-app-feature-item', SiteAppFeatureItem);

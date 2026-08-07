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
          ${logo ? `<img src="${logo}" class="ct-app-logo" alt="${title}" loading="lazy">` : ''}
          <h1 class="ct-app-title">${title}</h1>
          <p class="ct-app-subtitle">${subtitle}</p>
        </div>
      </div>
    `;
  }
}

customElements.define('site-app-header', SiteAppHeader);

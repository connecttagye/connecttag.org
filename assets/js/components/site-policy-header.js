/**
 * Connect Tag - Web Component: <site-policy-header>
 */
class SitePolicyHeader extends HTMLElement {
  connectedCallback() {
    const titleAr = this.getAttribute('title-ar') || 'سياسة الخصوصية';
    const titleEn = this.getAttribute('title-en') || 'Privacy Policy';
    const backLink = this.getAttribute('back-link') || './';

    this.innerHTML = `
      <div class="ct-policy-header">
        <div class="container text-center">
          <div class="ct-policy-titles">
            <h1>${titleAr}</h1>
            <h2 class="subtitle-en">${titleEn}</h2>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('site-policy-header', SitePolicyHeader);

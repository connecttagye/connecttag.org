/**
 * Connect Tag - Web Component: <site-author-box>
 * Displays a rich author profile card at the end of articles.
 */
class SiteAuthorBox extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const name = this.getAttribute('name') || 'فريق كونكت تاق';
    const avatar = this.getAttribute('avatar') || baseUrl + 'assets/img/connect-tag-official-logo.webp';
    const link = this.getAttribute('link') || (name === 'فريق كونكت تاق' ? baseUrl + 'author/official' : baseUrl + 'author/');

    this.innerHTML = `
      <a href="${link}" class="ct-author-card-simple">
        <div class="ct-author-avatar">
          <img src="${avatar}" alt="${name}" loading="lazy">
        </div>
        <div class="ct-author-info">
          <span class="ct-author-label">الكاتب</span>
          <h4 class="ct-author-name">${name}</h4>
        </div>
        <div class="ct-author-arrow">
          <i class="fa-solid fa-chevron-left"></i>
        </div>
      </a>
    `;
  }
}

customElements.define('site-author-box', SiteAuthorBox);

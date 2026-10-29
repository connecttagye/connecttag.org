/**
 * Connect Tag - Web Component: <site-author-box>
 * Displays a rich author profile card at the end of articles.
 */
class SiteAuthorBox extends HTMLElement {
  connectedCallback() {
    const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
    const name = this.getAttribute('name') || 'فريق كونكت تاق';
    const avatar = this.getAttribute('avatar') || `${baseUrl}/assets/img/connect-tag-official-logo.webp`;
    const link = this.getAttribute('link') || (name === 'فريق كونكت تاق' ? `${baseUrl}/blog/authors/official` : `${baseUrl}/blog/authors/`);

    this.innerHTML = `
      <a href="${link}" class="ct-author-card-simple">
        <div class="ct-author-avatar">
          <img src="${avatar}" alt="${name}" width="45" height="45" loading="lazy">
        </div>
        <div class="ct-author-info">
          <span class="ct-author-label">الكاتب</span>
          <span class="ct-author-name">${name}</span>
        </div>
        <div class="ct-author-arrow" aria-hidden="true">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </div>
      </a>
    `;
  }
}

if (!customElements.get('site-author-box')) {
if (!customElements.get('site-author-box')) {
  customElements.define('site-author-box', SiteAuthorBox);
}
}

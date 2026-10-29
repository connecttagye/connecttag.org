/**
 * Connect Tag - Web Component: <site-article-card>
 * Reusable card for blog listings and related posts.
 */
class SiteArticleCard extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || '';
    const link = this.getAttribute('link') || '#';
    const image = this.getAttribute('image') || '';
    const excerpt = this.getAttribute('excerpt') || '';
    const date = this.getAttribute('date') || '';

    this.innerHTML = `
      <div class="ct-article-card">
        ${image ? `<div class="ct-card-img"><img src="${image}" alt="${title}" width="400" height="200" loading="lazy"></div>` : ''}
        <div class="ct-card-body">
          ${date ? `<span class="ct-card-date">${date}</span>` : ''}
          <h3 class="ct-card-title"><a href="${link}">${title}</a></h3>
          <p class="ct-card-excerpt">${excerpt}</p>
          <a href="${link}" class="ct-card-link">اقرأ المزيد <i class="fa-solid fa-angle-left" aria-hidden="true"></i></a>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('site-article-card')) {
if (!customElements.get('site-article-card')) {if (!customElements.get('site-article-card')) {
if (!customElements.get('site-article-card')) {
  customElements.define('site-article-card', SiteArticleCard);
}
}
}
}

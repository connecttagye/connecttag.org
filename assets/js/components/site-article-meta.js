/**
 * Connect Tag - Web Component: <site-article-meta>
 * Displays article metadata (author, date, etc.) with SEO structured data support.
 */
class SiteArticleMeta extends HTMLElement {
  connectedCallback() {
    const author = this.getAttribute('author') || 'فريق كونكت تاق';
    const authorLink = this.getAttribute('author-link') || 'https://connecttag.org/author/';
    const date = this.getAttribute('date') || '';
    const updated = this.getAttribute('updated') || '';
    const readTime = this.getAttribute('read-time') || '5 دقائق';

    this.innerHTML = `
      <div class="ct-article-meta">
        <div class="ct-meta-item">
          <i class="fa fa-user"></i>
          <span>الكاتب: <a href="${authorLink}">${author}</a></span>
        </div>
        ${date ? `
        <div class="ct-meta-item">
          <i class="fa fa-calendar"></i>
          <span>نشر في: ${date}</span>
        </div>` : ''}
        ${updated ? `
        <div class="ct-meta-item">
          <i class="fa fa-refresh"></i>
          <span>آخر تحديث: ${updated}</span>
        </div>` : ''}
        <div class="ct-meta-item">
          <i class="fa fa-clock-o"></i>
          <span>وقت القراءة: ${readTime}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('site-article-meta', SiteArticleMeta);

/**
 * Connect Tag - Web Component: <site-article-meta>
 * Displays article metadata (author, date, etc.) with SEO structured data support.
 */
class SiteArticleMeta extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const date = this.getAttribute('date') || '';
    const updated = this.getAttribute('updated') || '';

    const parseDate = (d) => {
      if (!d) return { dm: '', y: '' };
      const parts = d.split(' ');
      if (parts.length >= 3) {
        return { dm: parts[0] + ' ' + parts[1], y: parts[2] };
      }
      return { dm: d, y: '' };
    };

    const pub = parseDate(date);
    const upd = parseDate(updated);

    this.innerHTML = `
      <div class="ct-modern-meta">
        <div class="meta-col">
          <div class="meta-label"><i class="fa-regular fa-calendar-check"></i> تاريخ النشر</div>
          <div class="meta-value">
            <span class="meta-dm">${pub.dm}</span>
            <span class="meta-y">${pub.y}</span>
          </div>
        </div>
        ${updated ? `
        <div class="meta-sep"></div>
        <div class="meta-col">
          <div class="meta-label"><i class="fa-solid fa-arrows-rotate"></i> تاريخ التحديث</div>
          <div class="meta-value">
            <span class="meta-dm">${upd.dm}</span>
            <span class="meta-y">${upd.y}</span>
          </div>
        </div>` : ''}
      </div>
    `;
  }
}

customElements.define('site-article-meta', SiteArticleMeta);

/**
 * Connect Tag - Web Component: <site-article-meta>
 * Displays article metadata (author, date, updated) with SEO & E-E-A-T support.
 */
class SiteArticleMeta extends HTMLElement {
  connectedCallback() {
    const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
    const date = this.getAttribute('date') || '';
    const updated = this.getAttribute('updated') || '';
    const category = this.getAttribute('category') || '';
    const subcategory = this.getAttribute('subcategory') || '';

    const authorMap = {
      'عقيل محمد': { name: 'عقيل محمد', link: `${baseUrl}/blog/authors/aqeldev` },
      'م. عقيل المشرعي': { name: 'م. عقيل المشرعي', link: `${baseUrl}/blog/authors/aqeldev` },
      'بسمة شرف': { name: 'بسمة شرف', link: `${baseUrl}/blog/authors/basma` },
      'م. بسمة العريقي': { name: 'م. بسمة العريقي', link: `${baseUrl}/blog/authors/basma` },
      'علي الرحبي': { name: 'علي الرحبي', link: `${baseUrl}/blog/authors/ali` },
      'أ. علي السقاف': { name: 'أ. علي السقاف', link: `${baseUrl}/blog/authors/ali` },
      'جود محمد': { name: 'جود محمد', link: `${baseUrl}/blog/authors/jood` },
      'مريم اليمني': { name: 'مريم اليمني', link: `${baseUrl}/blog/authors/mariam` },
      'يوسف محمد': { name: 'يوسف محمد', link: `${baseUrl}/blog/authors/yousef` },
      'ريم محمد': { name: 'ريم محمد', link: `${baseUrl}/blog/authors/reem` },
      'محمد شرف': { name: 'محمد شرف', link: `${baseUrl}/blog/authors/mohammed` },
      'محمد حميد': { name: 'محمد حميد', link: `${baseUrl}/blog/authors/mohammed-hameed` },
      'يوسف الرحبي': { name: 'يوسف الرحبي', link: `${baseUrl}/blog/authors/yousef-alrahbi` },
      'كيان الرحبي': { name: 'كيان الرحبي', link: `${baseUrl}/blog/authors/kayan` },
      'فريق كونكت تاق': { name: 'فريق كونكت تاق', link: `${baseUrl}/blog/authors/official` }
    };

    let authorName = this.getAttribute('author') || '';
    let authorLink = this.getAttribute('author-link') || '';

    if (!authorName) {
      const authorBox = document.querySelector('site-author-box');
      if (authorBox) {
        authorName = authorBox.getAttribute('name') || '';
        authorLink = authorBox.getAttribute('link') || '';
      }
    }
    if (!authorName) {
      const metaAuthor = document.querySelector('meta[name="author"]');
      if (metaAuthor) authorName = metaAuthor.getAttribute('content') || '';
    }
    if (authorName && !authorLink && authorMap[authorName]) {
      authorLink = authorMap[authorName].link;
    }

    const parseDate = (d) => {
      if (!d) return { dm: '', y: '' };
      const parts = d.trim().split(/\s+/);
      if (parts.length >= 3) {
        return { dm: parts[0] + ' ' + parts[1], y: parts[2] };
      }
      return { dm: d, y: '' };
    };

    const pub = parseDate(date);
    const upd = parseDate(updated);

    const catBarHtml = category ? `
      <div class="ct-article-cat-bar" style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px; font-size:13px; font-weight:700;">
        <a href="${baseUrl}/blog/?cat=${encodeURIComponent(category)}" style="display:inline-flex; align-items:center; gap:6px; background:#eff6ff; color:#0052cc; border:1px solid #bfdbfe; padding:4px 12px; border-radius:20px; text-decoration:none;">
          <i class="fa-solid fa-folder-open" aria-hidden="true" style="font-size:12px;"></i> ${category}
        </a>
        ${subcategory ? `
        <span style="color:#94a3b8; font-weight:800;" aria-hidden="true">›</span>
        <a href="${baseUrl}/blog/?cat=${encodeURIComponent(category)}&sub=${encodeURIComponent(subcategory)}" style="display:inline-flex; align-items:center; gap:6px; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:4px 12px; border-radius:20px; text-decoration:none;">
          <i class="fa-solid fa-tag" aria-hidden="true" style="font-size:11px; color:#0284c7;"></i> ${subcategory}
        </a>` : ''}
      </div>` : '';

    this.innerHTML = `
      ${catBarHtml}
      <div class="ct-modern-meta">
        ${authorName ? `
        <div class="meta-col">
          <div class="meta-label"><i class="fa-regular fa-user" aria-hidden="true"></i> الكاتب</div>
          <div class="meta-value">
            ${authorLink
              ? `<a href="${authorLink}" class="meta-dm" style="color: #0052cc; text-decoration: none;">${authorName}</a>`
              : `<span class="meta-dm">${authorName}</span>`}
          </div>
        </div>
        <div class="meta-sep"></div>` : ''}
        <div class="meta-col">
          <div class="meta-label"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i> تاريخ النشر</div>
          <div class="meta-value">
            <span class="meta-dm">${pub.dm}</span>
            <span class="meta-y">${pub.y}</span>
          </div>
        </div>
        ${updated ? `
        <div class="meta-sep"></div>
        <div class="meta-col">
          <div class="meta-label"><i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i> تاريخ التحديث</div>
          <div class="meta-value">
            <span class="meta-dm">${upd.dm}</span>
            <span class="meta-y">${upd.y}</span>
          </div>
        </div>` : ''}
      </div>
    `;
  }
}
if (!customElements.get('site-article-meta')) {
  customElements.define('site-article-meta', SiteArticleMeta);
}

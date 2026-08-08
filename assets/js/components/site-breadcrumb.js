/**
 * Connect Tag - Web Component: <site-breadcrumb>
 * Visual Breadcrumbs + Dynamic Schema.org BreadcrumbList JSON-LD for Google Rich Snippets.
 */
class SiteBreadcrumb extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const itemsAttr = this.getAttribute('items');
    
    let breadcrumbItems = [];

    if (itemsAttr) {
      try {
        breadcrumbItems = JSON.parse(itemsAttr);
      } catch (e) {
        console.error('Breadcrumb JSON parse error:', e);
      }
    }

    // Default fallback if no custom items supplied
    if (!breadcrumbItems.length) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      breadcrumbItems.push({ title: 'الرئيسية', url: baseUrl });
      
      const segmentMap = {
        'blog': 'المدونة',
        'projects': 'أعمالنا',
        'apps': 'تطبيقاتنا'
      };

      let currentAccUrl = baseUrl;
      pathSegments.forEach((seg, idx) => {
        // Skip root folder name or index files
        if (seg.toLowerCase() === 'connecttag.org' || seg === 'index.html' || seg === 'index.php' || seg === '') return;

        currentAccUrl += seg + '/';

        let title = decodeURIComponent(seg);

        // Remove extensions from titles
        title = title.replace(/\.(html|php)$/i, '');

        // Map common segments or clean up
        if (segmentMap[title.toLowerCase()]) {
          title = segmentMap[title.toLowerCase()];
        } else {
          // Clean up title (replace dashes with spaces)
          title = title.replace(/-/g, ' ');
          // Capitalize first letter
          title = title.charAt(0).toUpperCase() + title.slice(1);
        }

        breadcrumbItems.push({
          title: title,
          url: currentAccUrl
        });
      });
    }

    // Render HTML UI
    const listHtml = breadcrumbItems.map((item, index) => {
      const isLast = index === breadcrumbItems.length - 1;
      return `
        <li class="ct-breadcrumb-item ${isLast ? 'active' : ''}">
          ${index > 0 ? '<span class="ct-breadcrumb-separator"><i class="fa fa-chevron-left"></i></span>' : ''}
          ${isLast ? `<span>${item.title}</span>` : `<a href="${item.url}">${item.title}</a>`}
        </li>
      `;
    }).join('');

    this.innerHTML = `
      <nav aria-label="مسار التصفح" class="ct-breadcrumb-container">
        <ol class="ct-breadcrumb-list">
          ${listHtml}
        </ol>
      </nav>
    `;

    // Inject Schema.org JSON-LD snippet into <head> for Google Search Console
    this.injectSchema(breadcrumbItems);
  }

  injectSchema(items) {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "item": item.url.startsWith('http') ? item.url : (baseUrl + item.url.replace(/^\.?\//, '')).replace(/\/+$/, '')
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }
}

customElements.define('site-breadcrumb', SiteBreadcrumb);

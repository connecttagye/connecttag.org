/**
 * Connect Tag - Web Component: <site-breadcrumb>
 * Visual Breadcrumbs + Dynamic Schema.org BreadcrumbList JSON-LD for Google Rich Snippets.
 */
class SiteBreadcrumb extends HTMLElement {
  connectedCallback() {
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
      breadcrumbItems.push({ title: 'الرئيسية', url: 'https://connecttag.org/' });
      
      let currentAccUrl = 'https://connecttag.org/';
      pathSegments.forEach((seg, idx) => {
        if (seg === 'index.html' || seg === '') return;
        currentAccUrl += seg + '/';
        const formattedTitle = decodeURIComponent(seg).replace(/-/g, ' ');
        breadcrumbItems.push({
          title: formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1),
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
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "item": item.url.startsWith('http') ? item.url : ('https://connecttag.org/' + item.url.replace(/^\.?\//, '')).replace(/\/+$/, '')
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }
}

customElements.define('site-breadcrumb', SiteBreadcrumb);

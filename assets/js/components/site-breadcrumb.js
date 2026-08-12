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
        'apps': 'تطبيقاتنا',
        'sites': 'أعمال الويب',
        'design': 'أعمال التصميم',
        'bots': 'بوتات تليجرام',
        'desktop': 'برامج سطح المكتب',
        'libraries': 'المكاتب البرمجية',
        'store': 'المتجر',
        'tools': 'الأدوات',
        'services': 'الخدمات',
        'hardware-solutions': 'دليل المنتجات',
        'about': 'من نحن',
        'our-company': 'تعرف علينا',
        'about-site': 'حول الموقع',
        'contact': 'اتصل بنا',
        'faq': 'الأسئلة الشائعة'
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
          ${isLast ? `<span>${item.title}</span>` : `<a href="${item.url}">${item.title}</a>`}
          ${!isLast ? '<span class="ct-breadcrumb-separator"><i class="fa-solid fa-chevron-left"></i></span>' : ''}
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
    // Remove existing dynamic breadcrumb schema if any
    const existingScript = document.getElementById('ds-breadcrumb-schema');
    if (existingScript) existingScript.remove();

    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => {
        // Resolve absolute URL
        let absoluteUrl = item.url;

        // Handle relative paths starting with ./ or ../ or just a name
        if (!absoluteUrl.startsWith('http') && !absoluteUrl.startsWith('/')) {
            try {
                absoluteUrl = new URL(item.url, window.location.href).href;
            } catch (e) {
                // Fallback for older browsers or invalid URLs
                absoluteUrl = baseUrl.replace(/\/+$/, '') + '/' + item.url.replace(/^\.\//, '');
            }
        } else if (absoluteUrl.startsWith('/')) {
            // Convert /path to https://domain.org/path
            // But first, check if it's a corrupted /https:// link
            if (absoluteUrl.startsWith('/http')) {
                absoluteUrl = absoluteUrl.replace(/^\/+/, '');
            } else {
                absoluteUrl = baseUrl.replace(/\/+$/, '') + absoluteUrl;
            }
        }

        // Clean up double slashes (except for http://)
        absoluteUrl = absoluteUrl.replace(/([^:])\/\/+/g, '$1/');

        return {
          "@type": "ListItem",
          "position": index + 1,
          "name": item.title,
          "item": absoluteUrl
        };
      })
    };

    const script = document.createElement('script');
    script.id = 'ds-breadcrumb-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }
}

customElements.define('site-breadcrumb', SiteBreadcrumb);

/**
 * Connect Tag - Web Component: <site-related-posts>
 * Flexible related posts component with smart auto-filtering and customization.
 */
class SiteRelatedPosts extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const currentPath = window.location.pathname;

    // 1. Get attributes
    const customTitle = this.getAttribute('title') || 'قد يهمك أيضاً';
    const itemsAttr = this.getAttribute('items');
    const limit = parseInt(this.getAttribute('limit')) || 2;

    // 2. Global Articles Registry
    const allPosts = [
      {
        title: "يمن فورجي أم فايبر؟ مقارنة شاملة",
        link: "blog/yemen-internet-comparison-4g-adsl-fiber",
        image: "upload/yemen-internet-comparison.webp",
        excerpt: "تعرف على أفضل خيارات الإنترنت المتاحة في اليمن وكيفية اختيار الأنسب لعملك."
      },
      {
        title: "لماذا يحتاج نشاطك التجاري لتطبيق؟",
        link: "blog/why-your-business-needs-app",
        image: "upload/why-you-need-apps.webp",
        excerpt: "اكتشف كيف يساهم تطبيق الموبايل في زيادة مبيعاتك وتسهيل وصول العملاء إليك."
      },
      {
        title: "كيف تختار استضافة موقعك الإلكتروني؟",
        link: "blog/choosing-web-hosting",
        image: "upload/how-chose-yout-hosting.webp",
        excerpt: "أهم المعايير التقنية التي يجب مراعاتها لضمان سرعة وأمان موقعك لعام 2026."
      },
      {
        title: "كيفية استعلام رصيد يمن فورجي 4G",
        link: "blog/how-to-check-yemen-4g-balance",
        image: "upload/yemen-4g.webp",
        excerpt: "دليل شامل يشرح كافة الطرق الرسمية والميسرة لمتابعة استهلاكك لرصيد يمن فورجي."
      },
      {
        title: "أهمية التسويق الرقمي لنشاطك",
        link: "blog/digital-marketing-importance",
        image: "upload/marketing-in-yout-company.webp",
        excerpt: "لماذا يجب أن يكون التسويق الرقمي جزءاً أساسياً من استراتيجية نمو مشروعك."
      }
    ];

    let displayPosts = [];

    // 3. Determine which posts to show
    if (itemsAttr) {
      try {
        displayPosts = JSON.parse(itemsAttr);
      } catch (e) {
        console.error('Related Posts JSON error:', e);
      }
    } else {
      // Smart Auto-Filtering: Exclude current article and pick others in order
      displayPosts = allPosts
        .filter(post => !currentPath.includes(post.link))
        .slice(0, limit);
    }

    // 4. Render HTML
    if (displayPosts.length === 0) return;

    this.innerHTML = `
      <section class="ct-related-posts">
        <h3 class="ct-section-title">${customTitle}</h3>
        <div class="ct-related-grid">
          ${displayPosts.map(post => {
            const imgUrl = post.image.startsWith('http') ? post.image : baseUrl + post.image;
            const linkUrl = post.link.startsWith('http') ? post.link : baseUrl + post.link;
            return `
            <site-article-card
              title="${post.title}"
              link="${linkUrl}"
              image="${imgUrl}"
              excerpt="${post.excerpt}"
            ></site-article-card>
          `}).join('')}
        </div>
      </section>
    `;
  }
}

customElements.define('site-related-posts', SiteRelatedPosts);

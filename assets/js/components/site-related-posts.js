/**
 * Connect Tag - Web Component: <site-related-posts>
 * Flexible related posts component with global registry and manual selection support.
 */
class SiteRelatedPosts extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const currentPath = window.location.pathname;

    // 1. Get attributes
    const customTitle = this.getAttribute('title') || 'قد يهمك أيضاً';
    const limit = parseInt(this.getAttribute('limit')) || 2;
    const manualIds = this.getAttribute('ids'); // Expects comma-separated slugs/filenames

    // 2. Global Articles Registry
    const allPosts = [
      {
        id: "yemen-internet-comparison-4g-adsl-fiber",
        title: "يمن فورجي أم فايبر؟ مقارنة شاملة",
        link: "blog/yemen-internet-comparison-4g-adsl-fiber",
        image: "upload/yemen-internet-comparison.webp",
        excerpt: "تعرف على أفضل خيارات الإنترنت المتاحة في اليمن وكيفية اختيار الأنسب لعملك."
      },
      {
        id: "why-your-business-needs-app",
        title: "لماذا يحتاج نشاطك التجاري لتطبيق؟",
        link: "blog/why-your-business-needs-app",
        image: "upload/why-you-need-apps.webp",
        excerpt: "اكتشف كيف يساهم تطبيق الموبايل في زيادة مبيعاتك وتسهيل وصول العملاء إليك."
      },
      {
        id: "choosing-web-hosting",
        title: "كيف تختار استضافة موقعك الإلكتروني؟",
        link: "blog/choosing-web-hosting",
        image: "upload/how-chose-yout-hosting.webp",
        excerpt: "أهم المعايير التقنية التي يجب مراعاتها لضمان سرعة وأمان موقعك لعام 2026."
      },
      {
        id: "how-to-check-yemen-4g-balance",
        title: "كيفية استعلام رصيد يمن فورجي 4G",
        link: "blog/how-to-check-yemen-4g-balance",
        image: "upload/yemen-4g.webp",
        excerpt: "دليل شامل يشرح كافة الطرق الرسمية والميسرة لمتابعة استهلاكك لرصيد يمن فورجي."
      },
      {
        id: "digital-marketing-importance",
        title: "أهمية التسويق الرقمي لنشاطك",
        link: "blog/digital-marketing-importance",
        image: "upload/marketing-in-yout-company.webp",
        excerpt: "لماذا يجب أن يكون التسويق الرقمي جزءاً أساسياً من استراتيجية نمو مشروعك."
      },
      {
        id: "yemen-telecom-ministry-guide",
        title: "دليل وزارة الاتصالات اليمنية",
        link: "blog/yemen-telecom-ministry-guide",
        image: "upload/telecom-yemen.webp",
        excerpt: "دليل شامل للهيكلية والخدمات الرقمية والمؤسسات التابعة لوزارة الاتصالات في اليمن."
      },
      {
        id: "cloudflare-waf-security-guide",
        title: "تأمين المواقع عبر Cloudflare WAF",
        link: "blog/cloudflare-waf-security-guide",
        image: "upload/waf-cloudflare.webp",
        excerpt: "تعلم كيفية استخدام جدار حماية كلاود فلير لحماية بياناتك من الاختراق."
      },
      {
        id: "cloudflare-settings-optimization-guide",
        title: "ضبط إعدادات كلاود فلير باحترافية",
        link: "blog/cloudflare-settings-optimization-guide",
        image: "upload/cloudflare-settings-optimization.webp",
        excerpt: "دليل شامل لتهيئة كلاود فلير لتحقيق أقصى سرعة وأمان لموقعك الإلكتروني."
      },
      {
        id: "cloudflare-pages-hosting-guide",
        title: "استضافة Cloudflare Pages المجانية",
        link: "blog/cloudflare-pages-hosting-guide",
        image: "upload/cloudflare-page-hosting.webp",
        excerpt: "اكتشف كيف تطلق موقعك الإلكتروني مجاناً وبأداء عالمي باستخدام كلاود فلير."
      },
      {
        id: "google-business-profile-guide",
        title: "دليل Google Business Profile",
        link: "blog/google-business-profile-guide",
        image: "upload/google-business-guide.webp",
        excerpt: "تعلم كيفية إنشاء وتحسين ملف شركتك على جوجل لتظهر في نتائج البحث والخرائط."
      },
      {
        id: "website-security-simple-steps",
        title: "5 خطوات لحماية موقعك من الاختراق",
        link: "blog/website-security-simple-steps",
        image: "upload/security-steps.webp",
        excerpt: "تعرف على أهم الخطوات العملية والبسيطة لتأمين موقعك وحمايته سيبرانياً."
      },
      {
        id: "advanced-database-security-architecture",
        title: "هندسة وأمن قواعد البيانات",
        link: "blog/advanced-database-security-architecture",
        image: "upload/database-architecture.webp",
        excerpt: "دليل هندسي شامل لتصميم وتأمين قواعد البيانات المتطورة وحمايتها من الاختراق."
      },
      {
        id: "api-security-guide",
        title: "حماية واجهات التطبيقات API",
        link: "blog/api-security-guide",
        image: "upload/api-security.webp",
        excerpt: "تعرف على كيفية تأمين الـ APIs وحماية قنوات التواصل الرقمي من الاختراق."
      },
      {
        id: "android-app-security-reverse-engineering",
        title: "حماية الأندرويد من الهندسة العكسية",
        link: "blog/android-app-security-reverse-engineering",
        image: "upload/android-reverse-engineering.webp",
        excerpt: "ارفع تكلفة الهجوم على تطبيقك واحمِ ملكيتك الفكرية باستخدام أحدث التقنيات."
      },
      {
        id: "jetpack-compose-guide",
        title: "Jetpack Compose: مستقبل الأندرويد",
        link: "blog/jetpack-compose-guide",
        image: "upload/jetpack-compose.webp",
        excerpt: "تعرف على Jetpack Compose، الأداة الثورية لبناء واجهات الأندرويد واكتشف الفرق بينه وبين XML."
      },
      {
        id: "iis-isapi-deployment-guide",
        title: "نشر وتصحيح ISAPI DLL على IIS",
        link: "blog/iis-isapi-deployment-guide",
        image: "upload/iis-isapi-guide.webp",
        excerpt: "دليل عملي لنشر وتصحيح أخطاء مكتبات ISAPI DLL على خادم IIS لضمان الأداء والاستقرار."
      }
    ];

    let displayPosts = [];

    // 3. Determine which posts to show
    if (manualIds) {
      // Manual selection by ID
      const idsArr = manualIds.split(',').map(id => id.trim());
      displayPosts = allPosts.filter(post => idsArr.includes(post.id));
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

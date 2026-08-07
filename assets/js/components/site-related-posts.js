/**
 * Connect Tag - Web Component: <site-related-posts>
 * Displays related articles suggestions.
 */
class SiteRelatedPosts extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const getLink = (path) => baseUrl + path;
    const getImg = (path) => baseUrl + path;

    this.innerHTML = `
      <section class="ct-related-posts">
        <h3 class="ct-section-title">قد يهمك أيضاً</h3>
        <div class="ct-related-grid">
          <site-article-card
            title="يمن فورجي أم فايبر؟ مقارنة شاملة"
            link="${getLink('blog/yemen-internet-comparison-4g-adsl-fiber')}"
            image="${getImg('upload/yemen-internet-comparison.webp')}"
            excerpt="تعرف على أفضل خيارات الإنترنت المتاحة في اليمن..."
          ></site-article-card>

          <site-article-card
            title="لماذا يحتاج نشاطك التجاري لتطبيق؟"
            link="${getLink('blog/why-your-business-needs-app')}"
            image="${getImg('upload/why-your-business-needs-app.webp')}"
            excerpt="اكتشف كيف يساهم تطبيق الموبايل في زيادة مبيعاتك..."
          ></site-article-card>
        </div>
      </section>
    `;
  }
}

customElements.define('site-related-posts', SiteRelatedPosts);

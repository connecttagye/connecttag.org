/**
 * Connect Tag - Web Component: <site-footer>
 * AdSense & SEO compliant footer with mandatory policy links, social channels, and automatic paths.
 */
class SiteFooter extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const currentYear = new Date().getFullYear();
    const getLink = (path) => baseUrl + path;

    this.innerHTML = `
      <footer class="ct-footer-main">
        <div class="ct-footer-grid">
          <div class="ct-footer-col">
            <h4>كونكت تاق</h4>
            <p>كونكت تاق للخدمات والمستلزمات التقنية والتسويق الرقمي. شركة يمنية رائدة في تقديم الحلول البرمجية والأنظمة المحاسبية بأعلى معايير الجودة والاحترافية.</p>
            <div class="ct-social-icons">
              <a href="https://www.facebook.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Facebook"><i class="fa fa-facebook"></i></a>
              <a href="https://x.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="X (Twitter)"><i class="fa fa-twitter"></i></a>
              <a href="https://www.instagram.com/connecttagye/" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Instagram"><i class="fa fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="LinkedIn"><i class="fa fa-linkedin"></i></a>
              <a href="https://www.youtube.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="YouTube"><i class="fa fa-youtube"></i></a>
              <a href="https://t.me/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Telegram"><i class="fa fa-paper-plane"></i></a>
              <a href="https://github.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="GitHub"><i class="fa fa-github"></i></a>
            </div>
          </div>

          <div class="ct-footer-col">
            <h4>من نحن وهويتنا</h4>
            <ul class="ct-footer-links">
              <li><a href="${getLink('')}"><i class="fa fa-angle-left"></i> الرئيسية</a></li>
              <li><a href="${getLink('about/our-company')}"><i class="fa fa-angle-left"></i> من نحن</a></li>
              <li><a href="${getLink('services/web-app-development')}"><i class="fa fa-angle-left"></i> خدماتنا التقنية</a></li>
              <li><a href="${getLink('blog/')}"><i class="fa fa-angle-left"></i> المدونة التقنية</a></li>
              <li><a href="${getLink('tools/')}"><i class="fa fa-angle-left"></i> الأدوات المجانية</a></li>
              <li><a href="${getLink('faq')}"><i class="fa fa-angle-left"></i> الأسئلة الشائعة</a></li>
              <li><a href="${getLink('contact')}"><i class="fa fa-angle-left"></i> اتصل بنا</a></li>
            </ul>
          </div>

          <div class="ct-footer-col">
            <h4>أعمالنا وخدماتنا</h4>
            <ul class="ct-footer-links">
              <li><a href="${getLink('projects/')}"><i class="fa fa-angle-left"></i> معرض الأعمال</a></li>
              <li><a href="${getLink('projects/apps/')}"><i class="fa fa-angle-left"></i> تطبيق المحفظة والأنظمة</a></li>
              <li><a href="${getLink('projects/sites/')}"><i class="fa fa-angle-left"></i> تطوير المواقع والأنظمة</a></li>
              <li><a href="${getLink('services/hardware-solutions')}"><i class="fa fa-angle-left"></i> المستلزمات البرمجية</a></li>
              <li><a href="${getLink('about/about-site')}"><i class="fa fa-angle-left"></i> حول هذا الموقع</a></li>
            </ul>
          </div>

          <div class="ct-footer-col">
            <h4>معلومات التواصل</h4>
            <p><i class="fa fa-map-marker" style="color: var(--ct-primary);"></i> اليمن، صنعاء</p>
            <p><i class="fa fa-envelope" style="color: var(--ct-primary);"></i> info@connecttag.org</p>
          </div>
        </div>

        <div class="ct-footer-bottom">
          <div class="ct-footer-bottom-container">
            <p style="margin: 0; font-size: 13px; color: var(--ct-text-muted);">
              جميع الحقوق محفوظة &copy; ${currentYear} | تم التطوير بواسطة
              <a href="${getLink('')}" style="color: var(--ct-primary); font-weight: 700; text-decoration: none;">Connect Tag</a>
            </p>
            
            <ul class="ct-footer-legal-links">
              <li><a href="${getLink('privacy-policy')}">سياسة الخصوصية</a></li>
              <li><a href="${getLink('terms-of-use')}">اتفاقية الاستخدام</a></li>
              <li><a href="${getLink('contact')}">الدعم الفني</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <div id="back-to-top" title="العودة للأعلى" role="button" aria-label="العودة للأعلى">
        <i class="fa fa-chevron-up"></i>
      </div>
    `;

    // Back to top scroll handler is now managed in site-scripts.js for consistency
  }
}

customElements.define('site-footer', SiteFooter);

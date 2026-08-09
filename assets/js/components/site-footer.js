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
              <a href="https://x.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="X (Twitter)">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.instagram.com/connecttagye/" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Instagram"><i class="fa fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="LinkedIn"><i class="fa fa-linkedin"></i></a>
              <a href="https://www.pinterest.com/connecttagye/" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Pinterest"><i class="fa fa-pinterest"></i></a>
              <a href="https://whatsapp.com/channel/0029VaasCef8qIztDeS8Sp1R" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="WhatsApp Channel"><i class="fa fa-whatsapp"></i></a>
              <a href="https://www.youtube.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="YouTube"><i class="fa fa-youtube"></i></a>
              <a href="https://t.me/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Telegram"><i class="fa fa-paper-plane"></i></a>
              <a href="https://github.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="GitHub"><i class="fa fa-github"></i></a>
              <a href="https://gitlab.com/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="GitLab"><i class="fa fa-gitlab"></i></a>
              <a href="https://www.tiktok.com/@connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="TikTok">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.64-.13.47-.1.99.09 1.44.35 1.03 1.5 1.74 2.59 1.61.88-.04 1.65-.58 2.02-1.37.15-.33.24-.69.24-1.05V0z"/></svg>
              </a>
              <a href="https://www.snapchat.com/add/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Snapchat"><i class="fa fa-snapchat-ghost"></i></a>
              <a href="https://kik.me/connecttagye" target="_blank" rel="noopener noreferrer" class="ct-social-btn" title="Kik">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.844 17.188c-.524 0-.949-.425-.949-.949 0-.524.425-.949.949-.949.524 0 .949.425.949.949 0 .524-.425.949-.949.949zm.281-2.922c-.622 0-1.125-.503-1.125-1.125 0-.622.503-1.125 1.125-1.125.622 0 1.125.503 1.125 1.125 0 .622-.503 1.125-1.125 1.125zm-2.125 0c-.622 0-1.125-.503-1.125-1.125 0-.622.503-1.125 1.125-1.125.622 0 1.125.503 1.125 1.125 0 .622-.503 1.125-1.125 1.125zm-1.125 2.922c-.524 0-.949-.425-.949-.949 0-.524.425-.949.949-.949.524 0 .949.425.949.949 0 .524-.425.949-.949.949zm-1.844-2.922c-.622 0-1.125-.503-1.125-1.125 0-.622.503-1.125 1.125-1.125.622 0 1.125.503 1.125 1.125 0 .622-.503 1.125-1.125 1.125zm-2.125 0c-.622 0-1.125-.503-1.125-1.125 0-.622.503-1.125 1.125-1.125.622 0 1.125.503 1.125 1.125 0 .622-.503 1.125-1.125 1.125zm-.281 2.922c-.524 0-.949-.425-.949-.949 0-.524.425-.949.949-.949.524 0 .949.425.949.949 0 .524-.425.949-.949.949z"/></svg>
              </a>
            </div>
          </div>

          <div class="ct-footer-col">
            <h4>من نحن وهويتنا</h4>
            <ul class="ct-footer-links">
              <li><a href="${getLink('')}"><i class="fa fa-angle-left"></i> الرئيسية</a></li>
              <li><a href="${getLink('about/our-company')}"><i class="fa fa-angle-left"></i> من نحن</a></li>
              <li><a href="${getLink('blog/')}"><i class="fa fa-angle-left"></i> المدونة</a></li>
              <li><a href="${getLink('tools/')}"><i class="fa fa-angle-left"></i> الأدوات</a></li>
              <li><a href="${getLink('faq')}"><i class="fa fa-angle-left"></i> الأسئلة الشائعة</a></li>
              <li><a href="${getLink('contact')}"><i class="fa fa-angle-left"></i> اتصل بنا</a></li>
            </ul>
          </div>

          <div class="ct-footer-col">
            <h4>أعمالنا وخدماتنا</h4>
            <ul class="ct-footer-links">
              <li><a href="${getLink('projects/')}"><i class="fa fa-angle-left"></i> معرض الأعمال</a></li>
              <li><a href="${getLink('projects/apps/')}"><i class="fa fa-angle-left"></i> التطبيقات</a></li>
              <li><a href="${getLink('projects/sites/')}"><i class="fa fa-angle-left"></i> المواقع</a></li>
              <li><a href="${getLink('services/hardware-solutions')}"><i class="fa fa-angle-left"></i> متجر المنتجات</a></li>
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
              <a href="${getLink('')}" class="ct-footer-credit-link">Connect Tag</a>
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

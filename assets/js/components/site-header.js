/**
 * Connect Tag - Web Component: <site-header>
 * Modern, accessible header with auto-path resolution & active state highlighting.
 */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
    const currentHref = window.location.href.toLowerCase();
    const currentPath = window.location.pathname.toLowerCase();

    // Check active link logic
    const isActive = (targetUrl) => {
      const target = targetUrl.toLowerCase().replace(/\/$/, '');
      if (!target) return false;
      return currentHref === target || currentHref.startsWith(target + '/') || currentPath === target;
    };

    const isHome = currentPath === '/' || currentPath === '/index.html' || currentHref === (baseUrl + '/').toLowerCase();
    const isCompanyPage = [
      '/company/',
      '/company/index.html',
      '/company/our-company',
      '/company/our-company.html'
    ].includes(currentPath);

    this.innerHTML = `
      <header class="ct-header-navbar">
        <a href="#main-content" class="ct-skip-link">تخطي إلى المحتوى الرئيسي</a>
        <div class="ct-header-container">
          <a href="${baseUrl}/" class="ct-logo-brand" aria-label="كونكت تاق - الصفحة الرئيسية">
            <img src="${baseUrl}/assets/img/connect-tag-horizontal-light.webp?v=1.1.46" alt="كونكت تاق - Connect Tag" width="105" height="42" />
          </a>

          <nav aria-label="التنقل الرئيسي">
            <ul class="ct-nav-menu" id="ct-nav-menu">
              <li class="ct-nav-item ${isHome ? 'active' : ''}">
                <a href="${baseUrl}/" class="ct-nav-link" ${isHome ? 'aria-current="page"' : ''}>الرئيسية</a>
              </li>
              <li class="ct-nav-item ${isCompanyPage ? 'active' : ''}">
                <a href="${baseUrl}/company/" class="ct-nav-link" ${isCompanyPage ? 'aria-current="page"' : ''}>من نحن</a>
              </li>
              <li class="ct-nav-item ${isActive(baseUrl + '/company/projects/') ? 'active' : ''}">
                <a href="${baseUrl}/company/projects/" class="ct-nav-link" ${isActive(baseUrl + '/company/projects/') ? 'aria-current="page"' : ''}>أعمالنا</a>
              </li>
              <li class="ct-nav-item ${isActive(baseUrl + '/company/services/') ? 'active' : ''}">
                <a href="${baseUrl}/company/services/" class="ct-nav-link" ${isActive(baseUrl + '/company/services/') ? 'aria-current="page"' : ''}>الخدمات</a>
              </li>
              <li class="ct-nav-item ${isActive(baseUrl + '/blog/') ? 'active' : ''}">
                <a href="${baseUrl}/blog/" class="ct-nav-link" ${isActive(baseUrl + '/blog/') ? 'aria-current="page"' : ''}>المدونة</a>
              </li>
              <li class="ct-nav-item ${isActive(baseUrl + '/store/') ? 'active' : ''}">
                <a href="${baseUrl}/store/" class="ct-nav-link" ${isActive(baseUrl + '/store/') ? 'aria-current="page"' : ''}>المتجر</a>
              </li>
              <li class="ct-nav-item ${isActive(baseUrl + '/tools/') ? 'active' : ''}">
                <a href="${baseUrl}/tools/" class="ct-nav-link" ${isActive(baseUrl + '/tools/') ? 'aria-current="page"' : ''}>الأدوات</a>
              </li>
            </ul>
          </nav>

          <button type="button" class="ct-mobile-toggle" aria-label="فتح القائمة الرئيسية" aria-expanded="false" aria-controls="ct-nav-menu" id="ct-menu-btn">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
          </button>
        </div>
      </header>
    `;

    // Ensure #main-content target exists for skip link
    if (!document.getElementById('main-content')) {
      const mainEl = document.querySelector('main') || this.nextElementSibling;
      if (mainEl && !mainEl.id) {
        mainEl.id = 'main-content';
      }
    }

    // Mobile Toggle Logic
    const toggleBtn = this.querySelector('#ct-menu-btn');
    const menu = this.querySelector('#ct-nav-menu');

    if (toggleBtn && menu) {
      const hideOverlay = () => {
        const ov = document.querySelector('.nav-overlay');
        if (ov) { ov.style.opacity = '0'; ov.style.display = 'none'; }
      };
      toggleBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        toggleBtn.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        if (!isOpen) hideOverlay();
      });

      // Close menu on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
          menu.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
          hideOverlay();
          toggleBtn.focus();
        }
      });

      // Close menu on link click
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
          hideOverlay();
        });
      });
    }
  }
}

if (!customElements.get('site-header')) {
  customElements.define('site-header', SiteHeader);
}

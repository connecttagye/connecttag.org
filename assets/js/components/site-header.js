/**
 * Connect Tag - Web Component: <site-header>
 * Modern, accessible header with auto-path resolution & active state highlighting.
 */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const currentPath = window.location.pathname;

    // Check active link logic - Robust version for absolute URLs
    const isActive = (targetUrl) => {
      const currentHref = window.location.href.replace(/\/$/, '');
      const target = targetUrl.replace(/\/$/, '');
      return currentHref === target || currentHref.startsWith(target + '/');
    };

    this.innerHTML = `
      <header class="ct-header-navbar">
        <div class="ct-header-container">
          <a href="https://connecttag.org/" class="ct-logo-brand" aria-label="كونكت تاق - الصفحة الرئيسية">
            <img src="https://connecttag.org/assets/img/connect-tag-official-logo.webp" alt="كونكت تاق - Connect Tag" width="140" height="42" />
          </a>

          <button class="ct-mobile-toggle" aria-label="فتح القائمة الرئيسية" aria-expanded="false" id="ct-menu-btn">
            <i class="fa fa-bars"></i>
          </button>

          <nav aria-label="التنقل الرئيسي">
            <ul class="ct-nav-menu" id="ct-nav-menu">
              <li class="ct-nav-item ${isActive('https://connecttag.org/') ? 'active' : ''}">
                <a href="https://connecttag.org/" class="ct-nav-link">الرئيسية</a>
              </li>
              <li class="ct-nav-item ${isActive('https://connecttag.org/about/our-company') ? 'active' : ''}">
                <a href="https://connecttag.org/about/our-company" class="ct-nav-link">من نحن</a>
              </li>
              <li class="ct-nav-item ${isActive('https://connecttag.org/services/web-app-development') ? 'active' : ''}">
                <a href="https://connecttag.org/services/web-app-development" class="ct-nav-link">خدماتنا</a>
              </li>
              <li class="ct-nav-item ${isActive('https://connecttag.org/projects/') ? 'active' : ''}">
                <a href="https://connecttag.org/projects/" class="ct-nav-link">أعمالنا</a>
              </li>
              <li class="ct-nav-item ${isActive('https://connecttag.org/blog/') ? 'active' : ''}">
                <a href="https://connecttag.org/blog/" class="ct-nav-link">المدونة</a>
              </li>
              <li class="ct-nav-item ${isActive('https://connecttag.org/tools/') ? 'active' : ''}">
                <a href="https://connecttag.org/tools/" class="ct-nav-link">الأدوات</a>
              </li>
              <li class="ct-nav-item ${isActive('https://connecttag.org/contact') ? 'active' : ''}">
                <a href="https://connecttag.org/contact" class="ct-nav-link ct-nav-cta">تواصل معنا</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    `;

    // Mobile Toggle Logic
    const toggleBtn = this.querySelector('#ct-menu-btn');
    const menu = this.querySelector('#ct-nav-menu');

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        toggleBtn.querySelector('i').className = isOpen ? 'fa fa-times' : 'fa fa-bars';
      });

      // Close menu on link click
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.querySelector('i').className = 'fa fa-bars';
        });
      });
    }
  }
}

customElements.define('site-header', SiteHeader);

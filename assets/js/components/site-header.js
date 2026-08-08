/**
 * Connect Tag - Web Component: <site-header>
 * Modern, accessible header with auto-path resolution & active state highlighting.
 */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
    const currentHref = window.location.href.replace(/\/$/, '');

    // Check active link logic
    const isActive = (targetUrl) => {
      const target = targetUrl.replace(/\/$/, '');
      return currentHref === target || currentHref.startsWith(target + '/');
    };

    const getLink = (path) => baseUrl + path;

    this.innerHTML = `
      <header class="ct-header-navbar">
        <div class="ct-header-container">
          <a href="${getLink('')}" class="ct-logo-brand" aria-label="كونكت تاق - الصفحة الرئيسية">
            <img src="${getLink('assets/img/connect-tag-official-logo.webp')}" alt="كونكت تاق - Connect Tag" width="140" height="42" />
          </a>

          <button class="ct-mobile-toggle" aria-label="فتح القائمة الرئيسية" aria-expanded="false" id="ct-menu-btn">
            <i class="fa fa-bars"></i>
          </button>

          <nav aria-label="التنقل الرئيسي">
            <ul class="ct-nav-menu" id="ct-nav-menu">
              <li class="ct-nav-item ${isActive(getLink('')) ? 'active' : ''}">
                <a href="${getLink('')}" class="ct-nav-link">الرئيسية</a>
              </li>
              <li class="ct-nav-item ${isActive(getLink('about/our-company')) ? 'active' : ''}">
                <a href="${getLink('about/our-company')}" class="ct-nav-link">من نحن</a>
              </li>
              <li class="ct-nav-item ${isActive(getLink('projects/')) ? 'active' : ''}">
                <a href="${getLink('projects/')}" class="ct-nav-link">أعمالنا</a>
              </li>
              <li class="ct-nav-item ${isActive(getLink('blog/')) ? 'active' : ''}">
                <a href="${getLink('blog/')}" class="ct-nav-link">المدونة</a>
              </li>
              <li class="ct-nav-item ${isActive(getLink('tools/')) ? 'active' : ''}">
                <a href="${getLink('tools/')}" class="ct-nav-link">الأدوات</a>
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

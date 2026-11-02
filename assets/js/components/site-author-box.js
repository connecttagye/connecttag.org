/**
 * Connect Tag - Web Component: <site-author-box>
 * Displays a rich author profile card at the end of articles with E-E-A-T credentials.
 */
class SiteAuthorBox extends HTMLElement {
  connectedCallback() {
    const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
    const name = this.getAttribute('name') || 'فريق كونكت تاق';
    const avatar = this.getAttribute('avatar') || `${baseUrl}/assets/img/connect-tag-official-logo.webp`;
    const linkMap = {
      'عقيل محمد': `${baseUrl}/blog/authors/aqeldev`,
      'م. عقيل المشرعي': `${baseUrl}/blog/authors/aqeldev`,
      'بسمة شرف': `${baseUrl}/blog/authors/basma`,
      'م. بسمة العريقي': `${baseUrl}/blog/authors/basma`,
      'علي الرحبي': `${baseUrl}/blog/authors/ali`,
      'أ. علي السقاف': `${baseUrl}/blog/authors/ali`,
      'جود محمد': `${baseUrl}/blog/authors/jood`,
      'مريم اليمني': `${baseUrl}/blog/authors/mariam`,
      'يوسف محمد': `${baseUrl}/blog/authors/yousef`,
      'ريم محمد': `${baseUrl}/blog/authors/reem`,
      'محمد شرف': `${baseUrl}/blog/authors/mohammed`,
      'محمد حميد': `${baseUrl}/blog/authors/mohammed-hameed`,
      'يوسف الرحبي': `${baseUrl}/blog/authors/yousef-alrahbi`,
      'كيان الرحبي': `${baseUrl}/blog/authors/kayan`,
      'فريق كونكت تاق': `${baseUrl}/blog/authors/official`
    };
    const link = this.getAttribute('link') || linkMap[name] || `${baseUrl}/blog/authors/`;

    const roleMap = {
      'عقيل محمد': 'مطور حلول برمجية ومتخصص في الأمن السيبراني',
      'م. عقيل المشرعي': 'مهندس برمجيات أول وباحث أمن سيبراني',
      'بسمة شرف': 'كاتبة تقنية متخصصة في خدمات الاتصالات والإنترنت',
      'م. بسمة العريقي': 'مهندسة شبكات واتصالات وكاتبة تقنية',
      'علي الرحبي': 'محرر تقني متخصص في هندسة البرمجيات وتحسين محركات البحث',
      'أ. علي السقاف': 'محرر تقني متخصص في الأنظمة الرقمية وتقنيات الويب',
      'جود محمد': 'مختصة في التسويق الرقمي واستراتيجيات نمو الأعمال',
      'مريم اليمني': 'مختصة وباحثة في الأمن السيبراني والخصوصية الرقمية',
      'يوسف محمد': 'مختص في الإعلام الرقمي والتسويق الإعلاني وصناعة المحتوى',
      'ريم محمد': 'مختصة في التصميم الجرافيكي والهويات البصرية وواجهات الاستخدام',
      'محمد شرف': 'مختص في المحاسبة ونظم المعلومات الإدارية والأنظمة المالية',
      'محمد حميد': 'مهندس شبكات متخصص في أنظمة التوجيه وتأمين البنية التحتية',
      'يوسف الرحبي': 'مهندس ومختص في الأنظمة الأمنية والمراقبة الذكية والتحكم بالدخول',
      'كيان الرحبي': 'مختص في الأمن السيبراني والتحقيق الجنائي الرقمي (DFIR)',
      'فريق كونكت تاق': 'فريق الهندسة والتحرير التقني في شركة كونكت تاق'
    };
    const role = this.getAttribute('role') || roleMap[name] || 'كاتب ومحرر تقني في مدونة كونكت تاق';

    this.innerHTML = `
      <a href="${link}" class="ct-author-card-simple">
        <div class="ct-author-avatar">
          <img src="${avatar}" alt="${name}" width="45" height="45" loading="lazy" decoding="async">
        </div>
        <div class="ct-author-info">
          <span class="ct-author-label">الكاتب والمراجع التقني</span>
          <span class="ct-author-name">${name}</span>
          <span class="ct-author-role" style="display:block; font-size:12px; color:#64748b; margin-top:2px;">${role}</span>
        </div>
        <div class="ct-author-arrow" aria-hidden="true">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </div>
      </a>
    `;
  }
}

if (!customElements.get('site-author-box')) {
  customElements.define('site-author-box', SiteAuthorBox);
}

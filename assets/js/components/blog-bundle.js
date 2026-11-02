class SiteArticleCard extends HTMLElement {
connectedCallback() {
const title = this.getAttribute('title') || '';
const safeTitle = title.replace(/"/g, '&quot;');
const link = this.getAttribute('link') || '#';
const image = this.getAttribute('image') || '';
const excerpt = this.getAttribute('excerpt') || '';
const date = this.getAttribute('date') || '';
this.innerHTML = `
<div class="ct-article-card">
${image ? `<div class="ct-card-img"><img src="${image}" alt="${safeTitle}" width="400" height="250" loading="lazy" decoding="async"></div>` : ''}
<div class="ct-card-body">
${date ? `<span class="ct-card-date">${date}</span>` : ''}
<h3 class="ct-card-title"><a href="${link}">${title}</a></h3><p class="ct-card-excerpt">${excerpt}</p><a href="${link}" class="ct-card-link" aria-label="اقرأ المزيد - ${safeTitle}">اقرأ المزيد <i class="fa-solid fa-angle-left" aria-hidden="true"></i></a></div></div>
`;
}
}
if (!customElements.get('site-article-card')) {
customElements.define('site-article-card', SiteArticleCard);
}
class SiteArticleMeta extends HTMLElement {
connectedCallback() {
const baseUrl = (window.CT_BASE_URL || 'https://connecttag.org').replace(/\/+$/, '');
const date = this.getAttribute('date') || '';
const updated = this.getAttribute('updated') || '';
const authorMap = {
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
let authorName = this.getAttribute('author') || '';
let authorLink = this.getAttribute('author-link') || '';
if (!authorName) {
const authorBox = document.querySelector('site-author-box');
if (authorBox) {
authorName = authorBox.getAttribute('name') || '';
authorLink = authorBox.getAttribute('link') || '';
}
}
if (!authorName) {
const metaAuthor = document.querySelector('meta[name="author"]');
if (metaAuthor) authorName = metaAuthor.getAttribute('content') || '';
}
if (authorName && !authorLink && authorMap[authorName]) {
authorLink = authorMap[authorName];
}
const parseDate = (d) => {
if (!d) return { dm: '', y: '' };
const parts = d.trim().split(/\s+/);
if (parts.length >= 3) {
return { dm: parts[0] + ' ' + parts[1], y: parts[2] };
}
return { dm: d, y: '' };
};
const pub = parseDate(date);
const upd = parseDate(updated);
this.innerHTML = `
<div class="ct-modern-meta">${authorName ? `<div class="meta-col"><div class="meta-label"><i class="fa-regular fa-user" aria-hidden="true"></i> الكاتب</div><div class="meta-value">${authorLink ? `<a href="${authorLink}" class="meta-dm" style="color: #0052cc; text-decoration: none;">${authorName}</a>` : `<span class="meta-dm">${authorName}</span>`}</div></div><div class="meta-sep"></div>` : ''}<div class="meta-col"><div class="meta-label"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i> تاريخ النشر</div><div class="meta-value"><span class="meta-dm">${pub.dm}</span><span class="meta-y">${pub.y}</span></div></div>
${updated ? `
<div class="meta-sep"></div><div class="meta-col"><div class="meta-label"><i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i> تاريخ التحديث</div><div class="meta-value"><span class="meta-dm">${upd.dm}</span><span class="meta-y">${upd.y}</span></div></div>` : ''}
</div>
`;
}
}
if (!customElements.get('site-article-meta')) {
customElements.define('site-article-meta', SiteArticleMeta);
}
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
const link = this.getAttribute('link') || linkMap[name] || `${baseUrl}/blog/authors/`;
const role = this.getAttribute('role') || roleMap[name] || 'كاتب ومحرر تقني في مدونة كونكت تاق';
this.innerHTML = `
<a href="${link}" class="ct-author-card-simple"><div class="ct-author-avatar"><img src="${avatar}" alt="${name}" width="45" height="45" loading="lazy" decoding="async"></div><div class="ct-author-info"><span class="ct-author-label">الكاتب والمراجع التقني</span><span class="ct-author-name">${name}</span><span class="ct-author-role" style="display:block; font-size:12px; color:#64748b; margin-top:2px;">${role}</span></div><div class="ct-author-arrow" aria-hidden="true"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></div></a>
`;
}
}
if (!customElements.get('site-author-box')) {
customElements.define('site-author-box', SiteAuthorBox);
}
class SiteShareButtons extends HTMLElement {
connectedCallback() {
const url = window.location.href;
const title = document.title;
const text = this.getAttribute('text') || title;
const isShareSupported = !!navigator.share;
this.innerHTML = `
<div class="ct-share-container"><h3 class="ct-share-title" style="margin-top:0;">شارك :</h3><div class="ct-share-grid">
${isShareSupported ? `
<button type="button" class="ct-share-btn native-share" title="مشاركة عبر الهاتف" aria-label="مشاركة عبر الهاتف" style="border: none; cursor: pointer;"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i></button>
` : ''}
<a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="ct-share-btn whatsapp" title="مشاركة عبر واتساب" aria-label="مشاركة عبر واتساب"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="ct-share-btn facebook" title="مشاركة عبر فيسبوك" aria-label="مشاركة عبر فيسبوك"><i class="fa-brands fa-facebook" aria-hidden="true"></i></a><a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer" class="ct-share-btn telegram" title="مشاركة عبر تليجرام" aria-label="مشاركة عبر تليجرام"><i class="fa-brands fa-telegram" aria-hidden="true"></i></a></div></div>
`;
if (isShareSupported) {
this.querySelector('.native-share').addEventListener('click', (e) => {
e.preventDefault();
navigator.share({
title: title,
text: text,
url: url
}).then(() => console.log('Successful share'))
.catch((error) => console.log('Error sharing', error));
});
}
}
}
if (!customElements.get('site-share-buttons')) {
customElements.define('site-share-buttons', SiteShareButtons);
}
class SiteRelatedPosts extends HTMLElement {
connectedCallback() {
const baseUrl = window.CT_BASE_URL || 'https://connecttag.org/';
const currentPath = window.location.pathname;
const customTitle = this.getAttribute('title') || 'قد يهمك أيضاً';
const limit = parseInt(this.getAttribute('limit')) || 2;
const manualIds = this.getAttribute('ids');
const allPosts = [
      {
        id: "android-firewall-app-internet-control-soor-net-guide",
        title: "الجدار الناري في أندرويد (Android Firewall): دليل التحكم باتصال التطبيقات وترشيد البيانات عبر تطبيق سور نت",
        link: "blog/android-firewall-app-internet-control-soor-net-guide",
        image: "upload/android-firewall-soor-net-guide.webp",
        excerpt: "دليل تقني شامل يشرح كيف يعمل الجدار الناري المحلي في أندرويد بدون روت للتحكم بوصول التطبيقات إلى الواي فاي وبيانات الهاتف وترشيد الباقات."
      },
      {
        id: "adsense-ad-serving-limit-invalid-traffic-ads-txt-guide",
        title: "حل مشكلة «تقييد عرض الإعلانات» في Google AdSense وضبط ملف ads.txt ورسالة GDPR",
        link: "blog/adsense-ad-serving-limit-invalid-traffic-ads-txt-guide",
        image: "upload/adsense-ad-serving-limit-invalid-traffic-guide.webp",
        excerpt: "لماذا تفرض جوجل عقوبة تقييد عرض الإعلانات؟ خطوات حماية الحساب من النقرات غير الصالحة وإعداد ملف ads.txt ورسالة موافقة الخصوصية الأوروبية."
      },
      {
        id: "google-adsense-approval-guide-fix-low-value-content",
        title: "شروط قبول موقعك في Google AdSense من المرة الأولى: الحل الجذري لرفض «محتوى ذو قيمة منخفضة»",
        link: "blog/google-adsense-approval-guide-fix-low-value-content",
        image: "upload/google-adsense-approval-low-value-content-guide.webp",
        excerpt: "التشريح الدقيق لأسباب رفض المواقع برسالة Low Value Content وعلاقتها بمعايير E-E-A-T، وقائمة فحص الصفحات القانونية وزاحف Mediapartners-Google."
      },
      {
        id: "admob-ad-limit-policy-violations-app-ads-txt-guide",
        title: "لماذا يتم تقييد الإعلانات في AdMob؟ 7 مخالفات قاتلة في واجهات التطبيق وكيف تضبط app-ads.txt؟",
        link: "blog/admob-ad-limit-policy-violations-app-ads-txt-guide",
        image: "upload/admob-ad-limit-policy-app-ads-txt-guide.webp",
        excerpt: "تشريح أشهر مخالفات سياسات AdMob في مواضع البانر والإعلانات البينية، معرفات الاختبار الرسمية، وإعداد ملف app-ads.txt لمتجر Google Play وApp Store."
      },
      {
        id: "professional-logo-design-types-principles-file-formats-guide",
        title: "دليل تصميم الشعارات الاحترافية (Logo Design): أنواع الشعارات الـ 7 وصيغ الملفات",
        link: "blog/professional-logo-design-types-principles-file-formats-guide",
        image: "upload/professional-logo-design-principles-guide.webp",
        excerpt: "مقارنة بين أنواع الشعارات الـ 7، معايير التوازن البصري والنسبة الذهبية، والفرق بين صيغ الفيكتور المفتوحة (AI, EPS, SVG) وصور PNG."
      },
      {
        id: "visual-identity-mistakes-successful-rebranding-strategy-guide",
        title: "7 أخطاء قاتلة في الهوية البصرية تضعف مبيعاتك: كيف تنفذ Rebranding ناجح؟",
        link: "blog/visual-identity-mistakes-successful-rebranding-strategy-guide",
        image: "upload/visual-identity-rebranding-strategy-guide.webp",
        excerpt: "كيف تكتشف عيوب هويتك البصرية الحالية، والفرق بين تحديث الهوية التدريجي (Brand Refresh) وإعادة البناء الشامل (Full Rebranding)."
      },
      {
        id: "google-play-integrity-api-android-security-guide",
        title: "دليل Google Play Integrity API الشامل: كيف تكتشف التطبيقات الـ Root والنسخ المعدّلة؟",
        link: "blog/google-play-integrity-api-android-security-guide",
        image: "upload/google-play-integrity-api-security-guide.webp",
        excerpt: "شرح مستويات النزاهة الثلاثة (Basic, Device, Strong Integrity)، التحقق عبر الخادم باستخدام requestHash للمطورين، وحلول مشاكل شهادة الجهاز للمستخدمين."
      },
      {
        id: "migrate-modded-whatsapp-to-official-app-ban-fix-guide",
        title: "رسالة «تحتاج إلى تطبيق واتساب الرسمي»: الدليل الكامل لفك الحظر ونقل المحادثات بأمان",
        link: "blog/migrate-modded-whatsapp-to-official-app-ban-fix-guide",
        image: "upload/migrate-modded-whatsapp-official-ban-fix-guide.webp",
        excerpt: "الطريقة الصحيحة لنقل محادثاتك وصورك من واتساب الذهبي أو البلس أو GBWhatsApp إلى واتساب الرسمي دون ضياع الدردشات وفك حظر الرقم."
      },
      {
        id: "modded-whatsapp-gold-plus-apk-malware-security-analysis",
        title: "الحقيقة التقنية وراء «واتساب الذهبي والأزرق والبلس»: كيف تسرق صورك وجلساتك؟",
        link: "blog/modded-whatsapp-gold-plus-apk-malware-security-analysis",
        image: "upload/modded-whatsapp-apk-malware-analysis-guide.webp",
        excerpt: "تشريح جنائي وأمني يكشف ماذا يحدث داخل ملفات الـ APK المعدلة، وكيف تقرأ الرسائل بعد فك تشفيرها وتزرع برمجيات Triada الخبيثة."
      },
      {
        id: "compose-multiplatform-shared-ui-android-ios-desktop-guide",
        title: "دليل Compose Multiplatform الشامل: واجهة مستخدم واحدة لأندرويد وiOS وسطح المكتب والويب",
        link: "blog/compose-multiplatform-shared-ui-android-ios-desktop-guide",
        image: "upload/compose-multiplatform-shared-ui-guide.webp",
        excerpt: "الفرق المعماري بين مشاركة المنطق ومشاركة الواجهة بالكامل، وكيف يرسم محرك Skia شاشات iOS بـ 120 إطاراً مع دمج UIKitView."
      },
      {
        id: "yemen-4g-app-balance-modem-guide",
        title: "شرح تطبيق يمن فورجي: الاستعلام الذكي عن الرصيد بضغطة زر وإدارة المودم",
        link: "blog/yemen-4g-app-balance-modem-guide",
        image: "upload/yemen-4g-app-balance-modem-guide.webp?v=1.1.48",
        excerpt: "الدليل الكامل لاستخدام تطبيق يمن فورجي: حفظ الأرقام المتعددة، تفعيل ويدجت الرصيد على الشاشة الرئيسية، تنبيهات انتهاء الباقة، ولوحة المودم المدمجة."
      },
      {
        id: "public-wifi-hotspot-security-evil-twin-mitm-guide",
        title: "مخاطر الاتصال بشبكات الواي فاي العامة وشبكات الكروت المفتوحة: هجمات التوأم الشرير",
        link: "blog/public-wifi-hotspot-security-evil-twin-mitm-guide",
        image: "upload/public-wifi-evil-twin-security-guide.webp",
        excerpt: "ماذا يرى صاحب الشبكة العامة أو المتطفل معك في نفس شبكة الكافيه أو الكروت؟ شرح هجمات Evil Twin وARP Spoofing و5 خطوات للتصفح الآمن."
      },
      {
        id: "whatsapp-telegram-hijacking-linked-devices-security-guide",
        title: "كيف تُخترق حسابات واتساب وتيليجرام دون علمك؟ كشف الأجهزة المرتبطة والنسخ المعدّلة",
        link: "blog/whatsapp-telegram-hijacking-linked-devices-security-guide",
        image: "upload/whatsapp-telegram-hijacking-security-guide.webp",
        excerpt: "الدليل الأمني لكشف خدعة كود التفعيل بالخطأ، طرد الجلسات المتطفلة في واتساب ويب وتيليجرام، وخطر النسخ المعدلة."
      },
                        {
        id: "phishing-links-fake-aid-ponzi-investment-scam-guide",
        title: "احذر روابط «تسجيل المساعدات والوظائف والربح السريع»: كشف مواقع التصيّد ومنصات بونزي",
        link: "blog/phishing-links-fake-aid-ponzi-investment-scam-guide",
        image: "upload/phishing-links-fake-aid-scam-guide.webp",
        excerpt: "كيف تكشف الروابط المزيفة التي تنتحل صفة المنظمات والشركات وتسرق الهويات، وتشريح منصات المهام اليومية الوهمية."
      },
      {
        id: "factory-reset-data-recovery-secure-erasure-guide",
        title: "هل «إعادة ضبط المصنع» تمنع استرجاع الصور والملفات؟ الدليل التقني للتدمير الآمن للبيانات",
        link: "blog/factory-reset-data-recovery-secure-erasure-guide",
        image: "upload/factory-reset-secure-erasure-guide.webp",
        excerpt: "كيف يعمل التشفير القائم على الملفات (FBE) عند فرمتة الهاتف، والخطوات المضمونة 100% لمنع استرجاع الصور قبل البيع أو الصيانة."
      },
      {
        id: "caller-id-apps-privacy-risks-security-guide",
        title: "كيف تعرف كواشف الأرقام اسمك حتى لو لم تثبّتها؟ الدليل الأمني الشامل",
        link: "blog/caller-id-apps-privacy-risks-security-guide",
        image: "upload/caller-id-privacy-risks-guide.webp",
        excerpt: "التشريح التقني لآلية الحصاد الجماعي لجهات الاتصال في كواشف الأرقام وبوتات تيليجرام، ومخاطر النسخ المعدلة، وخطوات حماية خصوصيتك."
      },
      {
        id: "e-wallet-impersonation-loan-gift-card-scam-guide",
        title: "احذر فخ «تفعيل القرض والسلفة»: كشف انتحال المحافظ الإلكترونية وخدعة بطاقات الهدايا",
        link: "blog/e-wallet-impersonation-loan-gift-card-scam-guide",
        image: "upload/e-wallet-impersonation-scam-guide.webp",
        excerpt: "لماذا يطلب المحتالون شراء بطاقات هدايا أو إصدار أكواد شراء أونلاين بحجة تفعيل قرض أو سلفة؟ الدليل الأمني الشامل."
      },
      {
        id: "image-exif-metadata-privacy-risks-guide",
        title: "مخاطر البيانات المخفية في الصور (EXIF Metadata) وطريقة حذفها",
        link: "blog/image-exif-metadata-privacy-risks-guide",
        image: "upload/image-exif-metadata-privacy-guide.webp",
        excerpt: "كيف تكشف صور الهاتف إحداثيات موقعك الجغرافي GPS ونوع جهازك، ومتى تبقى مكشوفة في واتساب وتيليجرام."
      },
      {
        id: "android-manifest-security-exported-components-guide",
        title: "ثغرات ملف AndroidManifest.xml وأمن المكونات والـ Deep Links",
        link: "blog/android-manifest-security-exported-components-guide",
        image: "upload/android-manifest-security-guide.webp",
        excerpt: "دليل هندسي لحماية تطبيقك من اختراق الـ Exported Components وثغرات Intent Redirection وDeep Link Hijacking."
      },
      {
        id: "yemen-telecom-companies-codes-services-guide",
        title: "دليل أكواد وخدمات شركات الاتصالات في اليمن (يمن موبايل، يو، سبأفون، واي)",
        link: "blog/yemen-telecom-companies-codes-services-guide",
        image: "upload/yemen-telecom-codes-guide.webp",
        excerpt: "المرجع الشامل لأكواد استعلام الرصيد، باقات 4G، تحويل الرصيد، سلفني، والكاشف الذكي لجميع الشبكات."
      },
      {
        id: "yemen-4g-modem-settings-security-guide",
        title: "ضبط إعدادات مودم يمن فورجي 4G: تغيير كلمة السر وحماية الرصيد",
        link: "blog/yemen-4g-modem-settings-security-guide",
        image: "upload/yemen-4g-modem-settings-guide.webp?v=1.1.48",
        excerpt: "دليل عملي للدخول لإعدادات المودم، تغيير كلمة السر، إخفاء الشبكة والباركود QR، وتحديد السرعة للمتصلين."
      },
      {
        id: "best-yemen-4g-modem-buying-guide",
        title: "كيف تختار أفضل مودم يمن فورجي 4G؟ دليل الشراء الشامل",
        link: "blog/best-yemen-4g-modem-buying-guide",
        image: "upload/best-yemen-4g-modem-guide.webp?v=1.1.48",
        excerpt: "مقارنة تفصيلية بين المودمات المنزلية والمحمولة ومودمات Cat6 والبطاريات والأسعار لاختيار الأنسب."
      },
      {
        id: "technical-seo-audit-guide",
        title: "الفحص التقني الشامل للمواقع (Technical SEO Audit)",
        link: "blog/technical-seo-audit-guide",
        image: "upload/technical-seo-audit-guide.webp",
        excerpt: "اكتشف الأخطاء البرمجية ومشاكل الأداء التي تمنع موقعك من تصدر نتائج بحث جوجل."
      },
      {
        id: "kmp-data-management-room-datastore",
        title: "إتقان إدارة البيانات في KMP: Room و DataStore",
        link: "blog/kmp-data-management-room-datastore",
        image: "upload/kmp-data-encryption.webp",
        excerpt: "دليل تطبيقي شامل لاستخدام مكتبات Room KMP و DataStore الرسمية لتخزين البيانات وتأمينها."
      },
      {
        id: "kmp-vs-flutter-comparison",
        title: "KMP vs Flutter: أيهما تختار لمشروعك القادم؟",
        link: "blog/kmp-vs-flutter-comparison",
        image: "upload/kmp-vs-flutter.webp",
        excerpt: "مقارنة تقنية شاملة تساعدك على الاختيار بين أداء Kotlin Multiplatform الأصيل وسرعة تطوير Flutter."
      },
      {
        id: "iis-hardening-guide",
        title: "دليل تأمين خادم IIS ضد الهجمات السيبرانية",
        link: "blog/iis-hardening-guide",
        image: "upload/iis-hardening-guide.webp",
        excerpt: "تعلم كيفية إغلاق الثغرات الأمنية في IIS وتعطيل بروتوكولات التشفير القديمة ومنع التجسس."
      },
      {
        id: "yemen-internet-comparison-4g-adsl-fiber",
        title: "يمن فورجي أم فايبر؟ مقارنة شاملة",
        link: "blog/yemen-internet-comparison-4g-adsl-fiber",
        image: "upload/yemen-internet-comparison.webp?v=1.1.48",
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
        image: "upload/yemen-4g.webp?v=1.1.48",
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
const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values());
let displayPosts = [];
if (manualIds) {
const idsArr = manualIds.split(',').map(id => id.trim());
displayPosts = uniquePosts.filter(post => idsArr.includes(post.id));
} else {
displayPosts = uniquePosts
.filter(post => !currentPath.includes(post.link))
.slice(0, limit);
}
if (displayPosts.length === 0) return;
this.innerHTML = `
<section class="ct-related-posts"><h3 class="ct-section-title">${customTitle}</h3><div class="ct-related-grid">
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
</div></section>
`;
}
}
if (!customElements.get('site-related-posts')) {
customElements.define('site-related-posts', SiteRelatedPosts);
}

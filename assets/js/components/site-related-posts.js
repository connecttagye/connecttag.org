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
        id: "telegram-bot-webhook-security-guide",
        title: "الدليل الهندسي لبناء وتأمين بوتات تيليجرام (Telegram Bot API): الفرق بين Long Polling وWebhook وتأمين التوكن",
        link: "blog/telegram-bot-webhook-security-guide",
        image: "upload/telegram-bot-webhook-security-guide.webp",
        excerpt: "لماذا يستهلك getUpdates موارد السيرفر بينما يوفر Webhook استجابة لحظية؟ وكيف تتحقق من الطلبات عبر X-Telegram-Bot-Api-Secret-Token؟"
      },
      {
        id: "telecom-cell-id-mcc-mnc-e164-guide",
        title: "كيف يتعرف هاتفك على البرج والشبكة؟ الدليل الهندسي لمعرّفات الأبراج (MCC/MNC وCell-ID وTAC) ومعيار E.164",
        link: "blog/telecom-cell-id-mcc-mnc-e164-guide",
        image: "upload/telecom-cell-id-mcc-mnc-e164-guide.webp",
        excerpt: "تشريح الهوية العالمية للخلية (CGI/ECGI) وأكواد شبكات الجوال في اليمن (MCC 421)، وكيف يخزّن المطورون أرقام الهواتف وفق معيار ITU-T E.164."
      },
      {
        id: "app-privacy-policy-play-store-guide",
        title: "لماذا يرفض متجر Google Play وأبل وأدسنس سياسة الخصوصية؟ دليل إعداد سياسة الخصوصية واستمارة Data Safety",
        link: "blog/app-privacy-policy-play-store-guide",
        image: "upload/app-privacy-policy-play-store-guide.webp",
        excerpt: "الأخطاء القاتلة التي تسبب رفض التطبيقات في مراجعة Google Play وApp Store وأدسنس، وكيف تطابق الصلاحيات مع استمارة Data Safety."
      },
      {
        id: "offline-gps-yemen-emergency-guide",
        title: "هل يعمل الـ GPS في الهاتف بدون إنترنت؟ الدليل العملي للملاحة البرية وأرقام الطوارئ في اليمن",
        link: "blog/offline-gps-yemen-emergency-guide",
        image: "upload/offline-gps-yemen-emergency-guide.webp",
        excerpt: "كيف تتصل شريحة GNSS بالأقمار الصناعية مباشرةً لتحديد الموقع والسرعة بدون أبراج، وكيف تستعد للسفر عبر رفيق الدرب وأرقام الطوارئ."
      },
      {
        id: "android-accessibility-security-guide",
        title: "سلاح ذو حدين في أندرويد: كيف تعمل خدمة تسهيلات الاستخدام في الأتمتة ولماذا تطلبها البرمجيات الخبيثة؟",
        link: "blog/android-accessibility-security-guide",
        image: "upload/android-accessibility-security-guide.webp",
        excerpt: "كيف توظف تطبيقات الأتمتة المحلية مثل نَسَق (TouchFlow) خدمة تسهيلات الاستخدام، ولماذا فرضت جوجل قيود الإعدادات المقيدة في أندرويد 13+؟"
      },
      {
        id: "android-mdm-kiosk-mode-guide",
        title: "كيف تقفل الهواتف والأجهزة اللوحية على تطبيق عمل واحد؟ دليل أنظمة MDM ووضع الكشك (Kiosk Mode)",
        link: "blog/android-mdm-kiosk-mode-guide",
        image: "upload/android-mdm-kiosk-mode-guide.webp",
        excerpt: "شرح هندسي لتقنية Device Owner وLock Task Mode في أندرويد لمنع الموظفين أو الطلاب من الخروج من تطبيق العمل عبر منظومة زِمام."
      },
      {
        id: "android-deep-links-guide",
        title: "الدليل العملي للروابط العميقة (Deep Links وAndroid App Links) وإعداد ملف assetlinks.json",
        link: "blog/android-deep-links-guide",
        image: "upload/android-deep-links-guide.webp",
        excerpt: "الفرق بين Custom URI Schemes وIntent URLs وAndroid App Links الموثقة، وخطوات إعداد ملف assetlinks.json ببصمة SHA-256."
      },
      {
        id: "zakat-calculation-accounting-guide",
        title: "دليل حساب زكاة المال وعروض التجارة والذهب: القواعد المحاسبية لتقييم البضاعة والديون وفرق العملات",
        link: "blog/zakat-calculation-accounting-guide",
        image: "upload/zakat-money-trade-gold-accounting-guide.webp",
        excerpt: "المعادلة المحاسبية المعتمدة لحساب زكاة عروض التجارة (النقدية + المخزون بسعر البيع + الديون المرجوة − الالتزامات الحالة) ونصاب الذهب."
      },
      {
        id: "small-business-accounting-guide",
        title: "كيف تدير حسابات متجرك، الديون الآجلة، وجرد المخزون بدون أخطاء؟ الفرق بين القيد المفرد والمزدوج",
        link: "blog/small-business-accounting-guide",
        image: "upload/small-business-accounting-inventory-debt-guide.webp",
        excerpt: "أشهر 5 أخطاء تتسبب في تآكل رأس مال المتاجر، والمقارنة الرقمية بين القيد المفرد والقيد المزدوج وضبط الفواتير والمخزون."
      },
      {
        id: "lte-wifi-signal-rsrp-sinr-guide",
        title: "ماذا تعني أرقام RSRP وSINR وRSSI في المودم والهاتف؟ الدليل الهندسي لقراءة قوة إشارة الأبراج والواي فاي",
        link: "blog/lte-wifi-signal-rsrp-sinr-guide",
        image: "upload/lte-wifi-signal-rsrp-sinr-guide.webp",
        excerpt: "الفرق الهندسي بين قوة الإشارة (RSRP) ونقائها من التشويش (SINR) وجدول القيم المثالية بالـ dBm لاختيار أفضل مكان للمودم."
      },
      {
        id: "jwt-security-debugging-guide",
        title: "تشريح رموز المصادقة الرقمية (JWT - JSON Web Tokens): كيف تعمل، أشهر ثغراتها الأمنية، وفحصها محلياً",
        link: "blog/jwt-security-debugging-guide",
        image: "upload/jwt-json-web-tokens-security-guide.webp",
        excerpt: "الدليل الهندسي لبنية JWT وفق RFC 7519، الفرق بين HS256 وRS256، وأشهر الثغرات الأمنية وكيفية فحص الرموز داخل المتصفح بأمان."
      },
      {
        id: "ui-color-palette-wcag-guide",
        title: "دليل اختيار الألوان وبناء الهوية اللونية للمواقع والتطبيقات وفق قاعدة 60-30-10 ومعيار التباين WCAG",
        link: "blog/ui-color-palette-wcag-guide",
        image: "upload/ui-color-palette-wcag-contrast-guide.webp",
        excerpt: "كيف تستخرج لوحة ألوان متناسقة وتضمن نسبة التباين القياسية (4.5:1) لاجتياز فحص Google Lighthouse وتصميم الوضع الليلي."
      },
      {
        id: "seo-article-writing-guide",
        title: "دليل كتابة المقالات والشروحات المتوافقة مع السيو (SEO): معايير E-E-A-T وسياسات مشرفي المواقع",
        link: "blog/seo-article-writing-guide",
        image: "upload/how-to-write-seo-articles-tutorials-guide.webp",
        excerpt: "المنهجية الشاملة لصياغة المقالات والشروحات الاحترافية وفق Google Search Essentials وهيكلة العناوين ومعايير E-E-A-T."
      },
      {
        id: "image-optimization-webp-avif-guide",
        title: "دليل تحسين الصور للمواقع والتطبيقات: المقارنة الشاملة بين WebP وAVIF وPNG وتقليل الحجم 70%",
        link: "blog/image-optimization-webp-avif-guide",
        image: "upload/image-optimization-webp-vs-avif-guide.webp",
        excerpt: "مقارنة عملية بالأرقام بين صيغ الصور الحديثة WebP وAVIF وPNG وJPEG، وكيف تحسّن مؤشر LCP وتضغط صور موقعك داخل المتصفح."
      },
      {
        id: "ip-cctv-security-guide",
        title: "دليل تركيب وتأمين كاميرات المراقبة الشبكية (IP CCTV): اختيار العدسة وحساب الهاردسك ومنع الاختراق",
        link: "blog/ip-cctv-security-guide",
        image: "upload/ip-cctv-camera-installation-security-guide.webp",
        excerpt: "المقارنة الهندسية بين كاميرات IP PoE وAnalog HD، جدول حساب سعة القرص الصلب بضغط H.265+، وتأمين الـ NVR ضد الاختراق."
      },
      {
        id: "imei-number-check-guide",
        title: "ما هو رقم IMEI في الهاتف والمودم؟ شرح فحصه عبر *#06# وكشف الأجهزة المجددة أو المقلدة",
        link: "blog/imei-number-check-guide",
        image: "upload/what-is-imei-number-check-guide.webp",
        excerpt: "التشريح الهندسي لرقم IMEI ورمز TAC وخوارزمية Luhn، وخطوات مطابقة الرقم لكشف الهواتف المجددة والمودمات المعدلة."
      },
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
        image: "upload/yemen-4g-app-balance-modem-guide.webp?v=1.1.54",
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
        image: "upload/yemen-4g-modem-settings-guide.webp?v=1.1.54",
        excerpt: "دليل عملي للدخول لإعدادات المودم، تغيير كلمة السر، إخفاء الشبكة والباركود QR، وتحديد السرعة للمتصلين."
      },
      {
        id: "best-yemen-4g-modem-buying-guide",
        title: "كيف تختار أفضل مودم يمن فورجي 4G؟ دليل الشراء الشامل",
        link: "blog/best-yemen-4g-modem-buying-guide",
        image: "upload/best-yemen-4g-modem-guide.webp?v=1.1.54",
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
        image: "upload/yemen-internet-comparison.webp?v=1.1.54",
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
        image: "upload/yemen-4g.webp?v=1.1.54",
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

    // 3. Determine which posts to show
    if (manualIds) {
      // Manual selection by ID
      const idsArr = manualIds.split(',').map(id => id.trim());
      displayPosts = uniquePosts.filter(post => idsArr.includes(post.id));
    } else {
      // Smart Auto-Filtering: Exclude current article and pick others in order
      displayPosts = uniquePosts
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
if (!customElements.get('site-related-posts')) {
  customElements.define('site-related-posts', SiteRelatedPosts);
}

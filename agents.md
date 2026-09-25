# إرشادات وتعليمات الوكلاء الذكاء الاصطناعي (AI Agent Guidelines)
## مستودع موقع وتطبيقات كونكت تاق (ConnectTag.org)

هذا الملف يحتوي على القواعد والمعايير الإلزامية التي يجب على جميع الوكلاء والمطورين الالتزام بها عند إنشاء أو تعديل أي ملف في هذا المشروع، وخاصة صفحات **سياسات الخصوصية (Privacy Policies)** و**شروط الاستخدام (Terms of Use)**.

---

## 1. القواعد الصارمة لصفحات سياسات الخصوصية وشروط الاستخدام

> [!IMPORTANT]
> وثائق الخصوصية والشروط هي وثائق قانونية وتوعوية موجهة للمستخدم النهائي (End-User) ولجان مراجعة المتاجر (Google Play / App Store) وهيئات الامتثال القانوني (GDPR / CCPA). لا يجوز صياغتها كـ "مواصفة برمجية فنية" أو تسريب تفاصيل تنفيذ داخلية للمطورين.

### القاعدة الأولى: حظر معرّفات الصلاحيات التقنية (No Raw Permission Identifiers)
* **المحظور (NEVER DO)**:
  * يُمنع منعاً باتاً كتابة أسماء أو ثوابت الصلاحيات البرمجية بصيغتها المكتوبة في كود أندرويد أو ملف `AndroidManifest.xml`.
  * أمثلة محظورة:
    * ❌ `ACCESS_FINE_LOCATION`
    * ❌ `ACCESS_COARSE_LOCATION`
    * ❌ `QUERY_ALL_PACKAGES`
    * ❌ `PACKAGE_USAGE_STATS`
    * ❌ `android.permission.VIBRATE`
    * ❌ `android.permission.INTERNET`
    * ❌ `POST_NOTIFICATIONS`
    * ❌ `READ_MEDIA_IMAGES`
* **المعيار المعتمد (ALWAYS DO)**:
  * الإفصاح بلغة إنسانية مفهومة ومبسطة (Plain Language) توضح **نوع البيانات** و**الغرض الوظيفي للمستخدم**.
  * أمثلة معتمدة:
    * ✅ الموقع الجغرافي (الموقع الدقيق والتقريبي) / Location Data (Precise & Approximate Location)
    * ✅ إذن الوصول لقائمة التطبيقات المثبتة / Installed Applications Access
    * ✅ إحصائيات استخدام التطبيقات / Application Usage Statistics
    * ✅ إذن الاهتزاز والتغذية اللمسية / Vibration & Haptic Feedback Permission
    * ✅ الاتصال بالإنترنت / Network Access

---

### القاعدة الثانية: حظر نصوص «إصدار المتجر» (No Store-Edition App Labeling)
* **المحظور (NEVER DO)**:
  * يُمنع تماماً وسم التطبيق باسم متجر في ترويسات السياسة أو وسوم الميتا أو متن النص كما لو كان إصداراً مجتزأً.
  * أمثلة محظورة:
    * ❌ «إصدار Google Play» أو «نسخة Google Play»
    * ❌ «Google Play Edition» أو «Google Play Build»
    * ❌ «لا يجمع إصدار Google Play جهات الاتصال...»
* **المعيار المعتمد (ALWAYS DO)**:
  * السياسة ترتبط **بالتطبيق كمنتج متكامل** باسمه الرسمي وتاريخ السريان:
    * ✅ `تطبيق: وِجهة (Wejhah) · تاريخ النفاذ: سبتمبر 2026`
    * ✅ `App: Wejhah · Effective Date: September 2026`
    * ✅ «لا يجمع التطبيق جهات الاتصال...» / «The application does not collect contacts...»
  * **الاستثناء المسموح فقط**: ذكر المتجر في سياق **الالتزام بالسياسات** مثل: *«توافقاً مع سياسات متجر Google Play لمطوري البرامج»* أو *«استمارة أمان البيانات (Data Safety) في Google Play»*.

---

### القاعدة الثالثة: حظر أسماء المكتبات وأطر العمل البرمجية (No Internal Libraries / Frameworks)
* **المحظور (NEVER DO)**:
  * يُمنع منعاً باتاً ذكر أسماء المكتبات البرمجية أو أدوات التطوير الداخلية التي لا تعني المستخدم النهائي أو المراجع القانوني.
  * أمثلة محظورة:
    * ❌ `Room Database` أو `Room SQLite` أو `Room DB`
    * ❌ `Jetpack DataStore`
    * ❌ `Jetpack Compose UI` أو `Jetpack Compose Layouts`
    * ❌ `Google Tink Cryptography` أو `AndroidX Security`
    * ❌ أسماء مكتبات الشبكات أو الحقن: `Retrofit`, `Ktor`, `OkHttp`, `Hilt`, `Dagger`
    * ❌ أسماء واجهات برمجية بنمط الكود مثل: `CallScreeningService`
* **المعيار المعتمد (ALWAYS DO)**:
  * التركيز على **مكان المعالجة وطبيعة الحماية القانونية والأمنية**:
    * ✅ «قاعدة بيانات محلية آمنة ومشفرة على جهازك داخل مساحة التخزين الخاصة بالتطبيق (App Sandboxed Storage)»
    * ✅ `secure local on-device sandboxed storage`
    * ✅ «خوارزميات التشفير القياسية المعتمدة محلياً» / `industry-standard cryptographic protocols`
    * ✅ «تصاميم الواجهات وتجربة الاستخدام» / `user interface designs`
    * ✅ «خدمة فحص وتصفية المكالمات الرسمية بنظام أندرويد» / `Android Telecom Call Screening framework`

---

## 2. مصفوفة الصياغة المعتمدة (Quick Reference Table)

| الصياغة المحظورة (Do NOT use) | الصياغة العربية المعتمدة | الصياغة الإنجليزية المعتمدة |
| :--- | :--- | :--- |
| `ACCESS_FINE_LOCATION`<br>`ACCESS_COARSE_LOCATION` | الموقع الجغرافي (الموقع الدقيق والتقريبي) | Location Data (Precise & Approximate Location) |
| `QUERY_ALL_PACKAGES` | الوصول لقائمة التطبيقات المثبتة | Installed Applications Access |
| `PACKAGE_USAGE_STATS` | إحصائيات استخدام التطبيقات | Application Usage Statistics |
| `android.permission.VIBRATE` | إذن الاهتزاز والتغذية اللمسية | Vibration & Haptic Feedback Permission |
| `android.permission.INTERNET` | الاتصال بالإنترنت | Network Access |
| `إصدار Google Play`<br>`Google Play Edition` | *(تُحذف ويُكتفى باسم التطبيق)* | *(Omit and use the App name directly)* |
| `Room Database`<br>`Room SQLite` | قاعدة بيانات محلية آمنة على جهازك | Secure local on-device database / sandboxed storage |
| `Jetpack DataStore` | مساحة التخزين الخاصة والمعزولة للتطبيق | Sandboxed local app preferences |
| `Google Tink & AndroidX Security` | معايير التشفير القياسية المعتمدة محلياً | Robust industry-standard encryption protocols |
| `Jetpack Compose UI` | تصاميم الواجهات التفاعلية | User interface designs & layouts |

---

## 3. إرشادات معمارية عامة لمشروع ConnectTag

1. **مكونات الويب المعيارية (Web Components)**:
   * يجب دائماً الحفاظ على استدعاء المكونات الرسمية: `<site-header>`, `<site-footer>`, `<site-policy-header>`, `<site-breadcrumb>`, إلخ.
2. **ثنائية اللغة (Bilingual Consistency)**:
   * أي تحديث يُجرى على القسم العربي (`dir="rtl"`) يجب أن يقابله تحديث متكافئ تماماً في القسم الإنجليزي (`dir="ltr"`).
3. **أمان البيانات وحذف الحسابات**:
   * التأكد دائماً من وجود روابط صفحة حذف البيانات عند الإشارة لسياسات تخزين البيانات وحذفها للتطبيقات التي تتطلب ذلك وفق معايير Google Play 2026.

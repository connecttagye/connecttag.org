# تحديث وتحسين PWA لـ كونكت تاق

تحسين تجربة تطبيق الويب التقدمي (PWA) من خلال تحديث ملفات التعريف (Manifest) وإستراتيجيات التخزين المؤقت (Service Worker).

## Proposed Changes

### [PWA Configuration]

#### [MODIFY] [manifest.json](file:///F:/my-software-projects/JavaScript/connecttagsite/connecttag.org/manifest.json)
- إضافة اختصارات (Shortcuts) للوصول السريع.
- إضافة تصنيفات (Categories).
- تحسين وصف التطبيق ومعرف الـ ID.

#### [MODIFY] [head-includes.js](file:///F:/my-software-projects/JavaScript/connecttagsite/connecttag.org/assets/js/components/head-includes.js)
- توحيد لون السمة (theme-color) مع ملف manifest.

### [Service Worker]

#### [MODIFY] [sw.js](file:///F:/my-software-projects/JavaScript/connecttagsite/connecttag.org/sw.js)
- تطبيق إستراتيجية `Stale-While-Revalidate` للملفات الثابتة (CSS, JS, Images).
- تحسين معالجة الملفات غير الموجودة في التخزين المؤقت.

## Verification Plan

### Automated Tests
- استخدام Lighthouse في Chrome للتحقق من نقاط PWA.

### Manual Verification
- التحقق من ظهور الاختصارات عند الضغط المطول على الأيقونة (في الأندرويد).
- التأكد من عمل الموقع في وضع Offline.
- التأكد من تطابق لون شريط الحالة مع الهوية البصرية.

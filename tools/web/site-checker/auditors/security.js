export function checkSecurity(doc, html, url) {
    if (url === 'Manual Code') {
        const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
        const usesHttp = canonical.startsWith('http://');
        return {
            title: 'أمان الموقع (HTTPS)',
            fixKey: 'أمان الموقع (HTTPS)',
            value: usesHttp ? 'رابط Canonical يستخدم HTTP ⚠️' : 'فحص كود محلي ✅',
            status: usesHttp ? 'warn' : 'pass',
            weight: 10,
            priority: 'minor',
            msg: usesHttp
                ? 'الكود يحتوي على رابط Canonical ببروتوكول HTTP غير المشفر. تأكد من استخدام HTTPS.'
                : 'يتم فحص الكود محلياً؛ تأكد من تفعيل شهادة SSL (HTTPS) على خادم الاستضافة الفعلي.'
        };
    }

    const isHttps = Boolean(url && url.toLowerCase().startsWith('https://'));
    return {
        title: 'أمان الموقع (HTTPS)',
        fixKey: 'أمان الموقع (HTTPS)',
        value: isHttps ? 'مشفر SSL/TLS ✅' : 'غير مشفر (HTTP) ❌',
        status: isHttps ? 'pass' : 'fail',
        weight: 15,
        priority: 'critical',
        msg: isHttps
            ? 'اتصال الموقع آمن ومشفر بشهادة SSL/TLS، مما يحمي بيانات الزوار ويعزز الثقة في محركات البحث.'
            : 'الموقع يستخدم بروتوكول HTTP غير الآمن! يجب تفعيل شهادة SSL وإجبار التحويل إلى HTTPS فوراً.'
    };
}

export function checkSecHeaders(doc, html, url, files, security = {}) {
    if (url === 'Manual Code') {
        const hasMetaCsp = !!doc.querySelector('meta[http-equiv="Content-Security-Policy" i]');
        return {
            title: 'رؤوس الحماية (Security Headers)',
            fixKey: 'رؤوس الحماية (Security Headers)',
            value: hasMetaCsp ? 'وسم CSP موجود في الكود ✅' : 'تُفحص عبر الرابط المباشر ℹ️',
            status: 'pass',
            weight: 5,
            priority: 'minor',
            msg: 'رؤوس الحماية (HTTP Headers) تُرسل من الخادم وتُفحص بالكامل عند التحليل عبر رابط الموقع (URL).'
        };
    }

    const normalizedSec = {};
    Object.keys(security || {}).forEach(k => {
        normalizedSec[k.toLowerCase()] = security[k];
    });

    if (doc.querySelector('meta[http-equiv="Content-Security-Policy" i]')) {
        normalizedSec['content-security-policy'] = true;
    }

    const targetHeaders = [
        { key: 'content-security-policy', label: 'CSP' },
        { key: 'x-frame-options', label: 'X-Frame-Options' },
        { key: 'strict-transport-security', label: 'HSTS' },
        { key: 'x-content-type-options', label: 'X-Content-Type' },
        { key: 'referrer-policy', label: 'Referrer-Policy' }
    ];

    const present = targetHeaders.filter(h => Boolean(normalizedSec[h.key]));
    const missing = targetHeaders.filter(h => !normalizedSec[h.key]);

    let status = 'pass';
    if (present.length === 0) status = 'fail';
    else if (missing.some(m => m.key === 'content-security-policy' || m.key === 'x-frame-options')) status = 'warn';

    const value = present.length === targetHeaders.length
        ? 'مكتملة بالكامل ✅'
        : `${present.length}/${targetHeaders.length} مفعلة (${missing.map(m => m.label).join('، ')} مفقودة)`;

    const msg = status === 'pass'
        ? 'رؤوس الأمان الأساسية مفعلة وتحمي الموقع من هجمات XSS وClickjacking.'
        : `رؤوس الأمان التالية غير مفعلة على الخادم: (${missing.map(m => m.label).join('، ')}). يُنصح بإضافتها لرفع مستوى الحماية.`;

    return {
        title: 'رؤوس الحماية (Security Headers)',
        fixKey: 'رؤوس الحماية (Security Headers)',
        value,
        status,
        weight: 12,
        priority: status === 'fail' ? 'critical' : 'moderate',
        msg
    };
}

export function checkMixedContent(doc) {
    const resourceSelectors = [
        'script[src^="http://"]',
        'link[rel="stylesheet"][href^="http://"]',
        'img[src^="http://"]',
        'iframe[src^="http://"]',
        'video[src^="http://"]',
        'audio[src^="http://"]',
        'source[src^="http://"]',
        'object[data^="http://"]'
    ];

    const insecureNodes = Array.from(doc.querySelectorAll(resourceSelectors.join(', ')));
    const count = insecureNodes.length;

    return {
        title: 'المحتوى المختلط (Mixed Content)',
        fixKey: 'المحتوى المختلط (Mixed Content)',
        value: count === 0 ? 'سليم (لا توجد موارد HTTP) ✅' : `${count} موارد غير آمنة (HTTP) ❌`,
        status: count === 0 ? 'pass' : 'fail',
        weight: 12,
        priority: count > 0 ? 'critical' : 'minor',
        msg: count === 0
            ? 'جميع الموارد المضمنة (صور، سكربتات، ملفات تنسيق) تُحمّل عبر اتصالات آمنة.'
            : `تم رصد ${count} مورد داخل الصفحة يتم استدعاؤه عبر بروتوكول HTTP غير المشفر، مما قد يؤدي لحظرها في المتصفحات الحديثة.`
    };
}

export function checkExternalLinksSafety(doc) {
    const blankLinks = Array.from(doc.querySelectorAll('a[target="_blank"]'))
        .filter(a => {
            const href = (a.getAttribute('href') || '').trim();
            return /^https?:\/\//i.test(href);
        });

    if (blankLinks.length === 0) {
        return {
            title: 'أمان النوافذ الخارجية (Tabnabbing)',
            fixKey: 'أمان الروابط الخارجية',
            value: 'آمن ✅',
            status: 'pass',
            weight: 8,
            priority: 'minor',
            msg: 'لا توجد روابط خارجية تفتح في نوافذ جديدة بدون حماية.'
        };
    }

    const unsafeLinks = blankLinks.filter(a => {
        const rel = (a.getAttribute('rel') || '').toLowerCase();
        return !rel.includes('noopener') && !rel.includes('noreferrer');
    });

    const count = unsafeLinks.length;
    return {
        title: 'أمان النوافذ الخارجية (Tabnabbing)',
        fixKey: 'أمان الروابط الخارجية',
        value: count === 0 ? `محمية (${blankLinks.length} روابط) ✅` : `${count} روابط بدون rel="noopener" ⚠️`,
        status: count === 0 ? 'pass' : 'warn',
        weight: 8,
        priority: 'minor',
        msg: count === 0
            ? 'جميع الروابط الخارجية التي تفتح في تبويب جديد تستخدم سمة الحماية rel="noopener".'
            : `يوجد ${count} رابط يستخدم target="_blank" بدون سمة rel="noopener noreferrer"، مما قد يعرض الصفحة لثغرة Reverse Tabnabbing.`
    };
}

export function checkRedirectionRules(doc, html, url, files, security, performance, redirects) {
    if (!redirects || Object.keys(redirects).length === 0) return null;

    const hasProtocolRedirect = redirects.protocolUpgrade;
    const hasWwwConsistency = redirects.wwwConsistency;

    let status = (hasProtocolRedirect || redirects.isHttps) ? 'pass' : 'fail';
    let msg = 'قواعد التوجيه التلقائي (HTTPS / WWW) تعمل بشكل سليم.';

    if (!redirects.isHttps) {
        status = 'fail';
        msg = 'الموقع لا يفرض التوجيه التلقائي إلى HTTPS، مما يعرض الزوار لخطر اعتراض البيانات.';
    } else if (hasWwwConsistency === false) {
        status = 'warn';
        msg = 'يوجد تضارب في توجيه النطاق بين النسخة المزودة بـ www وبدونها، مما قد يسبب تكرار الأرشفة.';
    }

    return {
        title: 'قواعد التحويل (Redirection)',
        fixKey: 'أمان الموقع (HTTPS)',
        value: redirects.isHttps ? 'تحويل HTTPS مفعل ✅' : 'HTTP فقط ❌',
        status,
        weight: 12,
        priority: status === 'fail' ? 'critical' : 'moderate',
        msg
    };
}

export function checkPagePrivacy(doc) {
    const privacyKeywords = ['خصوصية', 'الخصوصية', 'privacy', 'legal', 'policy', 'بيانات'];
    const found = Array.from(doc.querySelectorAll('a')).some(a => {
        const text = (a.textContent || '').toLowerCase();
        const href = (a.getAttribute('href') || '').toLowerCase();
        return privacyKeywords.some(k => text.includes(k) || href.includes(k));
    });

    return {
        title: 'سياسة الخصوصية',
        value: found ? 'موجودة ✅' : 'مفقودة ❌',
        status: found ? 'pass' : 'fail',
        weight: 10,
        priority: 'moderate',
        msg: found
            ? 'تم العثور على رابط لصفحة سياسة الخصوصية، وهو معيار أساسي للامتثال القانوني وقبول الإعلانات.'
            : 'الموقع يفتقر لرابط واضح لصفحة سياسة الخصوصية، وهو مطلب ضروري لثقة المستخدمين وشبكات الإعلانات مثل Google AdSense.'
    };
}

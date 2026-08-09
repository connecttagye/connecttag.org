export function checkSecurity(doc, html, url) {
    const isHttps = url && url.startsWith('https');
    return {
        title: 'أمان الموقع (HTTPS)',
        value: isHttps ? 'مشفر SSL ✅' : 'غير مشفر ❌',
        status: isHttps ? 'pass' : 'fail',
        weight: 15,
        priority: 'critical',
        msg: isHttps ? 'اتصالك آمن ومشفر باستخدام شهادة SSL.' : 'الموقع يستخدم بروتوكول HTTP غير آمن. يجب تفعيل SSL لحماية بيانات المستخدمين وتحسين تصنيف البحث.'
    };
}

export function checkSecHeaders(d, h, u, f, security) {
    const missing = ['content-security-policy', 'x-frame-options'].filter(h => !security[h]);
    const status = missing.length === 0 ? 'pass' : 'warn';
    const msg = status === 'pass' ? 'رؤوس الأمان الأساسية مفعلة.' : `رؤوس الأمان (${missing.join(', ')}) مفقودة. هذه الرؤوس تحمي من هجمات XSS و Clickjacking.`;

    return {
        title: 'رؤوس الحماية',
        value: missing.length === 0 ? 'موجودة ✅' : 'ناقصة ❌',
        status: status,
        weight: 10,
        priority: 'moderate',
        msg: msg
    };
}

export function checkRedirectionRules(doc, html, url, files, security, performance, redirects) {
    if (!redirects || Object.keys(redirects).length === 0) return null;

    const hasProtocolRedirect = redirects.protocolUpgrade;
    const hasWwwConsistency = redirects.wwwConsistency;

    let status = (hasProtocolRedirect || redirects.isHttps) ? 'pass' : 'fail';
    let msg = 'نظام التحويل (HTTPS/WWW) يعمل بشكل صحيح.';

    if (!redirects.isHttps) {
        status = 'fail';
        msg = 'الموقع لا يجبر استخدام HTTPS. هذا يشكل خطراً أمنياً.';
    } else if (!hasWwwConsistency) {
        status = 'warn';
        msg = 'يوجد تضارب في استخدام www. قد يؤدي ذلك لمحتوى مكرر في جوجل.';
    }

    return {
        title: 'قواعد التحويل (Redirection)',
        value: redirects.isHttps ? 'HTTPS مفعل ✅' : 'HTTP فقط ❌',
        status: status,
        weight: 12,
        priority: status === 'fail' ? 'critical' : 'moderate',
        msg: msg
    };
}

export function checkPagePrivacy(doc) {
    const found = Array.from(doc.querySelectorAll('a')).some(a => ['خصوصية', 'privacy', 'legal'].some(k => a.innerText.toLowerCase().includes(k) || a.href.toLowerCase().includes(k)));
    return {
        title: 'سياسة الخصوصية',
        value: found ? 'موجودة ✅' : 'مفقودة ❌',
        status: found ? 'pass' : 'fail',
        weight: 10,
        priority: 'moderate',
        msg: found ? 'رابط سياسة الخصوصية موجود.' : 'موقعك يفتقر لصفحة سياسة الخصوصية، وهو أمر ضروري للأمان والثقة.'
    };
}

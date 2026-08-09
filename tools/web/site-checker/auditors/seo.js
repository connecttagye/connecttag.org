export function checkTitle(doc) {
    const t = doc.querySelector('title')?.innerText.trim() || '';
    const len = t.length;
    let status = 'pass';
    let msg = 'عنوان الصفحة مثالي لمحركات البحث.';

    if (!t) {
        status = 'fail';
        msg = 'عنوان الصفحة مفقود تماماً! هذا يضر بالأرشفة بشكل كبير.';
    } else if (len < 30) {
        status = 'warn';
        msg = `العنوان قصير جداً (${len} حرف). يفضل أن يكون بين 30-60 حرفاً لظهور أفضل.`;
    } else if (len > 60) {
        status = 'warn';
        msg = `العنوان طويل جداً (${len} حرف). سيتم قص الجزء الزائد في نتائج بحث جوجل.`;
    }

    return {
        title: `عنوان الصفحة (${len}/60 حرفاً)`,
        value: t || 'مفقود',
        status: status,
        weight: 15,
        priority: 'critical',
        msg: msg
    };
}

export function checkDescription(doc) {
    const d = doc.querySelector('meta[name="description"]')?.content.trim() || '';
    const len = d.length;
    let status = 'pass';
    let msg = 'الوصف الوصفي ممتاز ويساعد في زيادة نسبة النقر.';

    if (!d) {
        status = 'fail';
        msg = 'الوصف الميتا مفقود. جوجل ستعرض نصاً عشوائياً بدلاً منه.';
    } else if (len < 120) {
        status = 'warn';
        msg = 'الوصف قصير بعض الشيء. استغل المساحة المتاحة (120-160 حرفاً) لوصف المحتوى بدقة.';
    } else if (len > 160) {
        status = 'warn';
        msg = 'الوصف طويل جداً. سيتم قص الأجزاء الأخيرة في نتائج البحث.';
    }

    return {
        title: `الوصف الوصفي (${len}/160 حرفاً)`,
        value: d || 'مفقود',
        status: status,
        weight: 12,
        priority: 'moderate',
        msg: msg
    };
}

export function checkHeadings(doc) {
    const h1s = doc.querySelectorAll('h1').length;
    let status = 'pass';
    let msg = 'توزيع الوسوم (H1) صحيح ومنظم.';

    if (h1s === 0) {
        status = 'fail';
        msg = 'لا يوجد وسم H1 في الصفحة. كل صفحة يجب أن تحتوي على عنوان رئيسي واحد.';
    } else if (h1s > 1) {
        status = 'warn';
        msg = `يوجد ${h1s} وسوم H1. يفضل وجود وسم واحد فقط لتوضيح الهيكل لمحركات البحث.`;
    }

    return {
        title: 'الوسم الرئيسي (H1)',
        value: `${h1s} وسوم`,
        status: status,
        weight: 10,
        priority: 'moderate',
        msg: msg
    };
}

export function checkHeadingStructure(doc) {
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const levels = headings.map(h => parseInt(h.tagName[1]));
    let gapFound = false;
    let msg = 'هيكل العناوين متسلسل ومنطقي (لا توجد مستويات مفقودة).';

    for (let i = 0; i < levels.length - 1; i++) {
        if (levels[i+1] > levels[i] + 1) {
            gapFound = true;
            msg = `تم اكتشاف خلل في تسلسل العناوين (انتقال من H${levels[i]} إلى H${levels[i+1]}). يجب عدم القفز بين المستويات.`;
            break;
        }
    }

    return {
        title: 'تسلسل العناوين (Heading Hierarchy)',
        value: gapFound ? 'غير منطقي ❌' : 'منظم ✅',
        status: gapFound ? 'warn' : 'pass',
        weight: 7,
        priority: 'minor',
        msg: msg
    };
}

export function checkKeywordGap(doc) {
    const title = doc.querySelector('title')?.innerText.toLowerCase() || '';
    const desc = doc.querySelector('meta[name="description"]')?.content.toLowerCase() || '';
    const bodyText = doc.body.innerText.toLowerCase();

    const stopWords = ['هذا', 'على', 'في', 'من', 'إلى', 'عن', 'مع', 'أنه', 'كان', 'تم'];
    const extractKeywords = (str) => (str.match(/[\u0600-\u06FF\w]{4,}/g) || [])
        .filter(w => !stopWords.includes(w));

    const metaWords = [...new Set([...extractKeywords(title), ...extractKeywords(desc)])];
    const missingInBody = metaWords.filter(w => !bodyText.includes(w));

    let status = 'pass';
    let msg = 'الكلمات المفتاحية في العنوان والوصف مدعومة بشكل جيد في محتوى الصفحة.';

    if (missingInBody.length > 0) {
        status = 'warn';
        msg = `الكلمات (${missingInBody.slice(0, 3).join(', ')}) موجودة في العنوان/الوصف ولكنها نادرة في المحتوى. هذا قد يضعف الـ SEO.`;
    }

    return {
        title: 'فجوة الكلمات المفتاحية (Keyword Gap)',
        value: missingInBody.length > 0 ? `نقص في ${missingInBody.length} كلمات` : 'توافق تام ✅',
        status: status,
        weight: 10,
        priority: 'moderate',
        msg: msg
    };
}

export function exploreLinks(doc, baseUrl) {
    const linksList = document.getElementById('links-list');
    if (!linksList) return;

    linksList.innerHTML = Array.from(doc.querySelectorAll('a')).slice(0, 15).map(a => {
        const h = a.getAttribute('href') || '';
        const text = a.innerText.trim() || 'بدون نص';
        const isDead = !h || h === '#' || h.startsWith('javas');
        const isExternal = h.startsWith('http');

        const badgeClass = isDead ? 'badge-dead' : (isExternal ? 'badge-external' : 'badge-internal');
        const badgeText = isDead ? 'وهمي' : (isExternal ? 'خارجي' : 'داخلي');
        const icon = isDead ? 'fa-unlink' : (isExternal ? 'fa-external-link' : 'fa-link');

        return `
            <tr>
                <td>
                    <div class="link-text-wrapper">
                        <i class="fa ${icon} small text-muted"></i>
                        ${text.slice(0, 30)}${text.length > 30 ? '...' : ''}
                    </div>
                </td>
                <td>
                    <span class="badge-link ${badgeClass}">
                        ${badgeText}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <span class="link-url-text" title="${h}">${h}</span>
                        <button class="copy-link-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${h}'); window.showToast?.('تم نسخ الرابط', 'success')" title="نسخ الرابط">
                            <i class="fa fa-clone"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

export function checkImages(doc) {
    const imgs = Array.from(doc.querySelectorAll('img'));
    const missingAlt = imgs.filter(i => !i.alt).length;
    let status = missingAlt === 0 ? 'pass' : 'warn';
    let msg = status === 'pass' ? 'جميع الصور تحتوي على نصوص بديلة.' : `يوجد ${missingAlt} صور تفتقر للنص البديل (alt). هذا يضر بالـ SEO وبسهولة الوصول.`;

    return {
        title: 'النصوص البديلة للصور',
        value: missingAlt > 0 ? `${missingAlt} بدون alt` : 'موجودة ✅',
        status: status,
        weight: 10,
        priority: 'moderate',
        msg: msg
    };
}

export function analyzeKeywords(doc) {
    const words = (doc.body.innerText.toLowerCase().match(/[\u0600-\u06FF\w]{4,}/g) || []);
    const counts = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    document.getElementById('keyword-results').innerHTML = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(k => `<div class="keyword-pill"><span>${k[1]}</span> ${k[0]}</div>`).join('');
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) phrases.push(`${words[i]} ${words[i + 1]}`);
    const pCounts = {};
    phrases.forEach(p => pCounts[p] = (pCounts[p] || 0) + 1);
    document.getElementById('phrase-results').innerHTML = Object.entries(pCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(p => `<div class="keyword-pill" style="background:var(--bg-app)"><span>${p[1]}</span> ${p[0]}</div>`).join('');
    document.getElementById('stat-words').innerText = words.length;
}

export function updateSocialPreview(doc, url) {
    const t = doc.querySelector('title')?.innerText || '...';
    const d = doc.querySelector('meta[name="description"]')?.content || '...';
    document.getElementById('google-title').innerText = t;
    document.getElementById('google-desc').innerText = d;
    document.getElementById('google-url').innerText = url || 'https://example.com';
    document.getElementById('title-char-count').innerText = t.length;
    document.getElementById('desc-char-count').innerText = d.length;
}

export function checkSchema(doc) {
    const hasLdJson = !!doc.querySelector('script[type="application/ld+json"]');
    const hasMicrodata = !!doc.querySelector('[itemscope]');
    const found = hasLdJson || hasMicrodata;
    return {
        title: 'البيانات المنظمة (Schema)',
        value: found ? 'مكتشفة ✅' : 'غير موجودة ❌',
        status: found ? 'pass' : 'warn',
        weight: 10,
        priority: 'moderate',
        msg: found ? 'موقعك يستخدم البيانات المنظمة لتحسين الظهور في نتائج البحث.' : 'نقترح إضافة Schema.org لمساعدة محركات البحث على فهم محتوى صفحتك بشكل أفضل.'
    };
}

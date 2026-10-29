import { extractCleanText, ARABIC_STOPWORDS, ENGLISH_STOPWORDS } from './content.js';

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function checkTitle(doc) {
    const t = doc.querySelector('title')?.textContent.trim() || '';
    const len = t.length;
    let status = 'pass';
    let msg = 'عنوان الصفحة مثالي ومتوافق مع معايير العرض في محركات البحث.';

    if (!t) {
        status = 'fail';
        msg = 'عنوان الصفحة (<title>) مفقود تماماً! هذا يؤثر سلباً وبشدة على الأرشفة ونسبة النقر.';
    } else if (len < 25) {
        status = 'warn';
        msg = `العنوان قصير (${len} حرفاً). يفضل أن يتراوح بين 30 و60 حرفاً لاستهداف الكلمات المفتاحية بفعالية.`;
    } else if (len > 65) {
        status = 'warn';
        msg = `العنوان طويل (${len} حرفاً). قد يتم اقتطاع الجزء الزائد في نتائج بحث جوجل (الحد المثالي 60 حرفاً).`;
    }

    return {
        title: `عنوان الصفحة (${len}/60 حرفاً)`,
        fixKey: 'عنوان الصفحة (Title)',
        value: t || 'مفقود ❌',
        status,
        weight: 15,
        priority: !t ? 'critical' : 'moderate',
        msg
    };
}

export function checkDescription(doc) {
    const d = (
        doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="Description"]')?.getAttribute('content') ||
        ''
    ).trim();
    const len = d.length;
    let status = 'pass';
    let msg = 'الوصف التعريفي ممتاز ويساعد في رفع نسبة النقر إلى الظهور (CTR).';

    if (!d) {
        status = 'fail';
        msg = 'الوصف التعريفي (Meta Description) مفقود. ستقوم محركات البحث باقتطاع نص عشوائي من الصفحة.';
    } else if (len < 70) {
        status = 'warn';
        msg = `الوصف قصير نسبياً (${len} حرفاً). استغل المساحة المتاحة (110 إلى 160 حرفاً) لإقناع الزائر بالنقر.`;
    } else if (len > 165) {
        status = 'warn';
        msg = `الوصف طويل (${len} حرفاً). سيتم قص النهاية في صفحات نتائج البحث (SERP).`;
    }

    return {
        title: `الوصف التعريفي (${len}/160 حرفاً)`,
        fixKey: 'الوصف التعريفي (Meta Description)',
        value: d || 'مفقود ❌',
        status,
        weight: 12,
        priority: !d ? 'critical' : 'moderate',
        msg
    };
}

export function checkIndexability(doc) {
    const robotsMeta = (
        doc.querySelector('meta[name="robots"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="googlebot"]')?.getAttribute('content') ||
        ''
    ).toLowerCase();

    const hasNoIndex = robotsMeta.includes('noindex');
    const hasNoFollow = robotsMeta.includes('nofollow');

    let status = 'pass';
    let value = robotsMeta ? `مسموح (${robotsMeta}) ✅` : 'مسموح تلقائياً ✅';
    let msg = 'الصفحة متاحة لمحركات البحث للأرشفة وتتبع الروابط.';

    if (hasNoIndex) {
        status = 'fail';
        value = `ممنوع من الأرشفة (${robotsMeta}) ❌`;
        msg = 'تحذير حرج: الصفحة تحتوي على وسم (noindex) الذي يمنع ظهورها في نتائج جوجل تماماً!';
    } else if (hasNoFollow) {
        status = 'warn';
        value = `منع تتبع الروابط (${robotsMeta}) ⚠️`;
        msg = 'الصفحة قابلة للأرشفة ولكنها تمنع عناكب البحث من تتبع الروابط الموجودة بداخلها (nofollow).';
    }

    return {
        title: 'قابلية الأرشفة (Indexability)',
        fixKey: 'قابلية الأرشفة (Meta Robots)',
        value,
        status,
        weight: 15,
        priority: hasNoIndex ? 'critical' : 'minor',
        msg
    };
}

export function checkCanonical(doc, html, url) {
    const canonicalEl = doc.querySelector('link[rel="canonical"]');
    const rawHref = canonicalEl?.getAttribute('href')?.trim() || '';

    if (!rawHref) {
        return {
            title: 'الرابط الأساسي (Canonical)',
            fixKey: 'الرابط الأساسي (Canonical)',
            value: 'غير محدد ❌',
            status: 'warn',
            weight: 8,
            priority: 'moderate',
            msg: 'يُنصح بإضافة وسم Canonical لتحديد النسخة الأصلية للصفحة ومنع مشكلة المحتوى المكرر.'
        };
    }

    let isValid = true;
    let resolvedHref = rawHref;
    if (url && url !== 'Manual Code') {
        try {
            resolvedHref = new URL(rawHref, url).href;
        } catch {
            isValid = false;
        }
    }

    return {
        title: 'الرابط الأساسي (Canonical)',
        fixKey: 'الرابط الأساسي (Canonical)',
        value: isValid ? `${resolvedHref} ✅` : `${rawHref} (غير صالح ⚠️)`,
        status: isValid ? 'pass' : 'warn',
        weight: 8,
        priority: 'minor',
        msg: isValid
            ? 'وسم Canonical محدد بشكل سليم لحماية الصفحة من تكرار الأرشفة.'
            : 'وسم Canonical موجود ولكن صيغة الرابط غير قياسية.'
    };
}

export function checkViewportAndLang(doc) {
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const lang = doc.documentElement?.getAttribute('lang')?.trim() || '';
    const dir = doc.documentElement?.getAttribute('dir')?.trim() || '';

    if (!viewport) {
        return {
            title: 'التوافق مع الجوال واللغة (Viewport & Lang)',
            fixKey: 'التوافق مع الجوال واللغة',
            value: 'وسم Viewport مفقود ❌',
            status: 'fail',
            weight: 12,
            priority: 'critical',
            msg: 'وسم Viewport مفقود! الصفحة لن تتجاوب بشكل صحيح مع شاشات الهواتف الذكية (Mobile-First Indexing).'
        };
    }

    if (!lang) {
        return {
            title: 'التوافق مع الجوال واللغة (Viewport & Lang)',
            fixKey: 'التوافق مع الجوال واللغة',
            value: 'سمة اللغة (lang) مفقودة ⚠️',
            status: 'warn',
            weight: 10,
            priority: 'moderate',
            msg: 'وسم الجوال موجود، لكن يفضل تحديد لغة المستند في وسم <html lang="ar"> لمساعدة محركات البحث وقارئات الشاشة.'
        };
    }

    return {
        title: 'التوافق مع الجوال واللغة (Viewport & Lang)',
        fixKey: 'التوافق مع الجوال واللغة',
        value: `متجاوب (${lang}${dir ? ` / ${dir}` : ''}) ✅`,
        status: 'pass',
        weight: 10,
        priority: 'minor',
        msg: 'إعدادات العرض على الجوال وسمة لغة المستند مضبوطة بشكل مثالي.'
    };
}

export function checkHeadings(doc) {
    const h1Nodes = Array.from(doc.querySelectorAll('h1'));
    const h1s = h1Nodes.length;
    const firstH1Text = h1Nodes[0]?.textContent.replace(/\s+/g, ' ').trim() || '';

    let status = 'pass';
    let msg = 'توزيع الوسم الرئيسي (H1) صحيح ومنظم.';

    if (h1s === 0) {
        status = 'fail';
        msg = 'لا يوجد وسم H1 في الصفحة. يجب أن تحتوي كل صفحة على عنوان رئيسي واحد يوضح موضوعها.';
    } else if (h1s > 1) {
        status = 'warn';
        msg = `يوجد ${h1s} وسوم H1 في الصفحة. يُفضل الاكتفاء بوسم H1 واحد واستخدام H2/H3 للعناوين الفرعية.`;
    } else if (firstH1Text.length < 5) {
        status = 'warn';
        msg = 'وسم H1 موجود ولكنه فارغ أو قصير جداً ولا يعبر عن محتوى الصفحة.';
    }

    return {
        title: 'الوسم الرئيسي (H1)',
        fixKey: 'الوسم الرئيسي (H1)',
        value: h1s === 1 ? `وسم واحد: "${firstH1Text.slice(0, 45)}${firstH1Text.length > 45 ? '…' : ''}" ✅` : `${h1s} وسوم`,
        status,
        weight: 10,
        priority: h1s === 0 ? 'critical' : 'moderate',
        msg
    };
}

export function checkHeadingStructure(doc) {
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const levels = headings.map(h => parseInt(h.tagName[1], 10));

    if (headings.length === 0) {
        return {
            title: 'تسلسل العناوين (Heading Hierarchy)',
            fixKey: 'تسلسل العناوين (Heading Hierarchy)',
            value: 'لا توجد عناوين ❌',
            status: 'fail',
            weight: 7,
            priority: 'moderate',
            msg: 'الصفحة تخلو تماماً من وسوم العناوين (H1-H6). قسم المحتوى باستخدام عناوين رئيسية وفرعية.'
        };
    }

    let gapFound = false;
    let gapDetail = '';

    for (let i = 0; i < levels.length - 1; i++) {
        if (levels[i + 1] > levels[i] + 1) {
            gapFound = true;
            gapDetail = `انتقال مباشر من H${levels[i]} إلى H${levels[i + 1]}`;
            break;
        }
    }

    const countsSummary = [1, 2, 3]
        .map(lvl => `H${lvl}: ${levels.filter(l => l === lvl).length}`)
        .join(' | ');

    let status = 'pass';
    let msg = 'هيكل العناوين متسلسل ومنطقي دون القفز بين المستويات.';

    if (gapFound) {
        status = 'warn';
        msg = `تم اكتشاف قفزة في تسلسل العناوين (${gapDetail}). يفضل التدرج المنطقي (H1 ثم H2 ثم H3).`;
    } else if (headings.length === 1) {
        status = 'warn';
        msg = 'الصفحة تحتوي على عنوان يتيم فقط بدون عناوين فرعية (H2/H3) لتقسيم الفقرات.';
    }

    return {
        title: 'تسلسل العناوين (Heading Hierarchy)',
        fixKey: 'تسلسل العناوين (Heading Hierarchy)',
        value: `${gapFound ? 'غير متسلسل ⚠️' : 'منظم ✅'} (${countsSummary})`,
        status,
        weight: 7,
        priority: 'minor',
        msg
    };
}

export function checkKeywordGap(doc) {
    const title = (doc.querySelector('title')?.textContent || '').toLowerCase();
    const desc = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').toLowerCase();
    const bodyText = extractCleanText(doc).toLowerCase();

    const extractKeywords = (str) => (str.match(/[\u0600-\u06FFa-zA-Z0-9]{4,}/g) || [])
        .filter(w => !ARABIC_STOPWORDS.includes(w) && !ENGLISH_STOPWORDS.includes(w));

    const metaWords = [...new Set([...extractKeywords(title), ...extractKeywords(desc)])];

    if (metaWords.length === 0) {
        return {
            title: 'فجوة الكلمات المفتاحية (Keyword Gap)',
            fixKey: 'فجوة الكلمات المفتاحية (Keyword Gap)',
            value: 'بيانات الميتا غير كافية ⚠️',
            status: 'warn',
            weight: 10,
            priority: 'moderate',
            msg: 'أضف عنواناً ووصفاً غنيين بالكلمات المفتاحية أولاً ليتم فحص مدى تطابقهما مع محتوى الصفحة.'
        };
    }

    const missingInBody = metaWords.filter(w => !bodyText.includes(w));
    const matchRatio = Math.round(((metaWords.length - missingInBody.length) / metaWords.length) * 100);

    let status = 'pass';
    let msg = 'الكلمات المفتاحية الموجودة في العنوان والوصف مدعومة بشكل ممتاز داخل النص الأساسي للصفحة.';

    if (matchRatio < 50) {
        status = 'fail';
        msg = `أغلب كلمات العنوان/الوصف (${missingInBody.slice(0, 4).join('، ')}) غير مذكورة في متن الصفحة!`;
    } else if (missingInBody.length > 0) {
        status = 'warn';
        msg = `الكلمات (${missingInBody.slice(0, 4).join('، ')}) وردت في العنوان/الوصف لكنها لم تذكر في المحتوى النصي.`;
    }

    return {
        title: 'فجوة الكلمات المفتاحية (Keyword Gap)',
        fixKey: 'فجوة الكلمات المفتاحية (Keyword Gap)',
        value: missingInBody.length > 0 ? `تطابق ${matchRatio}% (نقص ${missingInBody.length} كلمات)` : `توافق تام 100% ✅`,
        status,
        weight: 10,
        priority: 'moderate',
        msg
    };
}

export function classifyLinks(doc, baseUrl) {
    const anchors = Array.from(doc.querySelectorAll('a'));
    let baseHost = '';
    if (baseUrl && baseUrl !== 'Manual Code') {
        try {
            baseHost = new URL(baseUrl).hostname.replace(/^www\./i, '').toLowerCase();
        } catch {
            baseHost = '';
        }
    }

    return anchors.map(a => {
        const rawHref = (a.getAttribute('href') || '').trim();
        const text = (a.textContent || '').replace(/\s+/g, ' ').trim() || a.getAttribute('aria-label') || a.getAttribute('title') || 'بدون نص';
        const rel = (a.getAttribute('rel') || '').toLowerCase();
        const isNofollow = rel.includes('nofollow');

        let type = 'internal';
        let resolvedUrl = rawHref;

        if (!rawHref || rawHref === '#' || /^javascript:/i.test(rawHref)) {
            type = 'dead';
        } else if (rawHref.startsWith('#') || /^(mailto|tel|sms):/i.test(rawHref)) {
            type = 'internal';
        } else if (baseHost) {
            try {
                const parsed = new URL(rawHref, baseUrl);
                resolvedUrl = parsed.href;
                const linkHost = parsed.hostname.replace(/^www\./i, '').toLowerCase();
                type = (linkHost === baseHost || !linkHost) ? 'internal' : 'external';
            } catch {
                type = rawHref.startsWith('http') ? 'external' : 'internal';
            }
        } else {
            type = /^https?:\/\//i.test(rawHref) ? 'external' : 'internal';
        }

        return { rawHref, resolvedUrl, text, type, isNofollow };
    });
}

export function exploreLinks(doc, baseUrl) {
    const linksList = document.getElementById('links-list');
    if (!linksList) return;

    const allLinks = classifyLinks(doc, baseUrl);
    window.__siteCheckerAllLinks = allLinks;
    window.__siteCheckerLinksFilter = 'all';
    window.__siteCheckerLinksLimit = 20;

    renderLinksTable();
}

export function renderLinksTable(filter = window.__siteCheckerLinksFilter || 'all', showAll = false) {
    const linksList = document.getElementById('links-list');
    if (!linksList) return;

    window.__siteCheckerLinksFilter = filter;
    const allLinks = window.__siteCheckerAllLinks || [];
    const filtered = filter === 'all' ? allLinks : allLinks.filter(l => l.type === filter);
    const limit = showAll ? filtered.length : (window.__siteCheckerLinksLimit || 20);
    const visible = filtered.slice(0, limit);

    // Update filter buttons if present
    document.querySelectorAll('[data-link-filter]').forEach(btn => {
        const f = btn.getAttribute('data-link-filter');
        const count = f === 'all' ? allLinks.length : allLinks.filter(l => l.type === f).length;
        btn.classList.toggle('active', f === filter);
        const badge = btn.querySelector('.filter-count');
        if (badge) badge.textContent = count;
    });

    if (visible.length === 0) {
        linksList.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">لا توجد روابط مطابقة لهذا التصنيف</td></tr>`;
        return;
    }

    const rowsHtml = visible.map((l) => {
        const isDead = l.type === 'dead';
        const isExternal = l.type === 'external';

        const badgeClass = isDead ? 'badge-dead' : (isExternal ? 'badge-external' : 'badge-internal');
        const badgeText = isDead ? 'وهمي / فارغ' : (isExternal ? 'خارجي' : 'داخلي');
        const icon = isDead ? 'fa-link-slash' : (isExternal ? 'fa-arrow-up-right-from-square' : 'fa-link');
        const safeText = escapeHtml(l.text.length > 38 ? l.text.slice(0, 38) + '…' : l.text);
        const safeHref = escapeHtml(l.resolvedUrl || l.rawHref || '#');

        return `
            <tr>
                <td>
                    <div class="link-text-wrapper">
                        <i class="fa-solid ${icon} small text-muted"></i>
                        <span>${safeText}</span>
                        ${l.isNofollow ? '<span class="badge bg-secondary ms-1" style="font-size:9px">nofollow</span>' : ''}
                    </div>
                </td>
                <td>
                    <span class="badge-link ${badgeClass}">${badgeText}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <span class="link-url-text" title="${safeHref}">${safeHref}</span>
                        <button type="button" class="copy-link-btn" data-copy-url="${safeHref}" onclick="event.stopPropagation(); navigator.clipboard.writeText(this.getAttribute('data-copy-url')); window.showToast?.('تم نسخ الرابط', 'success')" title="نسخ الرابط">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const moreRow = (!showAll && filtered.length > limit)
        ? `<tr>
            <td colspan="3" class="text-center py-3 bg-light">
                <button type="button" class="btn btn-sm btn-outline-primary fw-bold rounded-pill px-4" onclick="window.filterSiteLinks('${filter}', true)">
                    عرض كافة الروابط (${filtered.length} رابط)
                </button>
            </td>
           </tr>`
        : '';

    linksList.innerHTML = rowsHtml + moreRow;
}

export function checkImages(doc) {
    const imgs = Array.from(doc.querySelectorAll('img'));
    if (imgs.length === 0) {
        return {
            title: 'النصوص البديلة للصور',
            fixKey: 'النصوص البديلة للصور',
            value: 'لا توجد صور في الصفحة',
            status: 'pass',
            weight: 8,
            priority: 'minor',
            msg: 'لا تحتوي الصفحة على وسوم صور (<img>) تتطلب نصوصاً بديلة.'
        };
    }

    const missingAlt = imgs.filter(i => !i.getAttribute('alt') || !i.getAttribute('alt').trim()).length;
    const status = missingAlt === 0 ? 'pass' : (missingAlt <= 2 ? 'warn' : 'fail');
    const msg = status === 'pass'
        ? `جميع الصور (${imgs.length}) تحتوي على نصوص بديلة (alt) وصفية.`
        : `يوجد ${missingAlt} من أصل ${imgs.length} صور تفتقر للنص البديل (alt). هذا يضعف أرشفة الصور وإمكانية الوصول.`;

    return {
        title: 'النصوص البديلة للصور',
        fixKey: 'النصوص البديلة للصور',
        value: missingAlt > 0 ? `${missingAlt}/${imgs.length} بدون alt ❌` : `مكتملة (${imgs.length} صور) ✅`,
        status,
        weight: 10,
        priority: missingAlt > 3 ? 'critical' : 'moderate',
        msg
    };
}

export function analyzeKeywords(doc) {
    const cleanText = extractCleanText(doc).toLowerCase();
    const allWords = (cleanText.match(/[\u0600-\u06FFa-zA-Z]{3,}/g) || []);
    const filteredWords = allWords.filter(w =>
        w.length >= 3 &&
        !ARABIC_STOPWORDS.includes(w) &&
        !ENGLISH_STOPWORDS.includes(w)
    );

    const counts = {};
    filteredWords.forEach(w => {
        counts[w] = (counts[w] || 0) + 1;
    });

    const keywordContainer = document.getElementById('keyword-results');
    if (keywordContainer) {
        const topKeywords = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12);

        keywordContainer.innerHTML = topKeywords.length > 0
            ? topKeywords.map(([word, count]) => {
                const density = allWords.length > 0 ? ((count / allWords.length) * 100).toFixed(1) : '0.0';
                return `<div class="keyword-pill" title="الكثافة: ${density}%"><span>${count}</span> ${escapeHtml(word)} <small class="text-muted">(${density}%)</small></div>`;
            }).join('')
            : '<p class="text-muted small">لا توجد كلمات مفتاحية بارزة كافية.</p>';
    }

    const phraseContainer = document.getElementById('phrase-results');
    if (phraseContainer) {
        const phrases = [];
        for (let i = 0; i < filteredWords.length - 1; i++) {
            phrases.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);
        }
        const pCounts = {};
        phrases.forEach(p => {
            pCounts[p] = (pCounts[p] || 0) + 1;
        });

        const topPhrases = Object.entries(pCounts)
            .filter(([, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        phraseContainer.innerHTML = topPhrases.length > 0
            ? topPhrases.map(([phrase, count]) =>
                `<div class="keyword-pill" style="background:var(--bg-app)"><span>${count}</span> ${escapeHtml(phrase)}</div>`
            ).join('')
            : '<p class="text-muted small">لا توجد عبارات ثنائية مكررة في النص.</p>';
    }

    const statWords = document.getElementById('stat-words');
    if (statWords) {
        const totalWords = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 1).length : 0;
        statWords.innerText = totalWords;
    }
}

export function updateSocialPreview(doc, url) {
    const t = doc.querySelector('title')?.textContent.trim() || 'بدون عنوان للصفحة';
    const d = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim() || 'لا يوجد وصف ميتا محدد لهذه الصفحة...';

    const titleEl = document.getElementById('google-title');
    const descEl = document.getElementById('google-desc');
    const urlEl = document.getElementById('google-url');
    const titleCountEl = document.getElementById('title-char-count');
    const descCountEl = document.getElementById('desc-char-count');

    if (titleEl) titleEl.textContent = t;
    if (descEl) descEl.textContent = d;
    if (urlEl) urlEl.textContent = (url && url !== 'Manual Code') ? url : 'https://example.com';
    if (titleCountEl) titleCountEl.textContent = doc.querySelector('title') ? t.length : 0;
    if (descCountEl) descCountEl.textContent = doc.querySelector('meta[name="description"]') ? d.length : 0;
}

export function checkSchema(doc) {
    const ldScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    const hasMicrodata = !!doc.querySelector('[itemscope]');

    const detectedTypes = new Set();
    let invalidJsonCount = 0;

    const collectTypes = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
            obj.forEach(collectTypes);
            return;
        }
        if (obj['@type']) {
            if (Array.isArray(obj['@type'])) obj['@type'].forEach(t => detectedTypes.add(t));
            else detectedTypes.add(obj['@type']);
        }
        if (Array.isArray(obj['@graph'])) {
            obj['@graph'].forEach(collectTypes);
        }
    };

    ldScripts.forEach(script => {
        const raw = (script.textContent || '').trim();
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            collectTypes(parsed);
        } catch {
            invalidJsonCount++;
        }
    });

    if (invalidJsonCount > 0) {
        return {
            title: 'البيانات المنظمة (Schema.org)',
            fixKey: 'البيانات المنظمة (Schema)',
            value: `خطأ صياغة JSON-LD (${invalidJsonCount}) ⚠️`,
            status: 'warn',
            weight: 10,
            priority: 'moderate',
            msg: 'يوجد وسم JSON-LD في الصفحة ولكنه يحتوي على خطأ في صياغة JSON يمنع جوجل من قراءته.'
        };
    }

    const found = detectedTypes.size > 0 || ldScripts.length > 0 || hasMicrodata;
    const typesList = Array.from(detectedTypes).join(', ');

    return {
        title: 'البيانات المنظمة (Schema.org)',
        fixKey: 'البيانات المنظمة (Schema)',
        value: found ? `مكتشفة ✅ ${typesList ? `(${typesList})` : '(Microdata)'}` : 'غير موجودة ❌',
        status: found ? 'pass' : 'warn',
        weight: 10,
        priority: 'moderate',
        msg: found
            ? `موقعك يوظف البيانات المنظمة (${typesList || 'Microdata'}) لتحسين الظهور الغني (Rich Snippets) في نتائج البحث.`
            : 'نقترح إضافة كود JSON-LD Schema.org لمساعدة محركات البحث على فهم طبيعة الصفحة وعرض النتائج الغنية.'
    };
}

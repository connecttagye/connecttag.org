export function detectCMS(doc, html = '') {
    const lower = html.toLowerCase();
    const generator = (doc?.querySelector('meta[name="generator"]')?.getAttribute('content') || '').toLowerCase();

    if (lower.includes('wp-content') || lower.includes('wp-includes') || generator.includes('wordpress')) return 'WordPress';
    if (lower.includes('salla.sa') || lower.includes('cdn.salla.network') || lower.includes('salla-')) return 'Salla (سلة)';
    if (lower.includes('zid.sa') || lower.includes('media.zid.store')) return 'Zid (زد)';
    if (lower.includes('cdn.shopify.com') || lower.includes('shopify.theme') || generator.includes('shopify')) return 'Shopify';
    if (lower.includes('_next/static') || lower.includes('__next_data__')) return 'Next.js';
    if (lower.includes('_nuxt/') || lower.includes('__nuxt__')) return 'Nuxt.js';
    if (lower.includes('blogger.com') || lower.includes('blogspot.com') || generator.includes('blogger')) return 'Blogger';
    if (lower.includes('wix.com') || lower.includes('wixstatic.com') || generator.includes('wix')) return 'Wix';
    if (lower.includes('webflow.com') || doc?.documentElement?.hasAttribute('data-wf-site')) return 'Webflow';
    if (generator.includes('ghost')) return 'Ghost';
    if (generator.includes('joomla')) return 'Joomla';
    if (generator.includes('drupal')) return 'Drupal';
    if (lower.includes('livewire') || lower.includes('laravel')) return 'Laravel';

    return 'برمجة خاصة / مخصص';
}

export function checkTechStack(doc, html = '') {
    const lower = html.toLowerCase();
    const rules = [
        { name: 'Bootstrap', match: () => lower.includes('bootstrap') },
        { name: 'Tailwind CSS', match: () => lower.includes('tailwind') },
        { name: 'Font Awesome', match: () => lower.includes('font-awesome') || lower.includes('fontawesome') },
        { name: 'Google Fonts', match: () => lower.includes('fonts.googleapis.com') },
        { name: 'jQuery', match: () => lower.includes('jquery') },
        { name: 'React', match: () => lower.includes('react') || !!doc.querySelector('[data-reactroot]') },
        { name: 'Vue.js', match: () => lower.includes('vue.') || !!doc.querySelector('[data-v-]') },
        { name: 'Alpine.js', match: () => lower.includes('alpinejs') || !!doc.querySelector('[x-data]') },
        { name: 'Chart.js', match: () => lower.includes('chart.js') },
        { name: 'AOS Animation', match: () => lower.includes('aos.css') || lower.includes('aos.js') },
        { name: 'Google Analytics', match: () => /g-[a-z0-9]+|ua-\d+-\d+|googletagmanager\.com\/gtag/i.test(html) },
        { name: 'Google Tag Manager', match: () => lower.includes('googletagmanager.com/gtm.js') },
        { name: 'Google AdSense', match: () => lower.includes('adsbygoogle') || /ca-pub-\d+/i.test(html) },
        { name: 'Meta Pixel', match: () => lower.includes('connect.facebook.net') || lower.includes('fbq(') },
        { name: 'Cloudflare', match: () => lower.includes('cloudflare') || lower.includes('cf-ray') },
        { name: 'PWA Manifest', match: () => !!doc.querySelector('link[rel="manifest"]') }
    ];

    const techs = rules.filter(r => r.match()).map(r => r.name);

    return {
        title: 'تقنيات الموقع (Tech Stack)',
        value: techs.length > 0
            ? techs.map(t => `<span class="tech-badge">${t}</span>`).join(' ')
            : 'HTML / CSS قياسي',
        status: 'pass',
        weight: 5,
        priority: 'minor',
        msg: techs.length > 0
            ? `تم رصد ${techs.length} تقنيات ومكتبات برمجية مستخدمة في بناء وتشغيل الصفحة.`
            : 'تعتمد الصفحة على أكواد HTML/CSS قياسية خفيفة بدون مكتبات خارجية معروفة.'
    };
}

export function checkSemanticHTML(doc) {
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'footer'];
    const foundTags = semanticTags.filter(t => doc.querySelector(t));
    const missingTags = semanticTags.filter(t => !doc.querySelector(t));
    const c = foundTags.length;

    let status = 'pass';
    if (c === 0) status = 'fail';
    else if (c < 3 || !doc.querySelector('main')) status = 'warn';

    return {
        title: 'دلالات الـ HTML (Semantic)',
        fixKey: 'دلالات الـ HTML (Semantic)',
        value: c > 0 ? `تستخدم ${c}/6 وسوم (${foundTags.join(', ')}) ✅` : 'تعتمد على Divs فقط ❌',
        status,
        weight: 8,
        priority: c === 0 ? 'moderate' : 'minor',
        msg: status === 'pass'
            ? 'هيكل الصفحة دلالي واضح ويساعد محركات البحث وقارئات الشاشة على فهم أقسام الموقع.'
            : `ينقص الصفحة بعض الوسوم الدلالية الهامة مثل (${missingTags.slice(0, 3).join(', ')}).`
    };
}

export function checkLinkHealth(doc) {
    const allLinks = Array.from(doc.querySelectorAll('a'));
    const deadCount = allLinks.filter(a => {
        const h = (a.getAttribute('href') || '').trim();
        return !h || h === '#' || /^javascript:/i.test(h);
    }).length;

    return {
        title: 'صحة الروابط',
        fixKey: 'صحة الروابط',
        value: deadCount > 0 ? `يوجد ${deadCount} روابط وهمية (#) ⚠️` : `سليمة (${allLinks.length} رابط) ✅`,
        status: deadCount === 0 ? 'pass' : 'warn',
        weight: 6,
        priority: 'moderate',
        msg: deadCount === 0
            ? 'جميع الروابط في الصفحة تحتوي على مسارات صحيحة وقابلة للزحف.'
            : `تم العثور على ${deadCount} رابط فارغ أو يستخدم href="#". استبدل الأزرار التفاعلية بوسم <button> بدلاً من <a>.`
    };
}

export function checkImageOptimization(doc) {
    const imgs = Array.from(doc.querySelectorAll('img'));
    if (imgs.length === 0) {
        return {
            title: 'تحسين الصور والأداء البصري (CLS & WebP)',
            fixKey: 'تحسين الصور وتجربة العرض',
            value: 'لا توجد صور في الصفحة ✅',
            status: 'pass',
            weight: 8,
            priority: 'minor',
            msg: 'الصفحة لا تحتوي على عناصر صور تؤثر على سرعة التحميل أو استقرار التخطيط.'
        };
    }

    const withoutDimensions = imgs.filter(img => !img.getAttribute('width') || !img.getAttribute('height')).length;
    const lazyLoaded = imgs.filter(img => (img.getAttribute('loading') || '').toLowerCase() === 'lazy').length;
    const modernFormats = imgs.filter(img => {
        const src = (img.getAttribute('src') || '').toLowerCase();
        return /\.(webp|avif|svg)(\?|$)/i.test(src) || src.startsWith('data:image/svg');
    }).length;

    const issues = [];
    if (withoutDimensions > 0) issues.push(`${withoutDimensions} بدون أبعاد width/height`);
    if (imgs.length > 2 && lazyLoaded === 0) issues.push('التحميل الكسول (lazy) غير مفعل');
    if (modernFormats < Math.ceil(imgs.length / 2)) issues.push('أغلب الصور بصيغ تقليدية غير مضغوطة');

    const status = issues.length === 0 ? 'pass' : (issues.length === 1 ? 'warn' : 'warn');

    return {
        title: 'تحسين الصور والأداء البصري (CLS & WebP)',
        fixKey: 'تحسين الصور وتجربة العرض',
        value: issues.length === 0
            ? `ممتاز (${modernFormats}/${imgs.length} صيغ حديثة) ✅`
            : `${issues.join(' | ')} ⚠️`,
        status,
        weight: 10,
        priority: 'moderate',
        msg: issues.length === 0
            ? 'الصور مهيأة بأبعاد محددة وصيغ حديثة تمنع انزياح التخطيط (CLS) وتسرع التحميل.'
            : 'لتحسين مؤشرات Core Web Vitals، حدد أبعاد الصور (width/height)، واستخدم صيغة WebP وسمة loading="lazy".'
    };
}

export function checkRenderBlocking(doc) {
    const headScripts = Array.from(doc.querySelectorAll('head script[src]'));
    const blockingScripts = headScripts.filter(s => {
        const isDefer = s.hasAttribute('defer');
        const isAsync = s.hasAttribute('async');
        const isModule = (s.getAttribute('type') || '').toLowerCase() === 'module';
        return !isDefer && !isAsync && !isModule;
    });

    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]').length;
    const blockingCount = blockingScripts.length;

    let status = 'pass';
    let msg = 'لا توجد سكربتات متزامنة تعطل الرسم الأولي للصفحة (First Contentful Paint).';

    if (blockingCount > 2) {
        status = 'fail';
        msg = `يوجد ${blockingCount} ملفات JavaScript في <head> بدون سمة defer أو async، مما يؤخر ظهور الصفحة للمستخدم.`;
    } else if (blockingCount > 0 || stylesheets > 6) {
        status = 'warn';
        msg = blockingCount > 0
            ? `يوجد ${blockingCount} سكربت في <head> يحجب العرض. أضف سمة defer أو async لتحميله بالتوازي.`
            : `يوجد ${stylesheets} ملفات CSS منفصلة؛ يفضل دمجها لتقليل طلبات الشبكة.`;
    }

    return {
        title: 'السكربتات الحاجبة للعرض (Render-Blocking)',
        fixKey: 'السكربتات الحاجبة للعرض',
        value: blockingCount === 0 ? `سريع (0 سكربت حاجب، ${stylesheets} CSS) ✅` : `${blockingCount} سكربت يحجب العرض ⚠️`,
        status,
        weight: 10,
        priority: blockingCount > 2 ? 'critical' : 'moderate',
        msg
    };
}

export function checkDOMComplexity(doc, html, url, files, security, performance = {}) {
    const totalNodes = doc.querySelectorAll('*').length;
    const ttfb = performance?.ttfb || performance?.responseTime || null;

    let status = 'pass';
    let msg = 'حجم شجرة عناصر الصفحة (DOM) خفيف ومثالي لسرعة المعالجة في المتصفح.';

    if (totalNodes > 1500) {
        status = 'warn';
        msg = `تحتوي الصفحة على ${totalNodes} عنصر HTML (الحد الموصى به في Lighthouse أقل من 1500 عنصر).`;
    }

    const ttfbText = ttfb ? ` | الاستجابة: ${ttfb}ms` : '';

    return {
        title: 'تعقيد الصفحة وسرعة الاستجابة (DOM Size)',
        value: `${totalNodes} عنصر HTML${ttfbText} ${status === 'pass' ? '✅' : '⚠️'}`,
        status,
        weight: 8,
        priority: 'minor',
        msg
    };
}

export function checkSocialPresence(doc) {
    const platforms = [
        { name: 'Facebook', domains: ['facebook.com', 'fb.com', 'fb.me'] },
        { name: 'X/Twitter', domains: ['twitter.com', 'x.com'] },
        { name: 'Instagram', domains: ['instagram.com', 'instagr.am'] },
        { name: 'LinkedIn', domains: ['linkedin.com'] },
        { name: 'YouTube', domains: ['youtube.com', 'youtu.be'] },
        { name: 'TikTok', domains: ['tiktok.com'] },
        { name: 'Telegram', domains: ['t.me', 'telegram.me'] },
        { name: 'WhatsApp', domains: ['wa.me', 'whatsapp.com'] },
        { name: 'GitHub', domains: ['github.com'] }
    ];

    const links = Array.from(doc.querySelectorAll('a[href]')).map(a => a.getAttribute('href').toLowerCase());
    const detected = platforms.filter(p => p.domains.some(d => links.some(l => l.includes(d)))).map(p => p.name);

    return {
        title: 'الربط بالشبكات الاجتماعية',
        value: detected.length > 0 ? `مرتبط (${detected.join('، ')}) ✅` : 'غير موجود ❌',
        status: detected.length > 0 ? 'pass' : 'warn',
        weight: 5,
        priority: 'minor',
        msg: detected.length > 0
            ? `الصفحة مرتبطة بحسابات التواصل الاجتماعي (${detected.join('، ')}) مما يعزز موثوقية العلامة التجارية.`
            : 'لم يتم العثور على روابط لحسابات التواصل الاجتماعي داخل الصفحة.'
    };
}

export function checkOpenGraph(doc) {
    const requiredOg = ['og:title', 'og:description', 'og:image', 'og:url'];
    const presentOg = requiredOg.filter(prop =>
        doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content')?.trim()
    );
    const hasTwitterCard = !!doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')?.trim();

    let status = 'pass';
    if (presentOg.length === 0) status = 'fail';
    else if (presentOg.length < 3 || !hasTwitterCard) status = 'warn';

    const missingOg = requiredOg.filter(p => !presentOg.includes(p));

    return {
        title: 'وسوم المشاركة الاجتماعية (OpenGraph & Twitter)',
        fixKey: 'وسوم المشاركة الاجتماعية (OpenGraph)',
        value: status === 'pass'
            ? `مكتملة (${presentOg.length}/4 OG + Twitter Card) ✅`
            : `${presentOg.length}/4 OpenGraph ${hasTwitterCard ? '+ Twitter' : '(بدون Twitter Card)'} ⚠️`,
        status,
        weight: 8,
        priority: 'moderate',
        msg: status === 'pass'
            ? 'جميع وسوم المعاينة الاجتماعية (OpenGraph وTwitter Cards) مهيأة لعرض جذاب عند مشاركة الرابط.'
            : `الوسوم التالية مفقودة عند مشاركة الرابط: (${[...missingOg, ...(hasTwitterCard ? [] : ['twitter:card'])].join('، ')}).`
    };
}

export function updateResourceMap(doc, baseUrl) {
    const resMapEl = document.getElementById('res-map');
    if (!resMapEl) return;

    const res = Array.from(doc.querySelectorAll('script[src], link[rel="stylesheet"][href]'));
    const map = { self: 0, google: 0, cdn: 0, other: 0 };

    let baseHost = '';
    if (baseUrl && baseUrl !== 'Manual Code') {
        try {
            baseHost = new URL(baseUrl).hostname.replace(/^www\./i, '').toLowerCase();
        } catch {
            baseHost = '';
        }
    }

    res.forEach(r => {
        const raw = (r.getAttribute('src') || r.getAttribute('href') || '').toLowerCase();
        if (!raw) return;
        if (raw.includes('google') || raw.includes('gstatic')) {
            map.google++;
        } else if (raw.includes('jsdelivr') || raw.includes('unpkg') || raw.includes('cdnjs') || raw.includes('cloudflare')) {
            map.cdn++;
        } else if (!raw.startsWith('http') || (baseHost && raw.includes(baseHost))) {
            map.self++;
        } else {
            map.other++;
        }
    });

    const sources = [
        { name: 'خادم الموقع', c: map.self, i: 'solid fa-server', color: 'var(--brand-primary)' },
        { name: 'خدمات Google', c: map.google, i: 'brands fa-google', color: '#4285F4' },
        { name: 'شبكات CDN', c: map.cdn, i: 'solid fa-bolt', color: '#10b981' },
        { name: 'مصادر خارجية', c: map.other, i: 'solid fa-globe', color: '#64748b' }
    ];

    resMapEl.innerHTML = sources.map(s => `
        <div class="res-source">
            <span class="res-source-name" style="color:${s.color}"><i class="fa-${s.i}"></i> ${s.name}</span>
            <span class="res-source-count">${s.c}</span>
        </div>
    `).join('');
}

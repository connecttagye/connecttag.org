export function checkCMS(d, html) {
    let cms = html.includes('wp-content') ? 'WordPress' : (html.includes('blogger.com') ? 'Blogger' : 'أخرى');
    return {
        title: 'نظام إدارة المحتوى CMS',
        value: cms,
        status: 'pass',
        weight: 5,
        priority: 'minor'
    };
}

export function checkTechStack(d, html) {
    let techs = [];
    ['bootstrap', 'tailwind', 'jquery', 'react', 'font-awesome'].forEach(t => {
        if (html.toLowerCase().includes(t)) techs.push(t)
    });
    return {
        title: 'تقنيات الموقع (Tech Stack)',
        value: techs.map(t => `<span class="tech-badge">${t}</span>`).join('') || 'غير معروفة',
        status: 'pass',
        weight: 5,
        priority: 'minor'
    };
}

export function checkSemanticHTML(doc) {
    const c = ['main', 'nav', 'footer', 'section', 'article'].filter(t => doc.querySelector(t)).length;
    return {
        title: 'دلالات الـ HTML (Semantic)',
        value: c > 0 ? `تستخدم ${c} وسوم ✅` : 'فقط Divs ❌',
        status: c >= 3 ? 'pass' : 'warn',
        weight: 8,
        priority: 'minor'
    };
}

export function checkLinkHealth(doc) {
    const d = Array.from(doc.querySelectorAll('a')).filter(a => {
        const h = a.getAttribute('href');
        return !h || h === '#' || h.startsWith('javascript');
    }).length;
    return {
        title: 'صحة الروابط',
        value: d > 0 ? `يوجد ${d} روابط وهمية (#) ❌` : 'سليمة ✅',
        status: d === 0 ? 'pass' : 'warn',
        weight: 5,
        priority: 'moderate'
    };
}

export function checkLanguages(doc) {
    const f = ['english', 'العربية', 'lang-en', 'lang-ar', 'hreflang'].some(k => doc.documentElement.innerHTML.toLowerCase().includes(k));
    return {
        title: 'تعدد اللغات',
        value: f ? 'مدعوم ✅' : 'نسخة واحدة',
        status: f ? 'pass' : 'warn',
        weight: 10,
        priority: 'minor'
    };
}

export function checkSocialPresence(doc) {
    const f = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'].some(p => doc.documentElement.innerHTML.includes(p));
    return {
        title: 'الربط الاجتماعي',
        value: f ? 'موجود ✅' : 'غير موجود ❌',
        status: f ? 'pass' : 'warn',
        weight: 5,
        priority: 'minor'
    };
}

export function checkOpenGraph(doc) {
    const f = doc.querySelector('meta[property^="og:"]');
    return {
        title: 'وسوم OpenGraph',
        value: f ? 'موجودة ✅' : 'مفقودة ❌',
        status: f ? 'pass' : 'warn',
        weight: 8,
        priority: 'moderate'
    };
}

export function updateResourceMap(doc, baseUrl) {
    const res = Array.from(doc.querySelectorAll('script[src], link[rel="stylesheet"]'));
    const map = {
        google: 0,
        facebook: 0,
        self: 0,
        other: 0
    };
    res.forEach(r => {
        const s = (r.src || r.href).toLowerCase();
        if (s.includes('google')) map.google++;
        else if (s.includes('facebook')) map.facebook++;
        else if (!s.startsWith('http')) map.self++;
        else map.other++;
    });
    const sources = [{
            name: 'Google',
            c: map.google,
            i: 'brands fa-google',
            color: '#4285F4'
        },
        {
            name: 'Facebook',
            c: map.facebook,
            i: 'brands fa-facebook',
            color: '#1877F2'
        },
        {
            name: 'خادمك',
            c: map.self,
            i: 'solid fa-server',
            color: 'var(--brand-primary)'
        },
        {
            name: 'أخرى',
            c: map.other,
            i: 'solid fa-globe',
            color: '#64748b'
        }
    ];
    document.getElementById('res-map').innerHTML = sources.map(s => (s.c > 0 || s.name === 'خادمك') ? `
        <div class="res-source">
            <span class="res-source-name" style="color:${s.color}"><i class="fa-${s.i}"></i> ${s.name}</span>
            <span class="res-source-count">${s.c}</span>
        </div>` : '').join('');
    document.getElementById('stat-res').innerText = res.length;
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
        const icon = isDead ? 'fa-link-slash' : (isExternal ? 'fa-arrow-up-right-from-square' : 'fa-link');

        return `
            <tr>
                <td>
                    <div class="link-text-wrapper">
                        <i class="fa-solid ${icon} small text-muted"></i>
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
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

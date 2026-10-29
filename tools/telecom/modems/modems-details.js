document.addEventListener('DOMContentLoaded', function() {
    function setNoIndex() {
        if (!document.querySelector('meta[name="robots"]')) {
            const m = document.createElement('meta');
            m.name = 'robots';
            m.content = 'noindex';
            document.head.appendChild(m);
        }
    }

    function loadAdSenseOnce() {
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5795447491202357';
            s.crossOrigin = 'anonymous';
            document.head.appendChild(s);
        }
    }

    function hideLoading() {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.style.display = 'none';
    }

    const params = ModemApp.getQueryParams();
    const slug = params.get('slug');

    if (!slug) {
        setNoIndex();
        window.location.href = './';
        return;
    }

    function processCatalog(catalog) {
        const modem = catalog.find(item => item.slug === slug);
        hideLoading();
        if (modem) {
            renderDetails(modem);
            updateSEOAndMeta(modem);
            renderRelated(catalog, modem);
            loadAdSenseOnce();
            return true;
        }
        return false;
    }

    const localData = ModemApp.getData();
    if (localData && Array.isArray(localData) && localData.length > 0) {
        if (!processCatalog(localData)) {
            setNoIndex();
            ModemApp.showToast('عذراً، المودم المطلوب غير موجود');
            setTimeout(() => { window.location.href = './'; }, 1500);
        }
    } else {
        ModemApp.fetchData(data => {
            if (!processCatalog(data)) {
                setNoIndex();
                ModemApp.showToast('عذراً، المودم المطلوب غير موجود');
                setTimeout(() => { window.location.href = './'; }, 1500);
            }
        }, () => {
            hideLoading();
            ModemApp.showToast('حدث خطأ أثناء تحميل البيانات');
        });
    }

    function renderDetails(m) {
        const displayName = ModemApp.formatDisplayName(m);
        const canonicalHref = `https://connecttag.org/tools/telecom/modems/details?slug=${encodeURIComponent(m.slug)}`;

        // Update <site-breadcrumb> attribute so both UI and JSON-LD BreadcrumbList schema update
        const breadcrumbEl = document.querySelector('site-breadcrumb');
        if (breadcrumbEl) {
            breadcrumbEl.setAttribute('items', JSON.stringify([
                { title: 'الرئيسية', url: 'https://connecttag.org/' },
                { title: 'الأدوات', url: 'https://connecttag.org/tools/' },
                { title: 'الاتصالات والإنترنت', url: 'https://connecttag.org/tools/telecom/' },
                { title: 'دليل مودمات يمن فورجي 4G', url: 'https://connecttag.org/tools/telecom/modems/' },
                { title: displayName, url: canonicalHref, id: 'breadcrumb-active' }
            ]));
        } else {
            const activeCrumb = document.getElementById('breadcrumb-active');
            if (activeCrumb) activeCrumb.textContent = displayName;
        }

        const imgEl = document.getElementById('modem-image');
        const primaryImg = m.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
        const backupImg = m.image?.remoteBackup || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
        imgEl.src = primaryImg;
        imgEl.alt = displayName;
        imgEl.onerror = function() {
            this.onerror = null;
            this.src = backupImg;
        };

        document.getElementById('modem-title').textContent = displayName;
        document.getElementById('modem-brand').textContent = m.brand || 'عام';
        document.getElementById('modem-description').innerHTML = ModemApp.formatDescriptionHtml(m.description || m.shortDescription || '');

        document.getElementById('spec-model').textContent = m.modelOrVersion || m.model || '-';
        document.getElementById('spec-type').textContent = m.category || '-';
        document.getElementById('spec-year').textContent = m.modelYear || '-';

        // Smart 4th spec card: show condition if present, otherwise approximate price or country of origin
        const condCardLabel = document.getElementById('spec-condition-label');
        const condCardIcon = document.getElementById('spec-condition-icon');
        const condCardVal = document.getElementById('spec-condition');

        if (m.condition && m.condition.trim()) {
            if (condCardLabel) condCardLabel.textContent = 'الحالة';
            if (condCardIcon) condCardIcon.className = 'fa-solid fa-circle-info';
            condCardVal.textContent = m.condition;
        } else if (m.price && Number(m.price.currentValue) > 0) {
            if (condCardLabel) condCardLabel.textContent = 'السعر التقريبي';
            if (condCardIcon) condCardIcon.className = 'fa-solid fa-coins';
            const currencyLabel = m.price.currency === 'RYE' ? 'ر.ي' : (m.price.currency || '');
            condCardVal.textContent = `${Number(m.price.currentValue).toLocaleString('en-US')} ${currencyLabel}`.trim();
        } else {
            if (condCardLabel) condCardLabel.textContent = 'بلد المنشأ';
            if (condCardIcon) condCardIcon.className = 'fa-solid fa-earth-asia';
            condCardVal.textContent = m.countryOfOrigin || 'الصين';
        }

        if (m.additional && m.additional.modemSettings) {
            const s = m.additional.modemSettings;
            document.getElementById('config-panel').style.display = 'block';

            const baseLink = (s.loginLink || 'http://192.168.0.1').replace(/\/+$/, '');
            const pathPart = (s.loginLinkPath || '').trim();
            const fullUrl = pathPart ? `${baseLink}${pathPart.startsWith('/') ? '' : '/'}${pathPart}` : baseLink;

            const confLink = document.getElementById('conf-link');
            confLink.textContent = baseLink;
            confLink.href = fullUrl;

            const openPanelBtn = document.getElementById('btn-open-panel');
            if (openPanelBtn) {
                openPanelBtn.href = fullUrl;
            }

            const userRow = document.getElementById('conf-user-row');
            const confUser = document.getElementById('conf-user');
            const isPassOnly = (s.loginBy || '').toUpperCase() === 'PASS';

            if (isPassOnly) {
                if (userRow) userRow.style.display = 'none';
            } else {
                if (userRow) userRow.style.display = 'flex';
                confUser.textContent = s.defaultUserName || 'admin';
            }

            const rawPass = (s.defaultPass || 'admin').trim();
            const passEl = document.getElementById('conf-pass');
            const copyPassBtn = document.getElementById('btn-copy-pass');

            if (rawPass.toLowerCase() === 'out') {
                passEl.textContent = 'مدونة على الملصق خلف المودم';
                passEl.style.direction = 'rtl';
                passEl.style.fontFamily = 'inherit';
                passEl.style.fontSize = '13px';
                passEl.style.color = '#e89a2f';
                if (copyPassBtn) copyPassBtn.style.display = 'none';
            } else {
                passEl.textContent = rawPass;
                passEl.style.direction = 'ltr';
                passEl.style.fontFamily = "'Courier New', monospace";
                passEl.style.fontSize = '15px';
                passEl.style.color = '#006b98';
                if (copyPassBtn) copyPassBtn.style.display = 'inline-flex';
            }
        }
    }

    function updateSEOAndMeta(m) {
        const displayName = ModemApp.formatDisplayName(m);
        const pageTitle = `${displayName} - المواصفات وإعدادات الدخول | كونكت تاق`;
        const cleanDesc = ModemApp.cleanMetaText(
            m.shortDescription || m.summary || m.description || `المواصفات التقنية وإعدادات الدخول لمودم يمن فورجي ${displayName}`
        );
        const canonicalUrl = `https://connecttag.org/tools/telecom/modems/details?slug=${encodeURIComponent(m.slug)}`;
        const imgUrl = m.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

        document.title = pageTitle;
        document.getElementById('meta-description')?.setAttribute('content', cleanDesc);
        document.getElementById('canonical-url')?.setAttribute('href', canonicalUrl);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', cleanDesc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', imgUrl);

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', cleanDesc);
        document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', canonicalUrl);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imgUrl);

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": displayName,
            "image": imgUrl,
            "description": cleanDesc,
            "sku": m.slug || String(m.id || ''),
            "brand": {
                "@type": "Brand",
                "name": m.brand || "Yemen 4G"
            },
            "model": m.modelOrVersion || m.model || "",
            "category": m.category || "مودم 4G",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": String(m.rating?.average || 5),
                "reviewCount": String(Math.max(1, Number(m.rating?.count || 1))),
                "bestRating": "5",
                "worstRating": "1"
            }
        };

        const schemaEl = document.getElementById('schema-product');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schemaData);
    }

    function renderRelated(catalog, currentModem) {
        const container = document.getElementById('related-items-container');
        if (!container) return;

        const others = catalog.filter(item => item.slug !== currentModem.slug);
        // Prioritize same category & brand first
        const scored = others.map(item => {
            let score = 0;
            if (item.category === currentModem.category) score += 2;
            if (item.brand && item.brand === currentModem.brand) score += 3;
            if (item.isNew) score += 1;
            return { item, score };
        }).sort((a, b) => b.score - a.score);

        const sample = scored.slice(0, 4).map(entry => entry.item);
        container.innerHTML = sample.map(item => {
            const name = ModemApp.formatDisplayName(item);
            const primaryImg = item.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
            const backupImg = item.image?.remoteBackup || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
            return `
                <div class="col-6 col-md-3">
                    <a href="details?slug=${encodeURIComponent(item.slug)}" class="related-card">
                        <img src="${primaryImg}"
                             alt="${name}"
                             class="img-fluid"
                             loading="lazy"
                             width="160"
                             height="110"
                             onerror="this.onerror=null;this.src='${backupImg}';">
                        <h5>${name}</h5>
                        <small class="text-muted">${item.category || ''}</small>
                    </a>
                </div>
            `;
        }).join('');
    }
});

function copyText(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.innerText.trim();
    navigator.clipboard.writeText(text).then(() => {
        ModemApp.showToast('تم نسخ: ' + text);
    }).catch(() => {
        ModemApp.showToast('تعذر النسخ');
    });
}

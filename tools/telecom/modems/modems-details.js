document.addEventListener('DOMContentLoaded', function() {
    const params = ModemApp.getQueryParams();
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = './';
        return;
    }

    let rendered = false;
    const cachedData = ModemApp.loadFromCache();
    if (cachedData && Array.isArray(cachedData)) {
        const modem = cachedData.find(item => item.slug === slug);
        if (modem) {
            renderDetails(modem);
            updateSEOAndMeta(modem);
            renderRelated(cachedData.filter(item => item.slug !== slug));
            document.getElementById('loading-screen').style.display = 'none';
            rendered = true;
        }
    }

    ModemApp.fetchData(data => {
        const modem = data.find(item => item.slug === slug);
        if (modem) {
            renderDetails(modem);
            updateSEOAndMeta(modem);
            renderRelated(data.filter(item => item.slug !== slug));
            document.getElementById('loading-screen').style.display = 'none';
        } else if (!rendered) {
            ModemApp.showToast('عذراً، المودم غير موجود');
            setTimeout(() => { window.location.href = './'; }, 1500);
        }
    }, () => {
        if (!rendered) ModemApp.showToast('حدث خطأ أثناء تحميل البيانات');
    }, rendered);

    function renderDetails(m) {
        document.getElementById('breadcrumb-active').textContent = m.modelOrVersion || m.arabicName;

        const imgEl = document.getElementById('modem-image');
        imgEl.src = m.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
        imgEl.alt = `${m.arabicName} ${m.modelOrVersion || ''}`;
        imgEl.onerror = function() {
            this.src = 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
        };

        document.getElementById('modem-title').textContent = `${m.arabicName} ${m.modelOrVersion || ''}`;
        document.getElementById('modem-brand').textContent = m.brand || 'عام';
        document.getElementById('modem-description').textContent = m.description || '';

        document.getElementById('spec-model').textContent = m.modelOrVersion || '-';
        document.getElementById('spec-type').textContent = m.category || '-';
        document.getElementById('spec-year').textContent = m.modelYear || '-';
        document.getElementById('spec-condition').textContent = m.condition || '-';

        if (m.additional && m.additional.modemSettings) {
            const s = m.additional.modemSettings;
            document.getElementById('config-panel').style.display = 'block';

            const link = s.loginLink || 'http://192.168.0.1';
            const confLink = document.getElementById('conf-link');
            confLink.textContent = link;
            confLink.href = link;
            document.getElementById('conf-user').textContent = s.defaultUserName || 'admin';

            const rawPass = (s.defaultPass || 'admin').trim();
            const passEl = document.getElementById('conf-pass');
            const copyPassBtn = document.getElementById('btn-copy-pass');

            if (rawPass.toLowerCase() === 'out') {
                passEl.textContent = 'مسجلة على الملصق خلف المودم';
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
        const pageTitle = `${m.arabicName} ${m.modelOrVersion || ''} - المواصفات والإعدادات - كونكت تاق`;
        const pageDesc = m.description || `المواصفات التقنية وإعدادات الدخول لمودم ${m.arabicName} ${m.modelOrVersion || ''}`;
        const currentUrl = window.location.href;
        const imgUrl = m.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

        document.title = pageTitle;
        document.getElementById('meta-description').setAttribute('content', pageDesc);
        document.getElementById('canonical-url').setAttribute('href', currentUrl);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', pageDesc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', currentUrl);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', imgUrl);

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', pageDesc);
        document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', currentUrl);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imgUrl);

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": `${m.arabicName} ${m.modelOrVersion || ''}`,
            "image": imgUrl,
            "description": pageDesc,
            "brand": {
                "@type": "Brand",
                "name": m.brand || "عام"
            },
            "model": m.modelOrVersion || "",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "1"
            }
        };
        const schemaEl = document.getElementById('schema-product');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schemaData);
    }

    function renderRelated(items) {
        const container = document.getElementById('related-items-container');
        const sample = items.slice(0, 4);
        container.innerHTML = sample.map(item => `
            <div class="col-6 col-md-3">
                <a href="details?slug=${item.slug}" class="related-card">
                    <img src="${item.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp'}"
                         alt="${item.arabicName}"
                         class="img-fluid"
                         onerror="this.src='https://connecttag.org/assets/img/about/connect-tag-it-company.webp';">
                    <h5>${item.arabicName}</h5>
                    <small class="text-muted">${item.modelOrVersion || ''}</small>
                </a>
            </div>
        `).join('');
    }
});

function copyText(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
        ModemApp.showToast('تم نسخ: ' + text);
    }).catch(() => {
        ModemApp.showToast('تعذر النسخ');
    });
}

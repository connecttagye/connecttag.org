document.addEventListener('DOMContentLoaded', function() {
    const params = CompanyApp.getQueryParams();
    const queryCompanyId = params.get('companyId') || params.get('id');
    const querySlug = params.get('slug');

    const listContainer = document.getElementById('packages-list');
    const searchInput = document.getElementById('pkg-search');

    let allCompanyPackages = [];
    let currentCompany = null;
    let currentSearch = '';

    if (!queryCompanyId && !querySlug) {
        window.location.href = './';
        return;
    }

    CompanyApp.fetchData(data => {
        const companies = data.companies || [];
        currentCompany = companies.find(c => (queryCompanyId && String(c.id) === String(queryCompanyId)) || (querySlug && c.slug === querySlug));

        if (!currentCompany) {
            CompanyApp.showToast('عذراً، الشركة غير موجودة');
            setTimeout(() => { window.location.href = './'; }, 1500);
            return;
        }

        setupCompanyHeader(currentCompany);

        const allPackages = data.packages || [];
        allCompanyPackages = allPackages.filter(p => String(p.companyId) === String(currentCompany.id));

        updateSEOAndSchema(currentCompany, allCompanyPackages);
        renderPackages(allCompanyPackages);
    }, msg => showError(msg));

    function setupCompanyHeader(comp) {
        const compName = comp.arName || comp.name || 'الشركة';
        const backUrl = comp.slug ? `details?slug=${encodeURIComponent(comp.slug)}` : `details?id=${encodeURIComponent(comp.id)}`;

        document.getElementById('page-heading').textContent = `باقات وعروض ${compName}`;
        document.getElementById('breadcrumb-company-link').textContent = compName;
        document.getElementById('breadcrumb-company-link').href = backUrl;
        document.getElementById('btn-back-company').href = backUrl;

        if (comp.logo) {
            const logoEl = document.getElementById('comp-badge-logo');
            logoEl.src = comp.logo;
            logoEl.alt = compName;
            logoEl.style.display = 'inline-block';
        }
    }

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilter();
        }, 150);
    });

    function applyFilter() {
        let filtered = allCompanyPackages;
        if (currentSearch) {
            filtered = allCompanyPackages.filter(p => {
                const title = (p.arTitle || p.title || '').toLowerCase();
                const duration = (p.duration || '').toLowerCase();
                const code = (p.codeActivate || '').toLowerCase();
                const price = String(p.price || '');
                return title.includes(currentSearch) || duration.includes(currentSearch) || code.includes(currentSearch) || price.includes(currentSearch);
            });
        }
        renderPackages(filtered);
    }

    function renderPackages(packages) {
        listContainer.innerHTML = '';
        if (packages.length === 0) {
            listContainer.innerHTML = `
                <div class="col-12" style="grid-column: 1 / -1;">
                    <div class="empty-state">
                        <i class="fa-solid fa-box-open fa-3x"></i>
                        <h4>لا توجد باقات متوفرة حالياً</h4>
                        <p class="text-muted">لم يتم العثور على أي باقات مطابقة لعملية البحث.</p>
                    </div>
                </div>
            `;
            return;
        }

        packages.forEach(p => {
            const title = p.arTitle || p.title || 'باقة إنترنت';
            const price = Number(p.price || 0).toLocaleString();
            const duration = p.duration ? `صلاحية ${p.duration}` : 'صلاحية محددة';
            const code = p.codeActivate || '-';
            const dialCode = encodeURIComponent(code);

            const card = document.createElement('div');
            card.className = 'pkg-card';
            card.innerHTML = `
                <div class="pkg-title">${title}</div>
                <div class="pkg-price-wrap">
                    <div class="pkg-price">${price}</div>
                    <span class="pkg-currency">ريال يمني</span>
                </div>
                <div class="pkg-duration">
                    <i class="fa-regular fa-calendar-check"></i> ${duration}
                </div>
                <div class="activate-box">
                    <span class="activate-label">كود تفعيل الباقة المباشر</span>
                    <div class="code-action-row">
                        <span class="activate-code">${code}</span>
                        <div class="actions-btn-group">
                            <button class="btn-act" onclick="copyText('${code}')" title="نسخ الكود">
                                <i class="fa-regular fa-copy"></i> نسخ
                            </button>
                            ${code !== '-' ? `
                            <a href="tel:${dialCode}" class="btn-act" title="طلب الكود فوراً">
                                <i class="fa-solid fa-phone"></i> اتصال
                            </a>` : ''}
                        </div>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    function updateSEOAndSchema(comp, packages) {
        const compName = comp.arName || comp.name || 'الشركة';
        const pageTitle = `باقات وعروض ${compName} - الأسعار وأكواد التفعيل | كونكت تاق`;
        const pageDesc = `دليل كافة باقات الإنترنت والمكالمات لشركة ${compName}. الأسعار، الصلاحية، وأكواد التفعيل المباشرة.`;
        const currentUrl = window.location.href;
        const logoUrl = comp.logo || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

        document.title = pageTitle;
        document.getElementById('meta-description')?.setAttribute('content', pageDesc);
        document.getElementById('canonical-url')?.setAttribute('href', currentUrl);

        document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', pageDesc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', currentUrl);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', logoUrl);

        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', pageDesc);
        document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', currentUrl);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', logoUrl);

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "ItemList",
            "name": `باقات ${compName}`,
            "description": pageDesc,
            "itemListElement": packages.slice(0, 10).map((p, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": p.arTitle || p.title,
                "description": `السعر: ${p.price} ريال - ${p.duration || ''}`
            }))
        };
        const schemaEl = document.getElementById('schema-packages');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schemaData);
    }

    window.copyText = function(text) {
        if (!text || text === '-') return;
        navigator.clipboard.writeText(text).then(() => {
            CompanyApp.showToast('تم نسخ الكود: ' + text);
        }).catch(() => {
            CompanyApp.showToast('تعذر النسخ');
        });
    };

    function showError(message) {
        listContainer.innerHTML = `<div class="col-12 text-center py-5 text-danger font-weight-bold" style="grid-column: 1 / -1;"><i class="fa-solid fa-circle-exclamation fa-2x mb-3"></i><p>${message}</p></div>`;
    }
});

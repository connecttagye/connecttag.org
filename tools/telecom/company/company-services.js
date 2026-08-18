document.addEventListener('DOMContentLoaded', function() {
    const params = CompanyApp.getQueryParams();
    const queryCompanyId = params.get('companyId') || params.get('id');
    const querySlug = params.get('slug');

    const listContainer = document.getElementById('services-list');
    const searchInput = document.getElementById('serviceSearch');

    let allCompanyServices = [];
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

        const allServices = data.services || [];
        allCompanyServices = allServices.filter(s => String(s.companyId) === String(currentCompany.id));

        updateSEOAndSchema(currentCompany, allCompanyServices);
        renderServices(allCompanyServices);
    }, msg => showError(msg));

    function setupCompanyHeader(comp) {
        const compName = comp.arName || comp.name || 'الشركة';
        const backUrl = comp.slug ? `details?slug=${encodeURIComponent(comp.slug)}` : `details?id=${encodeURIComponent(comp.id)}`;

        document.getElementById('page-heading').textContent = `أكواد وخدمات ${compName}`;
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
        let filtered = allCompanyServices;
        if (currentSearch) {
            filtered = allCompanyServices.filter(s => {
                const title = (s.arTitle || s.title || '').toLowerCase();
                const action = (s.actions && s.actions[0] ? s.actions[0].content : '').toLowerCase();
                return title.includes(currentSearch) || action.includes(currentSearch);
            });
        }
        renderServices(filtered);
    }

    function renderServices(services) {
        listContainer.innerHTML = '';
        if (services.length === 0) {
            listContainer.innerHTML = `
                <div class="col-12" style="grid-column: 1 / -1;">
                    <div class="empty-state">
                        <i class="fa-solid fa-bolt fa-3x"></i>
                        <h4>لا توجد خدمات مطابقة للبحث</h4>
                        <p class="text-muted">تأكد من كتابة الكلمة بشكل صحيح أو جرب عبارة أخرى.</p>
                    </div>
                </div>
            `;
            return;
        }

        services.forEach((s, idx) => {
            const action = s.actions && s.actions[0] ? s.actions[0].content : '';
            const isUrl = action.startsWith('http') || action.includes('.ye') || action.includes('.com') || action.includes('.net');
            const title = s.arTitle || s.title || 'خدمة';
            const card = document.createElement('div');
            card.className = 'service-card';

            let actionHtml = '';
            let label = 'كود التفعيل السريع';

            if (isUrl) {
                label = 'بوابة الخدمة الإلكترونية';
                const finalUrl = action.startsWith('http') ? action : `https://${action}`;
                actionHtml = `
                    <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="link-action-box">
                        <span>زيارة موقع الخدمة</span>
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                `;
            } else {
                const hasInput = /\[?input\]?/i.test(action);
                const formattedCode = hasInput
                    ? action.replace(/\[?input\]?/gi, `
                        <input type="tel"
                               id="inline-input-${idx}"
                               class="inline-input-tag"
                               placeholder="رقم الهاتف"
                               inputmode="numeric"
                               oninput="this.classList.toggle('has-val', this.value.trim().length > 0);">
                      `)
                    : action;

                actionHtml = `
                    <div class="code-action-box">
                        <span class="code-text">${formattedCode || '-'}</span>
                        <div class="actions-btn-group">
                            <button class="btn-act" onclick="executeServiceAction('copy', ${idx}, '${action}', ${hasInput})" title="نسخ الكود">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                            <button class="btn-act" onclick="executeServiceAction('dial', ${idx}, '${action}', ${hasInput})" title="اتصال بالكود">
                                <i class="fa-solid fa-phone"></i>
                            </button>
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="card-top">
                    <div class="service-icon-box">
                        <i class="fa-solid ${getIcon(title, isUrl)}"></i>
                    </div>
                    <div class="service-meta">
                        <span class="service-label">${label}</span>
                        <h3 class="service-title">${title}</h3>
                    </div>
                </div>
                ${actionHtml}
            `;
            listContainer.appendChild(card);
        });
    }

    function getIcon(title, isUrl) {
        if (isUrl) return 'fa-globe';
        if (title.includes('رصيد') || title.includes('حساب')) return 'fa-wallet';
        if (title.includes('إنترنت') || title.includes('نت') || title.includes('باقة') || title.includes('فورجي') || title.includes('4G')) return 'fa-wifi';
        if (title.includes('اتصال') || title.includes('دقائق') || title.includes('مكالمات')) return 'fa-phone-volume';
        if (title.includes('سلف') || title.includes('سلفني')) return 'fa-hand-holding-dollar';
        if (title.includes('تحويل')) return 'fa-arrow-right-arrow-left';
        if (title.includes('إلغاء') || title.includes('حظر')) return 'fa-ban';
        return 'fa-bolt';
    }

    window.executeServiceAction = function(actionType, idx, rawCode, hasInput) {
        if (!rawCode || rawCode === '-') return;
        let finalCode = rawCode;
        if (hasInput) {
            const inputEl = document.getElementById(`inline-input-${idx}`);
            const phoneVal = inputEl ? inputEl.value.trim() : '';
            if (!phoneVal) {
                CompanyApp.showToast('يرجى كتابة رقم الهاتف في الحقل أولاً');
                if (inputEl) inputEl.focus();
                return;
            }
            finalCode = rawCode.replace(/\[?input\]?/gi, phoneVal);
        }
        if (actionType === 'copy') {
            navigator.clipboard.writeText(finalCode).then(() => {
                CompanyApp.showToast('تم نسخ الكود: ' + finalCode);
            }).catch(() => {
                CompanyApp.showToast('تعذر النسخ');
            });
        } else if (actionType === 'dial') {
            window.location.href = 'tel:' + encodeURIComponent(finalCode);
        }
    };

    function updateSEOAndSchema(comp, services) {
        const compName = comp.arName || comp.name || 'الشركة';
        const pageTitle = `أكواد وخدمات ${compName} - أرقام وروابط الخدمات السريعة | كونكت تاق`;
        const pageDesc = `دليل كافة الأكواد السريعة، أرقام الاستعلام والتفعيل، وروابط الخدمات الإلكترونية لشركة ${compName} في اليمن.`;
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
            "name": `أكواد وخدمات ${compName}`,
            "description": pageDesc,
            "itemListElement": services.slice(0, 15).map((s, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": s.arTitle || s.title,
                "description": s.actions && s.actions[0] ? s.actions[0].content : ''
            }))
        };
        const schemaEl = document.getElementById('schema-services');
        if (schemaEl) schemaEl.textContent = JSON.stringify(schemaData);
    }

    function showError(message) {
        listContainer.innerHTML = `<div class="col-12 text-center py-5 text-danger font-weight-bold" style="grid-column: 1 / -1;"><i class="fa-solid fa-circle-exclamation fa-2x mb-3"></i><p>${message}</p></div>`;
    }
});

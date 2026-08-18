document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('companies-grid');
    const searchInput = document.getElementById('company-search');

    let allCompanies = [];
    let currentSearch = '';

    const cachedData = CompanyApp.loadFromCache();
    if (cachedData && Array.isArray(cachedData.companies)) {
        allCompanies = cachedData.companies;
        renderCompanies(allCompanies);
        CompanyApp.fetchData(data => {
            allCompanies = data.companies;
            filterAndRender();
        }, null, true);
    } else {
        CompanyApp.fetchData(data => {
            allCompanies = data.companies;
            renderCompanies(allCompanies);
        }, msg => showError(msg));
    }

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = searchInput.value.trim().toLowerCase();
            filterAndRender();
        }, 150);
    });

    function filterAndRender() {
        let filtered = allCompanies;
        if (currentSearch) {
            filtered = allCompanies.filter(c => {
                const name = (c.arName || c.name || '').toLowerCase();
                const desc = (c.arDescription || c.description || '').toLowerCase();
                return name.includes(currentSearch) || desc.includes(currentSearch);
            });
        }
        renderCompanies(filtered);
    }

    function renderCompanies(companies) {
        grid.innerHTML = '';
        if (companies.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fa-solid fa-building-circle-xmark fa-4x"></i>
                        <h4>لم يتم العثور على أي شركة</h4>
                        <p class="text-muted">تأكد من كتابة الاسم بشكل صحيح أو جرب كلمة بحث أخرى.</p>
                    </div>
                </div>
            `;
            return;
        }

        companies.forEach(c => {
            const detailParam = c.slug ? `slug=${encodeURIComponent(c.slug)}` : `id=${encodeURIComponent(c.id)}`;
            const detailUrl = `details?${detailParam}`;

            const cardCol = document.createElement('div');
            cardCol.className = 'col-md-4 col-sm-6';
            cardCol.style.marginBottom = '30px';
            cardCol.innerHTML = `
                <div class="company-card">
                    <div class="company-logo-wrapper">
                        <img src="${c.logo}"
                             alt="شعار شركة ${c.arName || c.name}"
                             class="company-logo"
                             loading="lazy"
                             onerror="this.src='https://connecttag.org/assets/img/connect-tag-official-logo.webp';">
                    </div>
                    <h2 class="company-name">${c.arName || c.name}</h2>
                    <p class="company-desc">${c.arDescription || c.description || 'شركة اتصالات يمنية رائدة تقدم خدمات الجوال والإنترنت والباقات المتنوعة.'}</p>
                    <a href="${detailUrl}" class="btn-details">
                        عرض الخدمات والباقات <i class="fa-solid fa-arrow-left-long"></i>
                    </a>
                </div>
            `;
            grid.appendChild(cardCol);
        });
    }

    function showError(message) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-danger font-weight-bold"><i class="fa-solid fa-circle-exclamation fa-2x mb-3"></i><p>${message}</p></div>`;
    }
});

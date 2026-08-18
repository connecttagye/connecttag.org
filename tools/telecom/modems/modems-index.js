document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('modems-grid');
    const searchInput = document.getElementById('modem-search');
    const countLabel = document.getElementById('results-count');

    let allItems = [];
    let currentFilter = 'all';
    let currentSearch = '';

    const cachedData = ModemApp.loadFromCache();
    if (cachedData && Array.isArray(cachedData)) {
        allItems = cachedData;
        applyFilters();
        updateSchemaItemList(allItems);
        ModemApp.fetchData(data => {
            allItems = data;
            applyFilters();
            updateSchemaItemList(allItems);
        }, null, true);
    } else {
        ModemApp.fetchData(data => {
            allItems = data;
            applyFilters();
            updateSchemaItemList(allItems);
        }, msg => showError(msg));
    }

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            applyFilters();
        });
    });

    // Search Input with Debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = searchInput.value.trim().toLowerCase();
            applyFilters();
        }, 150);
    });

    function applyFilters() {
        let filtered = allItems;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(item => item.category === currentFilter);
        }
        if (currentSearch) {
            filtered = filtered.filter(item => {
                const name = (item.arabicName || '').toLowerCase();
                const model = (item.modelOrVersion || '').toLowerCase();
                const brand = (item.brand || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();
                return name.includes(currentSearch) || model.includes(currentSearch) || brand.includes(currentSearch) || desc.includes(currentSearch);
            });
        }
        renderModems(filtered);
    }

    function renderModems(items) {
        grid.innerHTML = '';
        if (countLabel) countLabel.textContent = `تم العثور على ${items.length} مودم`;

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center" style="width: 100%;">
                    <div class="empty-state">
                        <i class="fa-solid fa-box-open fa-4x"></i>
                        <h4>لم يتم العثور على أي أجهزة تطابق بحثك</h4>
                        <p class="text-muted">جرب استخدام كلمات بحث أخرى أو اختر فئة مختلفة.</p>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="resetFilters()">إعادة ضبط البحث</button>
                    </div>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const isPortable = (item.category && item.category.includes('محمول')) || (item.additional && item.additional.portable);
            const badge = item.isNew
                ? '<span class="card-badge badge-new">جديد</span>'
                : (isPortable ? '<span class="card-badge badge-portable">محمول</span>' : '');

            const targetSlug = encodeURIComponent(item.slug || item.id || '');
            const cardCol = document.createElement('div');
            cardCol.className = 'col-md-4 col-sm-6';
            cardCol.style.marginBottom = '30px';
            cardCol.innerHTML = `
                <div class="modem-card">
                    ${badge}
                    <div class="image-wrapper">
                        <img src="${item.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp'}"
                             alt="${item.arabicName} ${item.modelOrVersion || ''}"
                             loading="lazy"
                             onerror="this.src='https://connecttag.org/assets/img/about/connect-tag-it-company.webp';">
                    </div>
                    <div class="content">
                        <span class="category">${item.category || 'مودم 4G'}</span>
                        <h2>${item.arabicName} ${item.modelOrVersion || ''}</h2>
                        <p class="short-desc">${item.shortDescription || item.description || 'المواصفات الكاملة وإعدادات الدخول لمودم يمن فورجي.'}</p>
                        <a href="details?slug=${targetSlug}" class="btn-view-details">
                            المواصفات الفنية <i class="fa-solid fa-arrow-left-long"></i>
                        </a>
                    </div>
                </div>
            `;
            grid.appendChild(cardCol);
        });
    }

    function updateSchemaItemList(items) {
        const schemaEl = document.getElementById('schema-data');
        if (!schemaEl || !items || items.length === 0) return;

        const itemList = {
            "@type": "ItemList",
            "name": "قائمة مودمات يمن فورجي",
            "numberOfItems": items.length,
            "itemListElement": items.slice(0, 15).map((item, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": `${item.arabicName} ${item.modelOrVersion || ''}`.trim(),
                "url": `https://connecttag.org/tools/telecom/modems/details?slug=${encodeURIComponent(item.slug || '')}`
            }))
        };

        try {
            const schemaObj = JSON.parse(schemaEl.textContent);
            if (schemaObj && Array.isArray(schemaObj['@graph'])) {
                const existingIdx = schemaObj['@graph'].findIndex(node => node['@type'] === 'ItemList');
                if (existingIdx !== -1) {
                    schemaObj['@graph'][existingIdx] = itemList;
                } else {
                    schemaObj['@graph'].push(itemList);
                }
                schemaEl.textContent = JSON.stringify(schemaObj);
            }
        } catch (e) {
            console.warn('Schema injection warning:', e);
        }
    }

    window.resetFilters = function() {
        searchInput.value = '';
        currentSearch = '';
        currentFilter = 'all';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        applyFilters();
    };

    function showError(message) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-danger font-weight-bold" style="width: 100%;"><i class="fa-solid fa-circle-exclamation fa-2x mb-3"></i><p>${message}</p></div>`;
        if (countLabel) countLabel.textContent = '';
    }
});

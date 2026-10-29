document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('modems-grid');
    const searchInput = document.getElementById('modem-search');
    const countLabel = document.getElementById('results-count');

    let allItems = [];
    let currentFilter = 'all';
    let currentSearch = '';

    const localData = ModemApp.getData();
    if (localData && Array.isArray(localData) && localData.length > 0) {
        allItems = localData;
        applyFilters();
        updateSchemaItemList(allItems);
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
        }, 120);
    });

    function applyFilters() {
        let filtered = allItems;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(item => item.category === currentFilter);
        }
        if (currentSearch) {
            filtered = filtered.filter(item => {
                const haystack = [
                    item.arabicName,
                    item.englishName,
                    item.modelOrVersion,
                    item.model,
                    item.brand,
                    item.description,
                    item.shortDescription,
                    item.keyWords,
                    item.keyWordsEnglish,
                    item.additional?.modemSettings?.loginLink
                ].filter(Boolean).join(' ').toLowerCase();
                return haystack.includes(currentSearch);
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
                        <p class="text-muted">جرب استخدام كلمات بحث أخرى (مثل الموديل أو الشركة أو عنوان IP) أو اختر فئة مختلفة.</p>
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

            const displayName = ModemApp.formatDisplayName(item);
            const shortSummary = ModemApp.cleanMetaText(
                item.shortDescription || item.summary || item.description || 'المواصفات الكاملة وإعدادات الدخول لمودم يمن فورجي.'
            );
            const targetSlug = encodeURIComponent(item.slug || item.id || '');
            const primaryImg = item.image?.content || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';
            const backupImg = item.image?.remoteBackup || 'https://connecttag.org/assets/img/about/connect-tag-it-company.webp';

            const cardCol = document.createElement('div');
            cardCol.className = 'col-md-4 col-sm-6';
            cardCol.style.marginBottom = '30px';
            cardCol.innerHTML = `
                <div class="modem-card">
                    ${badge}
                    <div class="image-wrapper">
                        <img src="${primaryImg}"
                             alt="${displayName}"
                             loading="lazy"
                             width="260"
                             height="195"
                             onerror="this.onerror=null;this.src='${backupImg}';">
                    </div>
                    <div class="content">
                        <span class="category">${item.category || 'مودم 4G'} · ${item.brand || 'Yemen 4G'}</span>
                        <h2>${displayName}</h2>
                        <p class="short-desc">${shortSummary}</p>
                        <a href="details?slug=${targetSlug}" class="btn-view-details">
                            المواصفات وإعدادات الدخول <i class="fa-solid fa-arrow-left-long"></i>
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
            "itemListElement": items.map((item, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": ModemApp.formatDisplayName(item),
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

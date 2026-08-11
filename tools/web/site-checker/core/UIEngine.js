export default class UIEngine {
    constructor() {
        this.resourceChart = null;
    }

    showLoader(text = 'جاري تحليل البيانات…') {
        const loader = document.getElementById('loader');
        const loaderText = document.getElementById('loader-text');
        if (loader) loader.style.display = 'block';
        if (loaderText) loaderText.innerText = text;

        document.querySelectorAll('.results-dashboard').forEach(d => d.classList.remove('visible'));
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        document.querySelectorAll('.results-dashboard').forEach(d => d.classList.add('visible'));
    }

    updateResourceChart(data) {
        const ctx = document.getElementById('resourceChart')?.getContext('2d');
        if (!ctx) return;

        if (this.resourceChart) this.resourceChart.destroy();

        this.resourceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['سكربتات (JS)', 'تنسيقات (CSS)', 'صور (Images)'],
                datasets: [{
                    data: [data.scripts, data.styles, data.images],
                    backgroundColor: ['#006b98', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Cairo', size: 14 } } }
                }
            }
        });
    }

    renderResults(audits, categories, finalScore, siteMeta) {
        if (siteMeta) {
            this.renderSummaryCard(siteMeta);
            this.renderBasicPagesCard(siteMeta.basicPages);
            if (siteMeta.social) this.renderSocialPreviews(siteMeta.social);
        }
        this.renderAuditCards(audits);
        this.renderCategoryScores(categories);
        this.updateFinalScore(finalScore);
    }

    renderSummaryCard(meta) {
        const container = document.getElementById('results-dashboard');
        if (!container) return;

        const totalResources = meta.resources.scripts + meta.resources.styles + meta.resources.images;
        const isHeavy = totalResources > 50;

        // Remove existing summary card if any
        const existing = document.getElementById('site-summary-card');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.id = 'site-summary-card';
        card.className = 'summary-card-pro mb-4';

        card.innerHTML = `
            <div class="summary-header">
                <div class="site-icon-box border">
                    ${meta.favicon ? `<img src="${meta.favicon}" width="32" height="32" alt="favicon">` : '<i class="fa-solid fa-globe text-primary"></i>'}
                </div>
                <div class="flex-grow-1">
                    <h4 class="mb-1 fw-900 text-dark d-flex align-items-center flex-wrap gap-2">
                        ${meta.title}
                        <span class="badge bg-primary-soft text-primary px-3 py-2" style="font-size: 11px; border-radius: 8px;">
                            <i class="fa-solid fa-gear"></i> ${meta.cms}
                        </span>
                    </h4>
                    <span class="text-muted small ltr-text">${meta.url}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    ${isHeavy ? '<span class="badge bg-danger rounded-pill px-3 py-2" style="font-size:11px"><i class="fa-solid fa-triangle-exclamation"></i> موقع ثقيل</span>' : ''}
                    <span class="badge-link ${meta.isRoot ? 'badge-internal' : 'badge-external'} px-3 py-2">
                        <i class="fa-solid ${meta.isRoot ? 'fa-house' : 'fa-sitemap'}"></i> ${meta.typeLabel}
                    </span>
                </div>
            </div>
            <div class="summary-body grid-stats">
                <div class="stat-item">
                    <span class="label">الخادم</span>
                    <span class="value"><i class="fa-solid fa-server text-primary"></i> ${meta.server}</span>
                </div>
                <div class="stat-item">
                    <span class="label">حجم الصفحة</span>
                    <span class="value"><i class="fa-regular fa-hdd text-primary"></i> ${meta.pageSize} KB</span>
                </div>
                <div class="stat-item">
                    <span class="label">الأرشفة</span>
                    <span class="value">${meta.isIndexable}</span>
                </div>
                <div class="stat-item">
                    <span class="label">ملف Robots</span>
                    <span class="value">${meta.robots || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="label">ميزانية الموارد</span>
                    <div class="resource-mini-grid">
                        <div class="res-mini-item"><i class="fa-brands fa-css3-alt text-primary"></i>${meta.resources.styles}</div>
                        <div class="res-mini-item"><i class="fa-solid fa-code text-warning"></i>${meta.resources.scripts}</div>
                        <div class="res-mini-item"><i class="fa-regular fa-image text-success"></i>${meta.resources.images}</div>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="label">الروابط</span>
                    <div class="d-flex flex-column gap-1">
                        <span class="value text-dark" style="font-size: 11px;">
                            <i class="fa-solid fa-link text-primary"></i> <span class="text-primary">${meta.links.internal}</span> / <span class="text-success">${meta.links.external}</span>
                        </span>
                        <span class="small fw-bold text-muted">
                            <i class="fa-solid fa-share-nodes text-info"></i> اجتماعياً: <span class="text-info">${meta.links.social}</span>
                        </span>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="label">اللغة / التشفير</span>
                    <span class="value text-uppercase">${meta.lang} / ${meta.charset.split('-').pop()}</span>
                </div>
                <div class="stat-item">
                    <span class="label">الإعلانات</span>
                    <span class="value small text-primary">${meta.ads}</span>
                </div>
                <div class="stat-item">
                    <span class="label">الإحصائيات</span>
                    <span class="value small text-success">${meta.analytics}</span>
                </div>
                <div class="stat-item">
                    <span class="label">خريطة الموقع</span>
                    <span class="value small">${meta.sitemap}</span>
                </div>
            </div>
        `;

        container.prepend(card);
    }

    renderBasicPagesCard(pages) {
        const container = document.getElementById('results-dashboard');
        if (!container || !pages) return;

        // Remove existing if any
        const existing = document.getElementById('basic-pages-card');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.id = 'basic-pages-card';
        card.className = 'summary-card-pro mb-4 p-4';

        const renderItem = (found, text, icon) => `
            <div class="stat-item border bg-light flex-row justify-content-between px-3 w-100 mb-2">
                <div class="d-flex align-items-center gap-3">
                    <i class="fa-solid ${icon} text-primary"></i>
                    <span class="fw-bold text-dark">${text}</span>
                </div>
                <span class="badge ${found ? 'bg-success' : 'bg-danger'} rounded-pill px-3 py-1">
                    ${found ? 'موجودة ✅' : 'مفقودة ❌'}
                </span>
            </div>
        `;

        card.innerHTML = `
            <h5 class="fw-900 text-dark mb-4 px-2"><i class="fa-regular fa-file-lines text-primary"></i> الصفحات الأساسية للموقع</h5>
            <div class="d-grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
                ${renderItem(pages.privacy, 'سياسة الخصوصية', 'fa-shield-halved')}
                ${renderItem(pages.about, 'حول الموقع / من نحن', 'fa-circle-info')}
                ${renderItem(pages.terms, 'سياسة الاستخدام / الشروط', 'fa-gavel')}
                ${renderItem(pages.contact, 'تواصل معنا / اتصل بنا', 'fa-envelope')}
            </div>
        `;

        // Insert after summary card
        const summaryCard = document.getElementById('site-summary-card');
        if (summaryCard) summaryCard.parentNode.insertBefore(card, summaryCard.nextSibling);
        else container.prepend(card);
    }

    renderSocialPreviews(data) {
        const container = document.getElementById('seo-specialized');
        if (!container) return;

        // Remove existing preview if any
        const existing = document.getElementById('social-preview-section');
        if (existing) existing.remove();

        const section = document.createElement('div');
        section.id = 'social-preview-section';
        section.className = 'mt-5';
        section.innerHTML = `
            <h2 class="section-title"><i class="fa-solid fa-share-nodes"></i> محاكي المعاينة الاجتماعية</h2>
            <div class="row g-4">
                <div class="col-md-6">
                    <h6 class="fw-bold mb-3"><i class="fa-brands fa-facebook text-primary"></i> فيسبوك</h6>
                    <div class="social-card-fb">
                        <div class="fb-img-box" style="background-image: url('${data.image || ''}')">
                            ${!data.image ? '<i class="fa-regular fa-image text-muted"></i>' : ''}
                        </div>
                        <div class="fb-content">
                            <div class="fb-domain text-uppercase">${new URL(data.url || 'https://example.com').hostname}</div>
                            <div class="fb-title">${data.title}</div>
                            <div class="fb-desc">${data.description?.slice(0, 100)}...</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold mb-3"><i class="fa-brands fa-x-twitter text-info"></i> تويتر (X)</h6>
                    <div class="social-card-tw">
                        <div class="tw-img-box" style="background-image: url('${data.image || ''}')">
                            ${!data.image ? '<i class="fa-regular fa-image text-muted"></i>' : ''}
                        </div>
                        <div class="tw-content">
                            <div class="tw-title">${data.title}</div>
                            <div class="tw-desc">${data.description?.slice(0, 100)}...</div>
                            <div class="tw-domain"><i class="fa-solid fa-link"></i> ${new URL(data.url || 'https://example.com').hostname}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after Google Preview
        const googlePreview = document.querySelector('.serp-container');
        if (googlePreview) googlePreview.parentNode.insertBefore(section, googlePreview.nextSibling);
        else container.appendChild(section);
    }

    renderAuditCards(audits) {
        const container = document.getElementById('analysis-results');
        if (!container) return;
        container.innerHTML = '';

        const groups = {
            critical: audits.filter(a => a.status === 'fail'),
            warning: audits.filter(a => a.status === 'warn'),
            passed: audits.filter(a => a.status === 'pass')
        };

        if (groups.critical.length > 0) {
            container.innerHTML += `<h3 class="section-title text-danger" style="border-bottom-color: var(--brand-danger)"><i class="fa-solid fa-bug"></i> مشاكل يجب إصلاحها فوراً (${groups.critical.length})</h3>`;
            groups.critical.forEach(audit => container.appendChild(this.createAuditCard(audit)));
        }

        if (groups.warning.length > 0) {
            container.innerHTML += `<h3 class="section-title text-warning" style="border-bottom-color: var(--brand-warning)"><i class="fa-solid fa-circle-exclamation"></i> تحسينات مقترحة (${groups.warning.length})</h3>`;
            groups.warning.forEach(audit => container.appendChild(this.createAuditCard(audit)));
        }

        if (groups.passed.length > 0) {
            const passedWrapper = document.createElement('div');
            passedWrapper.className = 'mt-5';
            passedWrapper.innerHTML = `
                <div class="d-flex align-items-center justify-content-between section-title" style="cursor:pointer" onclick="this.nextElementSibling.classList.toggle('d-none')">
                    <span><i class="fa-solid fa-circle-check text-success"></i> اختبارات ناجحة (${groups.passed.length})</span>
                    <i class="fa-solid fa-chevron-down small"></i>
                </div>
                <div class="passed-list d-none"></div>
            `;
            const list = passedWrapper.querySelector('.passed-list');
            groups.passed.forEach(audit => list.appendChild(this.createAuditCard(audit)));
            container.appendChild(passedWrapper);
        }
    }

    createAuditCard(audit) {
        const pLabel = { critical: 'عاجل', moderate: 'متوسط', minor: 'تحسين' }[audit.priority || 'minor'];
        const icons = { critical: 'fa-triangle-exclamation', moderate: 'fa-circle-info', minor: 'fa-regular fa-lightbulb' };
        const pIcon = icons[audit.priority || 'minor'];

        // Score Attribution
        let scoreDeduction = '';
        if (audit.status !== 'pass') {
            const weight = audit.weight || 5;
            const deduction = audit.status === 'fail' ? weight : Math.round(weight / 2);
            scoreDeduction = `<span class="ms-2 text-danger small fw-bold">(-${deduction} نقطة)</span>`;
        }

        const card = document.createElement('div');
        card.className = `result-card ${audit.status} ${audit.priority || 'minor'}`;
        card.onclick = function() { this.classList.toggle('expanded'); };

        const showPriority = audit.status !== 'pass';

        card.innerHTML = `
            <div class="d-flex align-items-center w-100">
                <div class="tag-title">
                    ${audit.title}
                    ${showPriority ? `<span class="priority-badge p-${audit.priority || 'minor'}"><i class="fa-solid ${pIcon}"></i> ${pLabel}</span>` : ''}
                    ${scoreDeduction}
                </div>
                <div class="ms-auto d-flex align-items-center gap-3">
                    <span class="status-badge status-${audit.status}">${audit.status.toUpperCase()}</span>
                    <i class="fa-solid fa-chevron-down expand-icon"></i>
                </div>
            </div>
            <div class="result-details">
                <div class="tag-value">${audit.value}</div>
                ${this.renderExtraDetails(audit)}
                <div class="fix-tip mt-3">
                    <p class="mb-0" style="font-size:13px; line-height:1.6;">
                        ${audit.msg || 'حسن هذا البند للحصول على نتائج أفضل في محركات البحث.'}
                    </p>
                </div>
                <div class="d-flex gap-2 flex-wrap mt-3">
                    ${audit.title === 'سياسة الخصوصية' && audit.status === 'fail' ? `<a href="../privacy-generator/index.html" class="fix-btn" style="text-decoration:none;"><i class="fa-solid fa-wand-magic-sparkles"></i> توليد سياسة خصوصية الآن</a>` : ''}
                    ${(window.fixData && window.fixData[audit.title]) ? `<button class="fix-btn" onclick="event.stopPropagation(); window.showFix('${audit.title}')"><i class="fa-solid fa-wrench"></i> دليل الإصلاح</button>` : ''}
                </div>
            </div>`;
        return card;
    }

    renderExtraDetails(audit) {
        if (audit.title === 'كثافة المحتوى (Word Count)' && audit.meta) {
            const percent = Math.min(100, (audit.meta.current / audit.meta.target) * 100);
            return `
                <div class="mt-3">
                    <div class="d-flex justify-content-between mb-1 small fw-bold">
                        <span>التقدم نحو الهدف</span>
                        <span>${audit.meta.current} / ${audit.meta.target} كلمة</span>
                    </div>
                    <div class="progress" style="height: 8px; border-radius: 10px; background: #e2e8f0;">
                        <div class="progress-bar" role="progressbar" style="width: ${percent}%; background: ${percent < 50 ? 'var(--brand-danger)' : (percent < 80 ? 'var(--brand-warning)' : 'var(--brand-secondary)')}; border-radius: 10px;"></div>
                    </div>
                </div>
            `;
        }
        return '';
    }

    renderCategoryScores(categories) {
        const catContainer = document.getElementById('category-scores');
        if (!catContainer) return;
        catContainer.innerHTML = '';

        const labels = { SEO: 'SEO', Technical: 'تقني', Monetization: 'أرباح', Policy: 'سياسة', Security: 'أمان', Social: 'اجتماعي', UX: 'UX' };

        Object.keys(categories).forEach(name => {
            if (categories[name].w === 0) return;
            const score = Math.round((categories[name].s / categories[name].w) * 100);
            let color = score < 50 ? 'var(--brand-danger)' : (score < 80 ? 'var(--brand-warning)' : 'var(--brand-secondary)');
            catContainer.innerHTML += `
                <div class="cat-score-card" data-aos="zoom-in">
                    <div class="cat-score-circle">
                        <span style="color:${color}">${score}</span>
                        <svg width="65" height="65">
                            <circle cx="32.5" cy="32.5" r="28" fill="transparent" stroke="#eee" stroke-width="4"></circle>
                            <circle cx="32.5" cy="32.5" r="28" fill="transparent" stroke="${color}" stroke-width="4" stroke-dasharray="176" stroke-dashoffset="${176 - (176*score/100)}"></circle>
                        </svg>
                    </div>
                    <div class="cat-label">${labels[name] || name}</div>
                </div>`;
        });
    }

    updateFinalScore(final) {
        const scoreEl = document.getElementById('total-score');
        const circleBar = document.getElementById('score-circle-bar');
        if (scoreEl) {
            scoreEl.innerText = final;
            scoreEl.style.color = final > 80 ? 'var(--brand-secondary)' : (final > 50 ? 'var(--brand-warning)' : 'var(--brand-danger)');
        }
        if (circleBar) {
            circleBar.style.strokeDashoffset = 390 - (390 * final / 100);
        }
    }
}

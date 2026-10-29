function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
        const canvas = document.getElementById('resourceChart');
        const ctx = canvas?.getContext('2d');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.resourceChart) this.resourceChart.destroy();

        const total = (data.scripts || 0) + (data.styles || 0) + (data.images || 0);
        const chartData = total > 0 ? [data.scripts, data.styles, data.images] : [1, 1, 1];

        this.resourceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['سكربتات (JS)', 'تنسيقات (CSS)', 'صور (Images)'],
                datasets: [{
                    data: chartData,
                    backgroundColor: ['#006b98', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Cairo', size: 14 } } },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${total > 0 ? context.raw : 0}`
                        }
                    }
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

        const existing = document.getElementById('site-summary-card');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.id = 'site-summary-card';
        card.className = 'summary-card-pro mb-4';

        const safeTitle = escapeHtml(meta.title);
        const safeCms = escapeHtml(meta.cms || 'مخصص');
        const safeUrl = escapeHtml(meta.url);
        const safeServer = escapeHtml(meta.server || 'N/A');

        card.innerHTML = `
            <div class="summary-header flex-wrap">
                <div class="site-icon-box border">
                    ${meta.favicon ? `<img src="${escapeHtml(meta.favicon)}" width="32" height="32" alt="favicon">` : '<i class="fa-solid fa-globe text-primary"></i>'}
                </div>
                <div class="flex-grow-1">
                    <h2 class="h4 mb-1 fw-900 text-dark d-flex align-items-center flex-wrap gap-2">
                        <span>${safeTitle}</span>
                        <span class="badge badge-primary-soft px-3 py-2" style="font-size: 11px; border-radius: 8px;">
                            <i class="fa-solid fa-layer-group"></i> ${safeCms}
                        </span>
                    </h2>
                    <span class="text-muted small ltr-text">${safeUrl}</span>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    ${isHeavy ? '<span class="badge bg-danger rounded-pill px-3 py-2" style="font-size:11px"><i class="fa-solid fa-triangle-exclamation"></i> صفحة ثقيلة الموارد</span>' : ''}
                    <span class="badge-link ${meta.isRoot ? 'badge-internal' : 'badge-external'} px-3 py-2">
                        <i class="fa-solid ${meta.isRoot ? 'fa-house' : 'fa-sitemap'}"></i> ${escapeHtml(meta.typeLabel)}
                    </span>
                </div>
            </div>
            <div class="summary-body grid-stats">
                <div class="stat-item">
                    <span class="label">الخادم</span>
                    <span class="value"><i class="fa-solid fa-server text-primary"></i> ${safeServer}</span>
                </div>
                <div class="stat-item">
                    <span class="label">حجم الكود</span>
                    <span class="value"><i class="fa-regular fa-hdd text-primary"></i> ${escapeHtml(meta.pageSize)} KB</span>
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
                        <div class="res-mini-item" title="ملفات التنسيق CSS"><i class="fa-brands fa-css3-alt text-primary"></i>${meta.resources.styles}</div>
                        <div class="res-mini-item" title="ملفات السكربت JS"><i class="fa-solid fa-code text-warning"></i>${meta.resources.scripts}</div>
                        <div class="res-mini-item" title="الصور"><i class="fa-regular fa-image text-success"></i>${meta.resources.images}</div>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="label">الروابط (داخلي / خارجي)</span>
                    <div class="d-flex flex-column gap-1">
                        <span class="value text-dark" style="font-size: 12px;">
                            <i class="fa-solid fa-link text-primary"></i> <span class="text-primary">${meta.links.internal}</span> / <span class="text-success">${meta.links.external}</span>
                        </span>
                        <span class="small fw-bold text-muted">
                            <i class="fa-solid fa-share-nodes text-info"></i> اجتماعي: <span class="text-info">${meta.links.social || 0}</span>
                        </span>
                    </div>
                </div>
                <div class="stat-item">
                    <span class="label">اللغة / الترميز</span>
                    <span class="value text-uppercase">${escapeHtml(meta.lang)} / ${escapeHtml((meta.charset || 'UTF-8').split('-').pop())}</span>
                </div>
                <div class="stat-item">
                    <span class="label">الإعلانات</span>
                    <span class="value small text-primary">${escapeHtml(meta.ads || 'N/A')}</span>
                </div>
                <div class="stat-item">
                    <span class="label">التحليلات</span>
                    <span class="value small text-success">${escapeHtml(meta.analytics || 'N/A')}</span>
                </div>
                <div class="stat-item">
                    <span class="label">خريطة الموقع</span>
                    <span class="value small">${meta.sitemap || 'N/A'}</span>
                </div>
            </div>
        `;

        container.prepend(card);
    }

    renderBasicPagesCard(pages) {
        const container = document.getElementById('results-dashboard');
        const existing = document.getElementById('basic-pages-card');
        if (existing) existing.remove();
        if (!container || !pages) return;

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
            <h3 class="h5 fw-900 text-dark mb-4 px-2"><i class="fa-regular fa-file-lines text-primary"></i> الصفحات الأساسية للموثوقية</h3>
            <div class="d-grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
                ${renderItem(pages.privacy, 'سياسة الخصوصية', 'fa-shield-halved')}
                ${renderItem(pages.about, 'حول الموقع / من نحن', 'fa-circle-info')}
                ${renderItem(pages.terms, 'شروط الاستخدام', 'fa-gavel')}
                ${renderItem(pages.contact, 'تواصل معنا / اتصل بنا', 'fa-envelope')}
            </div>
        `;

        const summaryCard = document.getElementById('site-summary-card');
        if (summaryCard) summaryCard.parentNode.insertBefore(card, summaryCard.nextSibling);
        else container.prepend(card);
    }

    renderSocialPreviews(data) {
        const container = document.getElementById('seo-specialized');
        const existing = document.getElementById('social-preview-section');
        if (existing) existing.remove();
        if (!container || !data) return;

        let domain = 'example.com';
        try {
            if (data.url && data.url !== 'Manual Code' && data.url !== 'محلي') {
                domain = new URL(data.url).hostname;
            }
        } catch {
            domain = 'example.com';
        }

        const safeTitle = escapeHtml(data.title || 'بدون عنوان');
        const safeDesc = escapeHtml((data.description || 'لا يوجد وصف ميتا للمعاينة...').slice(0, 110));
        const safeImg = data.image ? escapeHtml(data.image) : '';

        const section = document.createElement('div');
        section.id = 'social-preview-section';
        section.className = 'mt-5';
        section.innerHTML = `
            <h2 class="section-title"><i class="fa-solid fa-share-nodes"></i> محاكي المعاينة الاجتماعية</h2>
            <div class="row g-4">
                <div class="col-md-6">
                    <h3 class="h6 fw-bold mb-3"><i class="fa-brands fa-facebook text-primary"></i> فيسبوك</h3>
                    <div class="social-card-fb">
                        <div class="fb-img-box" style="${safeImg ? `background-image: url('${safeImg}')` : ''}">
                            ${!safeImg ? '<i class="fa-regular fa-image text-muted fa-2x"></i>' : ''}
                        </div>
                        <div class="fb-content">
                            <div class="fb-domain text-uppercase">${escapeHtml(domain)}</div>
                            <div class="fb-title">${safeTitle}</div>
                            <div class="fb-desc">${safeDesc}...</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h3 class="h6 fw-bold mb-3"><i class="fa-brands fa-x-twitter text-dark"></i> منصة X (تويتر)</h3>
                    <div class="social-card-tw">
                        <div class="tw-img-box" style="${safeImg ? `background-image: url('${safeImg}')` : ''}">
                            ${!safeImg ? '<i class="fa-regular fa-image text-muted fa-2x"></i>' : ''}
                        </div>
                        <div class="tw-content">
                            <div class="tw-title">${safeTitle}</div>
                            <div class="tw-desc">${safeDesc}...</div>
                            <div class="tw-domain"><i class="fa-solid fa-link"></i> ${escapeHtml(domain)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const googlePreview = document.querySelector('.serp-container');
        if (googlePreview && googlePreview.parentNode) {
            const charBadges = googlePreview.nextElementSibling;
            if (charBadges) charBadges.parentNode.insertBefore(section, charBadges.nextSibling);
            else googlePreview.parentNode.insertBefore(section, googlePreview.nextSibling);
        } else {
            container.appendChild(section);
        }
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
            const header = document.createElement('h3');
            header.className = 'section-title text-danger';
            header.style.borderBottomColor = 'var(--brand-danger)';
            header.innerHTML = `<i class="fa-solid fa-bug"></i> مشاكل حرجة يجب إصلاحها فوراً (${groups.critical.length})`;
            container.appendChild(header);
            groups.critical.forEach(audit => container.appendChild(this.createAuditCard(audit)));
        }

        if (groups.warning.length > 0) {
            const header = document.createElement('h3');
            header.className = 'section-title text-warning';
            header.style.borderBottomColor = 'var(--brand-warning)';
            header.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> تحسينات مقترحة (${groups.warning.length})`;
            container.appendChild(header);
            groups.warning.forEach(audit => container.appendChild(this.createAuditCard(audit)));
        }

        if (groups.passed.length > 0) {
            const passedWrapper = document.createElement('div');
            passedWrapper.className = 'mt-5';
            passedWrapper.innerHTML = `
                <div class="d-flex align-items-center justify-content-between section-title" style="cursor:pointer" onclick="this.nextElementSibling.classList.toggle('d-none')">
                    <span><i class="fa-solid fa-circle-check text-success"></i> الفحوصات الناجحة (${groups.passed.length})</span>
                    <span class="small text-muted fw-bold">عرض / إخفاء <i class="fa-solid fa-chevron-down small ms-1"></i></span>
                </div>
                <div class="passed-list"></div>
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
        const statusLabels = { pass: 'ناجح', warn: 'تنبيه', fail: 'خطأ' };

        let scoreDeduction = '';
        if (audit.status !== 'pass') {
            const weight = audit.weight || 5;
            const deduction = audit.status === 'fail' ? weight : Math.round(weight / 2);
            scoreDeduction = `<span class="ms-2 text-danger small fw-bold" title="وزن التأثير في التقييم">(-${deduction} وزن)</span>`;
        }

        const card = document.createElement('div');
        card.className = `result-card ${audit.status} ${audit.priority || 'minor'}${audit.status === 'fail' ? ' expanded' : ''}`;
        card.onclick = function() { this.classList.toggle('expanded'); };

        const showPriority = audit.status !== 'pass';
        const fixKey = audit.fixKey || audit.title;
        const hasFixGuide = Boolean(window.fixData && window.fixData[fixKey]);
        const isTechBadges = audit.title === 'تقنيات الموقع (Tech Stack)';
        const displayValue = isTechBadges ? audit.value : escapeHtml(audit.value);

        card.innerHTML = `
            <div class="d-flex align-items-center w-100 flex-wrap gap-2">
                <div class="tag-title flex-wrap">
                    <span>${escapeHtml(audit.title)}</span>
                    ${showPriority ? `<span class="priority-badge p-${audit.priority || 'minor'}"><i class="fa-solid ${pIcon}"></i> ${pLabel}</span>` : ''}
                    ${scoreDeduction}
                </div>
                <div class="ms-auto d-flex align-items-center gap-3">
                    <span class="status-badge status-${audit.status}">${statusLabels[audit.status] || audit.status.toUpperCase()}</span>
                    <i class="fa-solid fa-chevron-down expand-icon"></i>
                </div>
            </div>
            <div class="result-details">
                <div class="tag-value">${displayValue}</div>
                ${this.renderExtraDetails(audit)}
                <div class="fix-tip mt-3">
                    <p class="mb-0" style="font-size:13px; line-height:1.6;">
                        ${escapeHtml(audit.msg || 'حسن هذا البند للحصول على نتائج أفضل في محركات البحث.')}
                    </p>
                </div>
                <div class="d-flex gap-2 flex-wrap mt-3">
                    ${audit.title === 'سياسة الخصوصية' && audit.status === 'fail' ? `<a href="https://connecttag.org/tools/security/privacy-generator/" class="fix-btn" style="text-decoration:none;" onclick="event.stopPropagation();"><i class="fa-solid fa-wand-magic-sparkles"></i> توليد سياسة خصوصية الآن</a>` : ''}
                    ${hasFixGuide ? `<button type="button" class="fix-btn" data-fix-key="${escapeHtml(fixKey)}" onclick="event.stopPropagation(); window.showFix(this.getAttribute('data-fix-key'))"><i class="fa-solid fa-wrench"></i> دليل الإصلاح</button>` : ''}
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
                        <span>التقدم نحو الهدف القياسي</span>
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

        const labels = {
            SEO: 'تحسين البحث SEO',
            Technical: 'البنية التقنية',
            Policy: 'السياسات',
            Security: 'الأمان والحماية',
            Social: 'الشبكات الاجتماعية',
            UX: 'تجربة المستخدم والأداء'
        };

        Object.keys(categories).forEach(name => {
            if (categories[name].w === 0) return;
            const score = Math.round((categories[name].s / categories[name].w) * 100);
            const color = score < 50 ? 'var(--brand-danger)' : (score < 80 ? 'var(--brand-warning)' : 'var(--brand-secondary)');
            catContainer.innerHTML += `
                <div class="cat-score-card" data-aos="zoom-in">
                    <div class="cat-score-circle">
                        <span style="color:${color}">${score}</span>
                        <svg width="65" height="65">
                            <circle cx="32.5" cy="32.5" r="28" fill="transparent" stroke="#eee" stroke-width="4"></circle>
                            <circle cx="32.5" cy="32.5" r="28" fill="transparent" stroke="${color}" stroke-width="4" stroke-dasharray="176" stroke-dashoffset="${176 - (176 * score / 100)}"></circle>
                        </svg>
                    </div>
                    <div class="cat-label">${labels[name] || name}</div>
                </div>`;
        });
    }

    updateFinalScore(final) {
        const scoreEl = document.getElementById('total-score');
        const circleBar = document.getElementById('score-circle-bar');
        const msgEl = document.getElementById('score-msg');
        const color = final >= 80 ? 'var(--brand-secondary)' : (final >= 50 ? 'var(--brand-warning)' : 'var(--brand-danger)');

        if (scoreEl) {
            scoreEl.innerText = final;
            scoreEl.style.color = color;
        }
        if (circleBar) {
            circleBar.style.stroke = color;
            circleBar.style.strokeDashoffset = 390 - (390 * final / 100);
        }
        if (msgEl) {
            msgEl.style.color = color;
            if (final >= 85) {
                msgEl.innerText = 'ممتاز! الموقع يطبق المعايير القياسية 🌟';
            } else if (final >= 65) {
                msgEl.innerText = 'أداء جيد، مع وجود فرص للتحسين 👍';
            } else {
                msgEl.innerText = 'يحتاج لمعالجة المشاكل الحرجة ⚠️';
            }
        }
    }
}

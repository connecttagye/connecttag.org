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
        if (siteMeta) this.renderSummaryCard(siteMeta);
        this.renderAuditCards(audits);
        this.renderCategoryScores(categories);
        this.updateFinalScore(finalScore);
    }

    renderSummaryCard(meta) {
        const container = document.getElementById('results-dashboard');
        if (!container) return;

        // Remove existing summary card if any
        const existing = document.getElementById('site-summary-card');
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.id = 'site-summary-card';
        card.className = 'summary-card-pro mb-4';

        card.innerHTML = `
            <div class="summary-header">
                <div class="d-flex align-items-center gap-3">
                    <div class="site-icon-box">
                        <i class="fa fa-globe"></i>
                    </div>
                    <div class="text-start">
                        <h4 class="mb-1 fw-900 text-white">${meta.title}</h4>
                        <span class="text-white-50 small ltr-text">${meta.url}</span>
                    </div>
                </div>
                <div class="ms-auto">
                    <span class="badge-link ${meta.isRoot ? 'badge-primary-soft' : 'badge-warning-soft'}">
                        <i class="fa ${meta.isRoot ? 'fa-home' : 'fa-sitemap'}"></i> ${meta.typeLabel}
                    </span>
                </div>
            </div>
            <div class="summary-body grid-stats">
                <div class="stat-item">
                    <span class="label">البروتوكول</span>
                    <span class="value ${meta.protocol === 'HTTPS' ? 'text-success' : 'text-danger'}">
                        <i class="fa ${meta.protocol === 'HTTPS' ? 'fa-lock' : 'fa-unlock'}"></i> ${meta.protocol}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="label">النطاق (TLD)</span>
                    <span class="value text-primary">${meta.tld}</span>
                </div>
                <div class="stat-item">
                    <span class="label">تشفير الصفحة</span>
                    <span class="value">${meta.charset}</span>
                </div>
                <div class="stat-item">
                    <span class="label">اللغة</span>
                    <span class="value text-uppercase">${meta.lang}</span>
                </div>
            </div>
        `;

        container.prepend(card);
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
            container.innerHTML += `<h3 class="section-title text-danger" style="border-bottom-color: var(--brand-danger)"><i class="fa fa-bug"></i> مشاكل يجب إصلاحها فوراً (${groups.critical.length})</h3>`;
            groups.critical.forEach(audit => container.appendChild(this.createAuditCard(audit)));
        }

        if (groups.warning.length > 0) {
            container.innerHTML += `<h3 class="section-title text-warning" style="border-bottom-color: var(--brand-warning)"><i class="fa fa-exclamation-circle"></i> تحسينات مقترحة (${groups.warning.length})</h3>`;
            groups.warning.forEach(audit => container.appendChild(this.createAuditCard(audit)));
        }

        if (groups.passed.length > 0) {
            const passedWrapper = document.createElement('div');
            passedWrapper.className = 'mt-5';
            passedWrapper.innerHTML = `
                <div class="d-flex align-items-center justify-content-between section-title" style="cursor:pointer" onclick="this.nextElementSibling.classList.toggle('d-none')">
                    <span><i class="fa fa-check-circle text-success"></i> اختبارات ناجحة (${groups.passed.length})</span>
                    <i class="fa fa-chevron-down small"></i>
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
        const icons = { critical: 'fa-exclamation-triangle', moderate: 'fa-info-circle', minor: 'fa-lightbulb-o' };
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
                    ${showPriority ? `<span class="priority-badge p-${audit.priority || 'minor'}"><i class="fa ${pIcon}"></i> ${pLabel}</span>` : ''}
                    ${scoreDeduction}
                </div>
                <div class="ms-auto d-flex align-items-center gap-3">
                    <span class="status-badge status-${audit.status}">${audit.status.toUpperCase()}</span>
                    <i class="fa fa-chevron-down expand-icon"></i>
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
                    ${audit.title === 'سياسة الخصوصية' && audit.status === 'fail' ? `<a href="../privacy-generator/index.html" class="fix-btn" style="text-decoration:none;"><i class="fa fa-magic"></i> توليد سياسة خصوصية الآن</a>` : ''}
                    ${(window.fixData && window.fixData[audit.title]) ? `<button class="fix-btn" onclick="event.stopPropagation(); window.showFix('${audit.title}')"><i class="fa fa-wrench"></i> دليل الإصلاح</button>` : ''}
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

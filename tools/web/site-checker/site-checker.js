import AnalyzerCore from './core/AnalyzerCore.js';
import UIEngine from './core/UIEngine.js';
import HistoryManager from './core/HistoryManager.js';

class SiteCheckerApp {
    constructor() {
        this.core = new AnalyzerCore();
        this.ui = new UIEngine();
        this.history = new HistoryManager();
        this.currentTool = 'all';
        this.mode = 'url';

        this.fixData = {
            'دلالات الـ HTML (Semantic)': {
                desc: 'استخدم وسوم HTML5 الدلالية بدلاً من Divs لتعريف هيكل الصفحة.',
                code: '<header>...</header>\n<nav>...</nav>\n<main>\n  <section>...</section>\n</main>\n<footer>...</footer>'
            },
            'صحة الروابط': {
                desc: 'تجنب استخدام href="#"؛ استخدم روابط حقيقية أو وسوم <button>.',
                code: '<!-- صح -->\n<button type="button">زر إجراء</button>'
            },
            'أمان الموقع (HTTPS)': {
                desc: 'يجب تفعيل شهادة SSL للأمان والثقة.',
                code: '# تحويل لـ HTTPS\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]'
            },
            'الوسم الرئيسي (H1)': {
                desc: 'تأكد من وجود وسم H1 واحد فقط يصف المحتوى الرئيسي للصفحة.',
                code: '<h1>عنوان الصفحة الرئيسي</h1>'
            },
            'النصوص البديلة للصور': {
                desc: 'أضف سمة alt لكل وسم img لوصف محتوى الصورة لمحركات البحث وقارئات الشاشة.',
                code: '<img src="image.jpg" alt="وصف دقيق للصورة">'
            },
            'البيانات المنظمة (Schema)': {
                desc: 'استخدم JSON-LD لتعريف نوع المحتوى لجوجل (مثل Article أو Product).',
                code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "عنوان الصفحة"\n}\n</script>'
            },
            'تسلسل العناوين (Heading Hierarchy)': {
                desc: 'يجب أن تتبع العناوين ترتيباً تنازلياً منطقياً (H1 ثم H2 ثم H3) دون تخطي مستويات.',
                code: '<h1>العنوان الرئيسي</h1>\n<h2>عنوان فرعي</h2>\n<h3>عنوان أصغر</h3>'
            },
            'فجوة الكلمات المفتاحية (Keyword Gap)': {
                desc: 'تأكد من أن الكلمات الهامة الموجودة في العنوان والوصف تتكرر بشكل طبيعي داخل محتوى الصفحة.',
                code: '<!-- تأكد من ذكر الكلمات الرئيسية في أول 200 كلمة من المحتوى -->'
            }
        };
        window.fixData = this.fixData; // For compatibility with UIEngine

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.detectCurrentTool();
        this.loadInitialState();

        // Global exports for HTML onclick
        window.selectTool = (tool) => this.selectTool(tool);
        window.switchMode = (mode) => this.switchMode(mode);
        window.startAnalysis = () => this.startAnalysis();
        window.loadDemoData = () => this.loadDemoData();
        window.showFix = (title) => this.showFix(title);
        window.closeModal = () => this.closeModal();
        window.copySnippet = () => this.copySnippet();
        window.copySummary = () => this.copySummary();
        window.applyHistory = (index) => this.applyHistory(index);

        AOS.init({ once: true });
    }

    setupEventListeners() {
        window.addEventListener('load', () => {
            this.history.getAll(); // Pre-warm or check
            this.renderHistory();
        });
    }

    detectCurrentTool() {
        const path = window.location.pathname;
        if (path.includes('seo-checker')) this.currentTool = 'seo';
        else if (path.includes('security-checker')) this.currentTool = 'trust';

        this.updateToolUI();
    }

    loadInitialState() {
        const lastUrl = localStorage.getItem('last_seo_url');
        if (lastUrl) {
            const input = document.getElementById('siteUrl');
            if (input) input.value = lastUrl;
        }
    }

    updateToolUI() {
        document.querySelectorAll('.tool-tile').forEach(t => t.classList.remove('active'));
        const activeTile = document.getElementById('tool-' + this.currentTool);
        if (activeTile) activeTile.classList.add('active');
    }

    selectTool(tool) {
        const pages = { 'all': 'index.html', 'seo': 'seo-checker.html', 'trust': 'security-checker.html' };
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentInput = document.getElementById('siteUrl')?.value;

        if (currentInput) localStorage.setItem('last_seo_url', currentInput);

        if (pages[tool] && pages[tool] !== currentPage) {
            if (!(window.location.pathname.endsWith('/') && pages[tool] === 'index.html')) {
                window.location.href = pages[tool];
                return;
            }
        }

        this.currentTool = tool;
        this.updateToolUI();

        if (document.getElementById('results-dashboard').classList.contains('visible')) {
            this.startAnalysis();
        }
    }

    switchMode(m) {
        this.mode = m;
        document.querySelectorAll('.tab-item').forEach((t, i) => t.classList.toggle('active', (m === 'url' && i === 0) || (m === 'code' && i === 1)));
        document.getElementById('url-mode').style.display = m === 'url' ? 'block' : 'none';
        document.getElementById('code-mode').style.display = m === 'code' ? 'block' : 'none';
    }

    loadDemoData() {
        this.switchMode('code');
        document.getElementById('htmlCode').value = `<!DOCTYPE html>\n<html lang="ar">\n<head>\n    <meta charset="UTF-8">\n    <title>كونكت تاق - دليل البرمجة الشامل</title>\n    <meta name="description" content="أفضل مصادر تعلم البرمجة وتطوير المواقع.">\n</head>\n<body>\n    <header><h1>مرحباً بكم في كونكت تاق</h1></header>\n    <main>\n        <p>استكشف عالم البرمجة معنا.</p>\n        <a href="#">رابط وهمي للتجربة</a>\n    </main>\n    <footer>حقوق النشر محفوظة</footer>\n</body>\n</html>`;
        this.startAnalysis();
    }

    async startAnalysis() {
        const urlInput = document.getElementById('siteUrl').value.trim();
        const htmlInput = document.getElementById('htmlCode').value;

        if (this.mode === 'url') {
            if (!urlInput) {
                window.showToast?.('يرجى إدخال رابط الموقع أولاً', 'warn');
                return;
            }
            if (!urlInput.startsWith('http')) document.getElementById('siteUrl').value = 'https://' + urlInput;
            localStorage.setItem('last_seo_url', document.getElementById('siteUrl').value);
        }

        this.ui.showLoader();

        try {
            await this.core.loadAuditors(this.currentTool);

            let htmlContent = '';
            let filesStatus = {};
            let securityHeaders = {};
            let finalUrl = urlInput;
            let pageSize = 0;
            let server = 'N/A';
            let performance = {};
            let redirects = {};

            if (this.mode === 'url') {
                const data = await this.core.fetchPageData(document.getElementById('siteUrl').value);
                htmlContent = data.html;
                securityHeaders = data.securityHeaders;
                pageSize = data.pageSize;
                server = data.server;
                performance = data.performance;
                redirects = data.redirects;

                const baseUrl = new URL(document.getElementById('siteUrl').value).origin;
                filesStatus = await this.core.checkExtraFiles(baseUrl);
                finalUrl = document.getElementById('siteUrl').value;
            } else {
                htmlContent = htmlInput;
                finalUrl = 'Manual Code';
                pageSize = (new TextEncoder().encode(htmlContent).length / 1024).toFixed(1);
            }

            this.processResults(htmlContent, finalUrl, filesStatus, securityHeaders, pageSize, server, performance, redirects);
        } catch (err) {
            console.error(err);
            window.showToast?.('فشل الاتصال بالموقع أو تحليل البيانات', 'error');
            this.ui.hideLoader();
        }
    }

    processResults(html, url, files, security, pageSize, server, performance, redirects) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html || '<html></html>', 'text/html');

        const audits = this.core.runAudits(doc, html, url, files, security, this.currentTool, performance, redirects);

        // Specialized specialized UI updates
        document.getElementById('seo-specialized').style.display = (this.currentTool === 'all' || this.currentTool === 'seo') ? 'block' : 'none';

        if (this.core.auditors.seo) {
            this.core.auditors.seo.updateSocialPreview(doc, url);
            this.core.auditors.seo.analyzeKeywords(doc);
            this.core.auditors.seo.exploreLinks(doc, url);
        }
        if (this.core.auditors.content) {
            this.core.auditors.content.updateContentDashboard(doc);
        }
        this.updateResourceStats(doc);

        const { categories, finalScore } = this.calculateScores(audits);

        // Prepare Site Meta for Summary Card
        let siteMeta = null;

        const scripts = doc.querySelectorAll('script[src]').length;
        const styles = doc.querySelectorAll('link[rel="stylesheet"]').length;
        const images = doc.querySelectorAll('img').length;

        if (url !== 'Manual Code') {
            const urlObj = new URL(url);
            const canonical = doc.querySelector('link[rel="canonical"]')?.href;
            const robots = doc.querySelector('meta[name="robots"]')?.content.toLowerCase() || '';
            const isIndexable = !robots.includes('noindex');

            // Social Tags
            const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || doc.querySelector('title')?.innerText;
            const ogDesc = doc.querySelector('meta[property="og:description"]')?.content || doc.querySelector('meta[name="description"]')?.content;
            const ogImage = doc.querySelector('meta[property="og:image"]')?.content;

            // CMS Detection
            let cms = 'مخصص / أخرى';
            if (html.includes('wp-content')) cms = 'WordPress';
            else if (html.includes('blogger.com') || html.includes('pub-')) cms = 'Blogger';
            else if (html.includes('wix.com')) cms = 'Wix';
            else if (html.includes('shopify.com')) cms = 'Shopify';

            // Ads and Analytics Detection
            const pubMatch = html.match(/pub-\d+/);
            const gaMatch = html.match(/G-[A-Z0-9]+|UA-\d+-\d+/);
            const hasSitemap = html.includes('sitemap.xml') || !!doc.querySelector('link[type="application/xml"][title="Sitemap"]');

            // Basic Pages Detection
            const links = Array.from(doc.querySelectorAll('a'));
            const checkLink = (keywords) => links.some(a =>
                keywords.some(k => a.innerText.toLowerCase().includes(k) || (a.href && a.href.toLowerCase().includes(k)))
            );

            // Social Presence Detection
            const socialPlatforms = {
                facebook: ['facebook.com', 'fb.com', 'fb.me'],
                twitter: ['twitter.com', 'x.com'],
                instagram: ['instagram.com', 'instagr.am'],
                linkedin: ['linkedin.com'],
                youtube: ['youtube.com', 'youtu.be'],
                tiktok: ['tiktok.com']
            };
            const socialLinksCount = links.filter(a =>
                Object.values(socialPlatforms).flat().some(domain => a.href?.toLowerCase().includes(domain))
            ).length;

            siteMeta = {
                title: doc.querySelector('title')?.innerText || 'بدون عنوان',
                url: url,
                favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
                cms: cms,
                ads: pubMatch ? `مفعلة (${pubMatch[0]})` : 'غير نشطة ❌',
                analytics: gaMatch ? `موجودة (${gaMatch[0].slice(0, 10)}...)` : 'غير موجودة ❌',
                sitemap: files.sitemap ? 'مكتشفة ✅' : 'غير محددة ❌',
                isRoot: urlObj.pathname === '/' || urlObj.pathname === '',
                typeLabel: (urlObj.pathname === '/' || urlObj.pathname === '') ? 'رابط رئيسي' : 'صفحة فرعية',
                protocol: urlObj.protocol.replace(':', '').toUpperCase(),
                tld: '.' + urlObj.hostname.split('.').pop(),
                charset: doc.characterSet || 'UTF-8',
                lang: doc.documentElement.lang || 'ar',
                pageSize: pageSize || '0',
                server: server || 'N/A',
                robots: files.robots ? 'موجود ✅' : 'مفقود ❌',
                canonical: canonical ? (new URL(canonical, url).href === url ? 'مطابق ✅' : 'مختلف ⚠️') : 'غير محدد ❌',
                isIndexable: isIndexable ? 'مسموح ✅' : 'ممنوع ❌',
                links: {
                    internal: links.filter(a => a.href && !a.href.startsWith('http')).length,
                    external: links.filter(a => a.href && a.href.startsWith('http')).length,
                    social: socialLinksCount
                },
                resources: { scripts, styles, images },
                social: { title: ogTitle, description: ogDesc, image: ogImage, url: url },
                basicPages: {
                    privacy: checkLink(['خصوصية', 'privacy', 'legal']),
                    about: checkLink(['حول', 'about', 'من نحن', 'قصتنا']),
                    terms: checkLink(['استخدام', 'terms', 'شروط']),
                    contact: checkLink(['تواصل', 'contact', 'اتصل', 'راسلنا'])
                }
            };
        } else {
            siteMeta = {
                title: 'تحليل كود يدوي',
                url: 'محلي',
                favicon: null,
                isRoot: false,
                typeLabel: 'كود برمجى',
                protocol: 'N/A',
                tld: 'N/A',
                charset: 'UTF-8',
                lang: 'ar',
                pageSize: pageSize || '0',
                server: 'N/A',
                canonical: 'N/A',
                isIndexable: 'N/A',
                links: { internal: 0, external: 0 },
                resources: { scripts, styles, images },
                social: null
            };
        }

        this.checkSmartRecommendations(audits, siteMeta?.isRoot);
        this.history.save(doc.querySelector('title')?.innerText || 'تحليل جديد', url);
        this.renderHistory();

        this.ui.renderResults(audits, categories, finalScore, siteMeta);
        this.ui.hideLoader();
    }

    updateResourceStats(doc) {
        const scripts = doc.querySelectorAll('script[src]').length;
        const styles = doc.querySelectorAll('link[rel="stylesheet"]').length;
        const images = doc.querySelectorAll('img').length;

        this.ui.updateResourceChart({ scripts, styles, images });

        const statRes = document.getElementById('stat-res');
        if (statRes) statRes.innerText = scripts + styles + images;
    }

    calculateScores(audits) {
        const categories = { SEO: { s: 0, w: 0 }, Technical: { s: 0, w: 0 }, Policy: { s: 0, w: 0 }, Security: { s: 0, w: 0 }, Social: { s: 0, w: 0 }, UX: { s: 0, w: 0 } };

        audits.forEach(audit => {
            let score = audit.status === 'pass' ? 100 : (audit.status === 'warn' ? 50 : 0);
            const weight = audit.weight || 5;
            if (categories[audit.category]) {
                categories[audit.category].s += (score * weight);
                categories[audit.category].w += (weight * 100);
            }
        });

        let totalScore = 0, count = 0;
        Object.values(categories).forEach(cat => {
            if (cat.w > 0) {
                totalScore += (cat.s / cat.w) * 100;
                count++;
            }
        });

        return { categories, finalScore: Math.round(totalScore / count) || 0 };
    }

    checkSmartRecommendations(audits, isRoot) {
        const recBox = document.getElementById('smart-recommendation');
        if (!recBox) return;

        // Only show the big recommendation banner for Root URLs
        if (!isRoot) {
            recBox.style.display = 'none';
            return;
        }

        const privacyAudit = audits.find(a => a.title === 'سياسة الخصوصية');
        if (privacyAudit && privacyAudit.status === 'fail') {
            recBox.innerHTML = `<div class="smart-rec-text"><h5 class="fw-bold mb-1"><i class="fa-solid fa-wand-magic-sparkles text-primary"></i> نصيحة ذكية: موقعك يفتقر لسياسة الخصوصية</h5><p class="small text-muted mb-0">جوجل تعطي أولوية للمواقع التي تحترم خصوصية المستخدم. استخدم أداتنا لتوليد واحدة مجاناً.</p></div><a href="../privacy-generator/index.html" class="smart-rec-btn">توليد الآن</a>`;
            recBox.style.display = 'flex';
        } else {
            recBox.style.display = 'none';
        }
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        const items = this.history.getAll();
        historyList.innerHTML = items.map((h, i) => `<div class="history-item" onclick="applyHistory(${i})"><b>${h.title.slice(0,25)}</b> <span>${h.date}</span></div>`).join('');
    }

    applyHistory(index) {
        const items = this.history.getAll();
        if (items[index] && items[index].source !== 'Manual Code') {
            document.getElementById('siteUrl').value = items[index].source;
            this.startAnalysis();
        }
    }

    showFix(title) {
        const d = this.fixData[title];
        if (!d) return;
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalDesc').innerText = d.desc;
        document.getElementById('modalSnippet').innerText = d.code;
        document.getElementById('fixModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('fixModal').classList.remove('show');
    }

    copySnippet() {
        navigator.clipboard.writeText(document.getElementById('modalSnippet').innerText);
        window.showToast?.('تم نسخ الكود بنجاح!', 'success');
    }

    copySummary() {
        const score = document.getElementById('total-score').innerText;
        const words = document.getElementById('stat-words').innerText;
        const resources = document.getElementById('stat-res').innerText;
        const url = document.getElementById('siteUrl').value || 'كود يدوي';

        const summary = `📊 ملخص تحليل الموقع - كونكت تاق\n-------------------------------\n🌐 الرابط: ${url}\n📈 النتيجة النهائية: ${score}/100\n📝 عدد الكلمات: ${words}\n🛠 الموارد التقنية: ${resources}\n\nتم التحليل بواسطة منصة كونكت تاق الاحترافية.`.trim();

        navigator.clipboard.writeText(summary);
        window.showToast?.('تم نسخ ملخص التقرير بنجاح!', 'success');
    }
}

// Instantiate the app
new SiteCheckerApp();

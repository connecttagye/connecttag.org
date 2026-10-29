import AnalyzerCore from './core/AnalyzerCore.js';
import UIEngine from './core/UIEngine.js';
import HistoryManager from './core/HistoryManager.js';

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

class SiteCheckerApp {
    constructor() {
        this.core = new AnalyzerCore();
        this.ui = new UIEngine();
        this.history = new HistoryManager();
        this.currentTool = 'all';
        this.mode = 'url';
        this.lastAnalysisData = null;

        this.fixData = {
            'عنوان الصفحة (Title)': {
                desc: 'أضف وسم <title> فريد وجذاب بطول يتراوح بين 30 و60 حرفاً داخل وسم <head>.',
                code: '<head>\n  <title>اسم الخدمة أو المقال الرئيسي - اسم علامتك التجارية</title>\n</head>'
            },
            'الوصف التعريفي (Meta Description)': {
                desc: 'أضف وصفاً واضحاً يلخص محتوى الصفحة بطول 110 إلى 160 حرفاً لرفع نسبة النقر في نتائج البحث.',
                code: '<meta name="description" content="وصف شامل وجذاب يلخص محتوى الصفحة ويتضمن الكلمات المفتاحية الأساسية بشكل طبيعي.">'
            },
            'قابلية الأرشفة (Meta Robots)': {
                desc: 'تأكد من السماح لمحركات البحث بأرشفة الصفحة وتتبع روابطها عبر وسم robots.',
                code: '<meta name="robots" content="index, follow">'
            },
            'الرابط الأساسي (Canonical)': {
                desc: 'حدد الرابط الأصلي للصفحة لمنع مشاكل تكرار المحتوى في محركات البحث.',
                code: '<link rel="canonical" href="https://example.com/page-url/">'
            },
            'التوافق مع الجوال واللغة': {
                desc: 'أضف وسم viewport لضمان تجاوب الموقع مع الجوال، وحدد لغة واتجاه الصفحة في وسم <html>.',
                code: '<html lang="ar" dir="rtl">\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>'
            },
            'دلالات الـ HTML (Semantic)': {
                desc: 'استخدم وسوم HTML5 الدلالية بدلاً من الاعتماد الكلي على <div> لتوضيح هيكل الصفحة.',
                code: '<header>...</header>\n<nav>...</nav>\n<main>\n  <article>\n    <section>...</section>\n  </article>\n</main>\n<footer>...</footer>'
            },
            'صحة الروابط': {
                desc: 'تجنب استخدام href="#" للأزرار التفاعلية؛ استخدم وسم <button> للأحداث البرمجية و<a> للروابط الحقيقية.',
                code: '<!-- للأزرار التفاعلية -->\n<button type="button" onclick="openMenu()">فتح القائمة</button>\n\n<!-- للروابط الفعلية -->\n<a href="/contact.html">تواصل معنا</a>'
            },
            'أمان الموقع (HTTPS)': {
                desc: 'فعّل شهادة SSL ووجه جميع طلبات HTTP تلقائياً إلى HTTPS عبر إعدادات الخادم.',
                code: '# إعداد .htaccess لتحويل الروابط إلى HTTPS\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]'
            },
            'رؤوس الحماية (Security Headers)': {
                desc: 'أضف رؤوس الحماية الأساسية في إعدادات الخادم أو ملف _headers لحماية الزوار من هجمات XSS وClickjacking.',
                code: 'Strict-Transport-Security: max-age=31536000; includeSubDomains\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin'
            },
            'المحتوى المختلط (Mixed Content)': {
                desc: 'تأكد من استدعاء جميع الصور والسكربتات والملفات عبر https:// وليس http://.',
                code: '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">'
            },
            'أمان الروابط الخارجية': {
                desc: 'عند فتح رابط خارجي في نافذة جديدة (target="_blank")، أضف سمة rel="noopener noreferrer".',
                code: '<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">رابط خارجي آمن</a>'
            },
            'الوسم الرئيسي (H1)': {
                desc: 'تأكد من وجود وسم H1 واحد فقط في كل صفحة يصف العنوان الرئيسي للمحتوى.',
                code: '<h1>العنوان الرئيسي للصفحة أو المقال</h1>'
            },
            'النصوص البديلة للصور': {
                desc: 'أضف سمة alt لكل وسم img لوصف محتوى الصورة لمحركات البحث وقارئات الشاشة.',
                code: '<img src="hero.webp" alt="وصف دقيق وواضح لمحتوى الصورة" width="800" height="450" loading="lazy">'
            },
            'تحسين الصور وتجربة العرض': {
                desc: 'حدد أبعاد الصور (width وheight) لمنع انزياح التخطيط (CLS)، واستخدم صيغة WebP والتحميل الكسول.',
                code: '<img src="banner.webp" alt="وصف الصورة" width="1200" height="630" loading="lazy" decoding="async">'
            },
            'السكربتات الحاجبة للعرض': {
                desc: 'أضف سمة defer أو async لملفات JavaScript في <head> لمنع تعطيل رسم الصفحة.',
                code: '<script src="/assets/js/app.min.js" defer></script>'
            },
            'البيانات المنظمة (Schema)': {
                desc: 'استخدم كود JSON-LD سليم الصياغة لتعريف نوع المحتوى لمحركات البحث.',
                code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "عنوان الصفحة",\n  "description": "وصف مختصر للصفحة"\n}\n</script>'
            },
            'وسوم المشاركة الاجتماعية (OpenGraph)': {
                desc: 'أضف وسوم OpenGraph وTwitter Cards لعرض بطاقة معاينة احترافية عند مشاركة الرابط.',
                code: '<meta property="og:title" content="عنوان الصفحة">\n<meta property="og:description" content="وصف الصفحة">\n<meta property="og:image" content="https://example.com/cover.webp">\n<meta property="og:url" content="https://example.com/">\n<meta name="twitter:card" content="summary_large_image">'
            },
            'تسلسل العناوين (Heading Hierarchy)': {
                desc: 'رتب العناوين بتسلسل هرمي منطقي (H1 ثم H2 ثم H3) دون القفز من H1 إلى H3 مباشرة.',
                code: '<h1>العنوان الرئيسي</h1>\n  <h2>القسم الأول</h2>\n    <h3>نقطة فرعية</h3>'
            },
            'فجوة الكلمات المفتاحية (Keyword Gap)': {
                desc: 'احرص على تضمين الكلمات المفتاحية الواردة في العنوان والوصف داخل الفقرات الأولى من محتوى الصفحة.',
                code: '<!-- اذكر الكلمات المفتاحية الرئيسية بشكل طبيعي في أول 150 كلمة وفي العناوين الفرعية H2 -->'
            }
        };
        window.fixData = this.fixData;

        this.init();
    }

    init() {
        this.detectCurrentTool();
        this.loadInitialState();
        this.setupEventListeners();

        // Global exports for HTML onclick handlers
        window.selectTool = (tool) => this.selectTool(tool);
        window.switchMode = (mode) => this.switchMode(mode);
        window.startAnalysis = () => this.startAnalysis();
        window.loadDemoData = () => this.loadDemoData();
        window.showFix = (title) => this.showFix(title);
        window.closeModal = () => this.closeModal();
        window.copySnippet = () => this.copySnippet();
        window.copySummary = () => this.copySummary();
        window.applyHistory = (index) => this.applyHistory(index);
        window.clearHistory = () => this.clearHistory();
        window.filterSiteLinks = (filter, showAll = false) => {
            if (this.core.auditors.seo) {
                this.core.auditors.seo.renderLinksTable(filter, showAll);
            }
        };

        if (typeof AOS !== 'undefined') {
            AOS.init({ once: true });
        }
    }

    setupEventListeners() {
        window.addEventListener('DOMContentLoaded', () => {
            this.renderHistory();
        });
        window.addEventListener('load', () => {
            this.renderHistory();
        });

        const urlInput = document.getElementById('siteUrl');
        if (urlInput) {
            urlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.startAnalysis();
                }
            });
        }

        const codeInput = document.getElementById('htmlCode');
        if (codeInput) {
            codeInput.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    this.startAnalysis();
                }
            });
        }

        const fixModal = document.getElementById('fixModal');
        if (fixModal) {
            fixModal.addEventListener('click', (e) => {
                if (e.target === fixModal) this.closeModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    detectCurrentTool() {
        const path = window.location.pathname;
        if (path.includes('seo-checker')) this.currentTool = 'seo';
        else if (path.includes('security-checker')) this.currentTool = 'trust';
        else this.currentTool = 'all';

        this.updateToolUI();
    }

    loadInitialState() {
        const params = new URLSearchParams(window.location.search);
        const queryUrl = params.get('url');
        const input = document.getElementById('siteUrl');

        if (queryUrl && input) {
            input.value = queryUrl;
            setTimeout(() => this.startAnalysis(), 150);
            return;
        }

        const lastUrl = localStorage.getItem('last_seo_url');
        if (lastUrl && input) {
            input.value = lastUrl;
        }
    }

    updateToolUI() {
        document.querySelectorAll('.tool-tile').forEach(t => t.classList.remove('active'));
        const activeTile = document.getElementById('tool-' + this.currentTool);
        if (activeTile) activeTile.classList.add('active');

        const headers = {
            all: {
                h1: 'منصة تحليل المواقع الاحترافية',
                p: 'الأداة المتكاملة للمطورين لتدقيق المواقع وتحسين الأداء الرقمي'
            },
            seo: {
                h1: 'محلل الـ SEO الاحترافي',
                p: 'أداة متكاملة لتحليل بنية الموقع، الكلمات المفتاحية، وتصدر نتائج البحث'
            },
            trust: {
                h1: 'فاحص أمان وموثوقية المواقع',
                p: 'الأداة المتخصصة لتدقيق معايير الأمان، التشفير، وحماية بيانات المستخدمين'
            }
        };

        const meta = headers[this.currentTool] || headers.all;
        const h1El = document.querySelector('.page-header-unified h1');
        const pEl = document.querySelector('.page-header-unified p');
        if (h1El) h1El.textContent = meta.h1;
        if (pEl) pEl.textContent = meta.p;
    }

    selectTool(tool) {
        const currentInput = document.getElementById('siteUrl')?.value;
        if (currentInput) localStorage.setItem('last_seo_url', currentInput);

        this.currentTool = tool;
        this.updateToolUI();

        // Update browser URL cleanly without losing current analysis state
        const targetPaths = {
            all: '/tools/web/site-checker/',
            seo: '/tools/web/site-checker/seo-checker',
            trust: '/tools/web/site-checker/security-checker'
        };
        if (window.history && window.history.pushState && targetPaths[tool]) {
            try {
                const search = window.location.search || '';
                window.history.pushState({ tool }, '', targetPaths[tool] + search);
            } catch {
                // Ignore history errors on file:// protocol
            }
        }

        if (this.lastAnalysisData) {
            const d = this.lastAnalysisData;
            this.processResults(
                d.htmlContent,
                d.finalUrl,
                d.filesStatus,
                d.securityHeaders,
                d.pageSize,
                d.server,
                d.performance,
                d.redirects,
                false
            );
        } else if (document.getElementById('results-dashboard')?.classList.contains('visible')) {
            this.startAnalysis();
        }
    }

    switchMode(m) {
        this.mode = m;
        document.querySelectorAll('.tab-item').forEach((t, i) =>
            t.classList.toggle('active', (m === 'url' && i === 0) || (m === 'code' && i === 1))
        );
        const urlMode = document.getElementById('url-mode');
        const codeMode = document.getElementById('code-mode');
        if (urlMode) urlMode.style.display = m === 'url' ? 'block' : 'none';
        if (codeMode) codeMode.style.display = m === 'code' ? 'block' : 'none';
    }

    loadDemoData() {
        this.switchMode('code');
        const codeEditor = document.getElementById('htmlCode');
        if (codeEditor) {
            codeEditor.value = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>كونكت تاق - دليل تطوير المواقع وتطبيقات الويب الحديثة</title>
    <meta name="description" content="استكشف أفضل أدوات ومصادر تطوير المواقع، تحسين محركات البحث SEO، وفحص أمان تطبيقات الويب بمعايير عالمية.">
    <link rel="canonical" href="https://connecttag.org/">
    <meta property="og:title" content="كونكت تاق - دليل تطوير المواقع">
    <meta property="og:description" content="أفضل مصادر وأدوات تطوير المواقع وتحسين محركات البحث.">
    <meta property="og:image" content="https://connecttag.org/assets/img/covers/site-checker-cover.webp">
    <meta property="og:url" content="https://connecttag.org/">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "كونكت تاق",
      "url": "https://connecttag.org/"
    }
    </script>
</head>
<body>
    <header>
        <nav>
            <a href="/">الرئيسية</a>
            <a href="/about.html">من نحن</a>
            <a href="/privacy-policy.html">سياسة الخصوصية</a>
            <a href="/terms-of-use.html">شروط الاستخدام</a>
            <a href="/contact.html">تواصل معنا</a>
        </nav>
    </header>
    <main>
        <article>
            <h1>دليل تطوير المواقع وتحسين محركات البحث SEO</h1>
            <p>يعد تطوير المواقع الحديثة وتحسين محركات البحث من أهم الركائز الرقمية لبناء حضور قوي وموثوق على شبكة الإنترنت. نحن نقدم أدوات برمجية متكاملة لمساعدة المطورين على فحص جودة الكود وأمان تطبيقات الويب.</p>
            <h2>أهمية معايير الأداء وتجربة المستخدم</h2>
            <p>تساعد معايير الأداء السريع وهيكلية الوسوم الدلالية على تحسين ترتيب الموقع في نتائج البحث وتقديم تجربة تصفح سلسة على الهواتف الذكية وأجهزة سطح المكتب.</p>
            <img src="https://connecttag.org/favicon.webp" alt="شعار منصة كونكت تاق" width="64" height="64" loading="lazy">
            <a href="#">رابط تجريبي يحتاج لإصلاح</a>
        </article>
    </main>
    <footer>
        <a href="https://x.com/connecttagye" target="_blank" rel="noopener noreferrer">حسابنا على X</a>
    </footer>
</body>
</html>`;
        }
        this.startAnalysis();
    }

    async startAnalysis() {
        const urlInputEl = document.getElementById('siteUrl');
        const htmlInputEl = document.getElementById('htmlCode');
        let urlInput = urlInputEl ? urlInputEl.value.trim() : '';
        const htmlInput = htmlInputEl ? htmlInputEl.value : '';

        if (this.mode === 'url') {
            if (!urlInput) {
                window.showToast?.('يرجى إدخال رابط الموقع أولاً', 'warn');
                urlInputEl?.focus();
                return;
            }
            if (!/^https?:\/\//i.test(urlInput)) {
                urlInput = 'https://' + urlInput;
                if (urlInputEl) urlInputEl.value = urlInput;
            }
            try {
                new URL(urlInput);
            } catch {
                window.showToast?.('صيغة الرابط المدخل غير صحيحة', 'error');
                return;
            }
            localStorage.setItem('last_seo_url', urlInput);
        } else {
            if (!htmlInput.trim()) {
                window.showToast?.('يرجى لصق كود HTML أولاً لإجراء التحليل', 'warn');
                htmlInputEl?.focus();
                return;
            }
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
                const data = await this.core.fetchPageData(urlInput);
                htmlContent = data.html;
                securityHeaders = data.securityHeaders;
                pageSize = data.pageSize;
                server = data.server;
                performance = data.performance;
                redirects = data.redirects;

                const baseUrl = new URL(urlInput).origin;
                filesStatus = await this.core.checkExtraFiles(baseUrl);
                finalUrl = urlInput;
            } else {
                htmlContent = htmlInput;
                finalUrl = 'Manual Code';
                pageSize = (new TextEncoder().encode(htmlContent).length / 1024).toFixed(1);
            }

            this.lastAnalysisData = {
                htmlContent,
                finalUrl,
                filesStatus,
                securityHeaders,
                pageSize,
                server,
                performance,
                redirects
            };

            this.processResults(htmlContent, finalUrl, filesStatus, securityHeaders, pageSize, server, performance, redirects, true);
        } catch (err) {
            console.error(err);
            window.showToast?.('تعذر جلب الموقع أو تحليله. تأكد من صحة الرابط أو جرب وضع فحص الكود (HTML).', 'error');
            this.ui.hideLoader();
        }
    }

    processResults(html, url, files, security, pageSize, server, performance, redirects, saveToHistory = true) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html || '<html><body></body></html>', 'text/html');

        const audits = this.core.runAudits(doc, html, url, files, security, this.currentTool, performance, redirects);

        const seoSpecialized = document.getElementById('seo-specialized');
        if (seoSpecialized) {
            seoSpecialized.style.display = (this.currentTool === 'all' || this.currentTool === 'seo') ? 'block' : 'none';
        }

        if (this.core.auditors.seo) {
            this.core.auditors.seo.updateSocialPreview(doc, url);
            this.core.auditors.seo.analyzeKeywords(doc);
            this.core.auditors.seo.exploreLinks(doc, url);
        } else if (this.core.auditors.content) {
            const cleanText = this.core.auditors.content.extractCleanText(doc);
            const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 1) : [];
            const statWords = document.getElementById('stat-words');
            if (statWords) statWords.innerText = words.length;
        }

        if (this.core.auditors.content) {
            this.core.auditors.content.updateContentDashboard(doc);
        }
        if (this.core.auditors.tech) {
            this.core.auditors.tech.updateResourceMap(doc, url);
        }
        this.updateResourceStats(doc);

        const { categories, finalScore } = this.calculateScores(audits);

        const scripts = doc.querySelectorAll('script[src]').length;
        const styles = doc.querySelectorAll('link[rel="stylesheet"]').length;
        const images = doc.querySelectorAll('img').length;

        const classifiedLinks = this.core.auditors.seo
            ? this.core.auditors.seo.classifyLinks(doc, url)
            : [];
        const internalLinksCount = classifiedLinks.filter(l => l.type === 'internal').length;
        const externalLinksCount = classifiedLinks.filter(l => l.type === 'external').length;

        const links = Array.from(doc.querySelectorAll('a'));
        const checkLink = (keywords) => links.some(a => {
            const text = (a.textContent || '').toLowerCase();
            const href = (a.getAttribute('href') || '').toLowerCase();
            return keywords.some(k => text.includes(k) || href.includes(k));
        });

        const socialDomains = ['facebook.com', 'fb.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'youtu.be', 'tiktok.com', 't.me', 'wa.me'];
        const socialLinksCount = links.filter(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            return socialDomains.some(d => href.includes(d));
        }).length;

        const cms = this.core.auditors.tech ? this.core.auditors.tech.detectCMS(doc, html) : 'مخصص';
        const pubMatch = html.match(/ca-pub-\d+|pub-\d+/i);
        const gaMatch = html.match(/G-[A-Z0-9]{6,}|UA-\d+-\d+|GTM-[A-Z0-9]+/i);

        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || doc.querySelector('title')?.textContent?.trim();
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || doc.querySelector('meta[name="description"]')?.getAttribute('content');
        const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

        const robotsMeta = (doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '').toLowerCase();
        const isIndexable = !robotsMeta.includes('noindex');

        let siteMeta = null;
        if (url !== 'Manual Code') {
            const urlObj = new URL(url);
            const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
            const hasSitemap = files.sitemap || html.toLowerCase().includes('sitemap.xml') || !!doc.querySelector('link[rel="sitemap"]');

            let canonicalStatus = 'غير محدد ❌';
            if (canonical) {
                try {
                    canonicalStatus = new URL(canonical, url).href === urlObj.href ? 'مطابق ✅' : 'محدد ✅';
                } catch {
                    canonicalStatus = 'غير صالح ⚠️';
                }
            }

            siteMeta = {
                title: doc.querySelector('title')?.textContent?.trim() || 'بدون عنوان',
                url,
                favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
                cms,
                ads: pubMatch ? `مفعلة (${pubMatch[0]})` : 'غير نشطة',
                analytics: gaMatch ? `مفعلة (${gaMatch[0].slice(0, 12)})` : 'غير مكتشفة',
                sitemap: hasSitemap ? 'مكتشفة ✅' : 'غير محددة ❌',
                isRoot: urlObj.pathname === '/' || urlObj.pathname === '',
                typeLabel: (urlObj.pathname === '/' || urlObj.pathname === '') ? 'الصفحة الرئيسية' : 'صفحة فرعية',
                protocol: urlObj.protocol.replace(':', '').toUpperCase(),
                tld: '.' + urlObj.hostname.split('.').pop(),
                charset: doc.characterSet || 'UTF-8',
                lang: doc.documentElement.getAttribute('lang') || 'غير محدد',
                pageSize: pageSize || '0',
                server: server || 'N/A',
                robots: files.robots ? 'موجود ✅' : 'غير مكتشف ❌',
                canonical: canonicalStatus,
                isIndexable: isIndexable ? 'مسموح ✅' : 'ممنوع ❌',
                links: {
                    internal: internalLinksCount,
                    external: externalLinksCount,
                    social: socialLinksCount
                },
                resources: { scripts, styles, images },
                social: { title: ogTitle, description: ogDesc, image: ogImage, url },
                basicPages: {
                    privacy: checkLink(['خصوصية', 'الخصوصية', 'privacy', 'legal', 'policy']),
                    about: checkLink(['حول', 'about', 'من نحن', 'قصتنا']),
                    terms: checkLink(['استخدام', 'الاستخدام', 'terms', 'شروط']),
                    contact: checkLink(['تواصل', 'contact', 'اتصل', 'راسلنا', 'support'])
                }
            };
        } else {
            siteMeta = {
                title: doc.querySelector('title')?.textContent?.trim() || 'تحليل كود HTML مباشر',
                url: 'وضع الكود اليدوي (Local HTML)',
                favicon: null,
                cms,
                ads: pubMatch ? `مفعلة (${pubMatch[0]})` : 'غير نشطة',
                analytics: gaMatch ? `مفعلة (${gaMatch[0].slice(0, 12)})` : 'غير مكتشفة',
                sitemap: 'فحص محلي',
                isRoot: true,
                typeLabel: 'كود HTML مباشر',
                protocol: 'LOCAL',
                tld: 'N/A',
                charset: doc.characterSet || 'UTF-8',
                lang: doc.documentElement.getAttribute('lang') || 'غير محدد',
                pageSize: pageSize || '0',
                server: 'متصفح محلي',
                robots: 'فحص محلي',
                canonical: doc.querySelector('link[rel="canonical"]') ? 'محدد ✅' : 'غير محدد ❌',
                isIndexable: isIndexable ? 'مسموح ✅' : 'ممنوع ❌',
                links: {
                    internal: internalLinksCount,
                    external: externalLinksCount,
                    social: socialLinksCount
                },
                resources: { scripts, styles, images },
                social: { title: ogTitle, description: ogDesc, image: ogImage, url: 'https://example.com' },
                basicPages: {
                    privacy: checkLink(['خصوصية', 'الخصوصية', 'privacy', 'legal', 'policy']),
                    about: checkLink(['حول', 'about', 'من نحن', 'قصتنا']),
                    terms: checkLink(['استخدام', 'الاستخدام', 'terms', 'شروط']),
                    contact: checkLink(['تواصل', 'contact', 'اتصل', 'راسلنا', 'support'])
                }
            };
        }

        this.checkSmartRecommendations(audits, siteMeta?.isRoot);
        if (saveToHistory) {
            this.history.save(siteMeta.title, url, finalScore);
            this.renderHistory();
        }

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
        const categories = {
            SEO: { s: 0, w: 0 },
            Technical: { s: 0, w: 0 },
            UX: { s: 0, w: 0 },
            Security: { s: 0, w: 0 },
            Policy: { s: 0, w: 0 },
            Social: { s: 0, w: 0 }
        };

        let totalWeightedEarned = 0;
        let totalWeightedMax = 0;

        audits.forEach(audit => {
            const score = audit.status === 'pass' ? 100 : (audit.status === 'warn' ? 50 : 0);
            const weight = audit.weight || 5;
            totalWeightedEarned += score * weight;
            totalWeightedMax += 100 * weight;

            if (categories[audit.category]) {
                categories[audit.category].s += score * weight;
                categories[audit.category].w += 100 * weight;
            }
        });

        const finalScore = totalWeightedMax > 0 ? Math.round((totalWeightedEarned / totalWeightedMax) * 100) : 0;
        return { categories, finalScore };
    }

    checkSmartRecommendations(audits, isRoot) {
        const recBox = document.getElementById('smart-recommendation');
        if (!recBox) return;

        if (!isRoot) {
            recBox.style.display = 'none';
            return;
        }

        const privacyAudit = audits.find(a => a.title === 'سياسة الخصوصية');
        if (privacyAudit && privacyAudit.status === 'fail') {
            recBox.innerHTML = `<div class="smart-rec-text"><h3 class="h5 fw-bold mb-1"><i class="fa-solid fa-wand-magic-sparkles text-primary"></i> نصيحة ذكية: موقعك يفتقر لسياسة الخصوصية</h3><p class="small text-muted mb-0">محركات البحث وشبكات الإعلانات تعطي أولوية للمواقع التي تحترم خصوصية المستخدم. استخدم أداتنا لتوليد سياسة احترافية مجاناً.</p></div><a href="https://connecttag.org/tools/security/privacy-generator/" class="smart-rec-btn">توليد الآن</a>`;
            recBox.style.display = 'flex';
        } else {
            recBox.style.display = 'none';
        }
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        const items = this.history.getAll();

        if (items.length === 0) {
            historyList.innerHTML = `<p class="text-muted small text-center mb-0 py-3">لا توجد عمليات فحص سابقة</p>`;
            return;
        }

        historyList.innerHTML = items.map((h, i) => {
            const safeTitle = escapeHtml((h.title || 'تحليل موقع').slice(0, 28));
            const safeDate = escapeHtml(h.date || '');
            const scoreBadge = typeof h.score === 'number'
                ? `<span class="badge ${h.score >= 80 ? 'bg-success' : (h.score >= 50 ? 'bg-warning text-dark' : 'bg-danger')} rounded-pill">${h.score}/100</span>`
                : '';

            return `
                <div class="history-item" onclick="applyHistory(${i})">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <b>${safeTitle}</b>
                        ${scoreBadge}
                    </div>
                    <span>${safeDate}</span>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        this.history.clear();
        this.renderHistory();
        window.showToast?.('تم مسح سجل الفحوصات', 'success');
    }

    applyHistory(index) {
        const items = this.history.getAll();
        const item = items[index];
        if (!item) return;

        if (item.source === 'Manual Code') {
            this.loadDemoData();
        } else {
            this.switchMode('url');
            const input = document.getElementById('siteUrl');
            if (input) input.value = item.source;
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
        document.getElementById('fixModal')?.classList.remove('show');
    }

    copySnippet() {
        const snippet = document.getElementById('modalSnippet')?.innerText || '';
        navigator.clipboard.writeText(snippet);
        window.showToast?.('تم نسخ الكود البرمجي بنجاح!', 'success');
    }

    copySummary() {
        const score = document.getElementById('total-score')?.innerText || '0';
        const words = document.getElementById('stat-words')?.innerText || '0';
        const resources = document.getElementById('stat-res')?.innerText || '0';
        const url = this.mode === 'url'
            ? (document.getElementById('siteUrl')?.value || 'غير محدد')
            : 'فحص كود HTML مباشر';

        const summary = `📊 ملخص تحليل الموقع - كونكت تاق\n-------------------------------\n🌐 المصدر: ${url}\n📈 النتيجة النهائية: ${score}/100\n📝 عدد الكلمات: ${words}\n🛠 الموارد التقنية: ${resources}\n\n🔗 تم التحليل عبر منصة كونكت تاق: https://connecttag.org/tools/web/site-checker/`.trim();

        navigator.clipboard.writeText(summary);
        window.showToast?.('تم نسخ ملخص التقرير بنجاح!', 'success');
    }
}

new SiteCheckerApp();

export default class AnalyzerCore {
    constructor() {
        this.auditors = {
            seo: null,
            security: null,
            tech: null,
            content: null
        };
    }

    async loadAuditors(type) {
        const promises = [];
        if ((type === 'seo' || type === 'all') && !this.auditors.seo) {
            promises.push(import('../auditors/seo.js').then(m => this.auditors.seo = m));
            promises.push(import('../auditors/content.js').then(m => this.auditors.content = m));
        }
        if ((type === 'trust' || type === 'all') && !this.auditors.security) {
            promises.push(import('../auditors/security.js').then(m => this.auditors.security = m));
        }
        if ((type === 'tech' || type === 'all' || type === 'monetize') && !this.auditors.tech) {
            promises.push(import('../auditors/tech.js').then(m => this.auditors.tech = m));
        }
        await Promise.all(promises);
    }

    async fetchPageData(url) {
        const response = await fetch(`https://proxy.connecttag.app/?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Failed to fetch page');

        const html = await response.text();
        const securityHeader = response.headers.get('X-Security-Audit');
        const securityHeaders = securityHeader ? JSON.parse(securityHeader) : {};

        return { html, securityHeaders };
    }

    async checkExtraFiles(baseUrl) {
        const fileChecks = [
            { name: 'robots', url: `${baseUrl}/robots.txt` },
            { name: 'ads', url: `${baseUrl}/ads.txt` }
        ];

        const results = await Promise.all(fileChecks.map(f =>
            fetch(`https://proxy.connecttag.app/?url=${encodeURIComponent(f.url)}`, { method: 'HEAD' })
                .then(r => r.ok)
                .catch(() => false)
        ));

        const status = {};
        fileChecks.forEach((f, i) => status[f.name] = results[i]);
        return status;
    }

    runAudits(doc, html, url, files, security, currentTool) {
        let audits = [];
        const addAudit = (fn, cat) => {
            if (!fn) return;
            const r = fn(doc, html, url, files, security);
            if (r) audits.push({ ...r, category: cat });
        };

        const { seo, security: sec, tech, content } = this.auditors;

        if (['all', 'seo'].includes(currentTool) && seo) {
            addAudit(seo.checkTitle, 'SEO');
            addAudit(seo.checkDescription, 'SEO');
            addAudit(seo.checkHeadings, 'SEO');
            addAudit(seo.checkHeadingStructure, 'SEO');
            addAudit(seo.checkKeywordGap, 'SEO');
            addAudit(seo.checkImages, 'SEO');
            addAudit(seo.checkSchema, 'SEO');
            if (content) {
                const contentResults = content.checkContentQuality(doc);
                contentResults.forEach(r => audits.push({ ...r, category: 'SEO' }));
            }
        }

        if (['all', 'tech'].includes(currentTool) && tech) {
            addAudit(tech.checkCMS, 'Technical');
            addAudit(tech.checkTechStack, 'Technical');
            addAudit(tech.checkSemanticHTML, 'Technical');
        }

        if (['all', 'trust'].includes(currentTool) && sec) {
            addAudit(sec.checkSecurity, 'Security');
            addAudit(sec.checkSecHeaders, 'Security');
            if (tech) addAudit(tech.checkLinkHealth, 'Technical');
            addAudit(sec.checkPagePrivacy, 'Policy');
            audits.push({
                title: 'ملف robots.txt',
                value: files.robots ? 'موجود ✅' : 'غير موجود ❌',
                status: files.robots ? 'pass' : 'warn',
                weight: 8,
                category: 'Technical',
                priority: 'moderate'
            });
        }

        if (['all', 'monetize'].includes(currentTool) && tech) {
            addAudit(tech.checkAdSense, 'Monetization');
            addAudit(tech.checkAnalytics, 'Technical');
            addAudit(tech.checkPixels, 'Monetization');
            audits.push({
                title: 'ملف ads.txt',
                value: files.ads ? 'موجود ✅' : 'غير موجود ❌',
                status: files.ads ? 'pass' : 'warn',
                weight: 10,
                category: 'Monetization',
                priority: 'moderate'
            });
        }

        if (tech) {
            audits.push({ ...tech.checkSocialPresence(doc), category: 'Social' });
            audits.push({ ...tech.checkOpenGraph(doc), category: 'Social' });
        }

        return audits;
    }
}

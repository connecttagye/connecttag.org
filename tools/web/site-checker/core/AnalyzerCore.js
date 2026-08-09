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
        await Promise.all(promises);
    }

    async fetchPageData(url) {
        const response = await fetch(`https://proxy.connecttag.app/?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Failed to fetch page');

        const html = await response.text();
        const pageSize = (new TextEncoder().encode(html).length / 1024).toFixed(1); // Size in KB

        const auditHeader = response.headers.get('X-Security-Audit');
        const fullAudit = auditHeader ? JSON.parse(auditHeader) : {};

        return {
            html,
            securityHeaders: fullAudit.security || {},
            pageSize,
            server: fullAudit.server || 'N/A',
            performance: fullAudit.performance || {},
            redirects: fullAudit.redirects || {}
        };
    }

    async checkExtraFiles(baseUrl) {
        const fileChecks = [
            { name: 'robots', url: `${baseUrl}/robots.txt` }
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

    runAudits(doc, html, url, files, security, currentTool, performance = {}, redirects = {}) {
        let audits = [];
        const addAudit = (fn, cat) => {
            if (!fn) return;
            const r = fn(doc, html, url, files, security, performance, redirects);
            if (r) audits.push({ ...r, category: cat });
        };

        const { seo, security: sec, tech, content } = this.auditors;

        if (['all', 'seo'].includes(currentTool) && seo) {
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

        if (['all', 'trust'].includes(currentTool) && sec) {
            addAudit(sec.checkSecHeaders, 'Security');
            addAudit(sec.checkRedirectionRules, 'Security');
        }

        if (tech) {
            addAudit(tech.checkSemanticHTML, 'Technical');
            addAudit(tech.checkLinkHealth, 'Technical');
            audits.push({ ...tech.checkSocialPresence(doc), category: 'Social' });
            audits.push({ ...tech.checkOpenGraph(doc), category: 'Social' });
        }

        return audits;
    }
}

export default class AnalyzerCore {
    constructor() {
        this.auditors = {
            seo: null,
            security: null,
            tech: null,
            content: null
        };
    }

    async loadAuditors() {
        const promises = [];
        if (!this.auditors.seo) {
            promises.push(import('../auditors/seo.js').then(m => { this.auditors.seo = m; }));
        }
        if (!this.auditors.content) {
            promises.push(import('../auditors/content.js').then(m => { this.auditors.content = m; }));
        }
        if (!this.auditors.security) {
            promises.push(import('../auditors/security.js').then(m => { this.auditors.security = m; }));
        }
        if (!this.auditors.tech) {
            promises.push(import('../auditors/tech.js').then(m => { this.auditors.tech = m; }));
        }
        await Promise.all(promises);
    }

    async fetchPageData(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
            const response = await fetch(`https://proxy.connecttag.app/?url=${encodeURIComponent(url)}`, {
                signal: controller.signal
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch page`);

            const html = await response.text();
            const pageSize = (new TextEncoder().encode(html).length / 1024).toFixed(1);

            let fullAudit = {};
            const auditHeader = response.headers.get('X-Security-Audit');
            if (auditHeader) {
                try {
                    fullAudit = JSON.parse(auditHeader);
                } catch {
                    fullAudit = {};
                }
            }

            return {
                html,
                securityHeaders: fullAudit.security || {},
                pageSize,
                server: fullAudit.server || 'N/A',
                performance: fullAudit.performance || {},
                redirects: fullAudit.redirects || {}
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async checkExtraFiles(baseUrl) {
        const fileChecks = [
            { name: 'robots', url: `${baseUrl}/robots.txt` },
            { name: 'sitemap', url: `${baseUrl}/sitemap.xml` }
        ];

        const results = await Promise.all(fileChecks.map(f =>
            fetch(`https://proxy.connecttag.app/?url=${encodeURIComponent(f.url)}`, { method: 'HEAD' })
                .then(r => r.ok)
                .catch(() => false)
        ));

        const status = {};
        fileChecks.forEach((f, i) => { status[f.name] = results[i]; });
        return status;
    }

    runAudits(doc, html, url, files, security, currentTool, performance = {}, redirects = {}) {
        const audits = [];
        const addAudit = (fn, cat) => {
            if (!fn) return;
            const r = fn(doc, html, url, files, security, performance, redirects);
            if (r) audits.push({ ...r, category: cat });
        };

        const { seo, security: sec, tech, content } = this.auditors;

        if (['all', 'seo'].includes(currentTool) && seo) {
            addAudit(seo.checkTitle, 'SEO');
            addAudit(seo.checkDescription, 'SEO');
            addAudit(seo.checkIndexability, 'SEO');
            addAudit(seo.checkCanonical, 'SEO');
            addAudit(seo.checkViewportAndLang, 'SEO');
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
            addAudit(sec.checkSecurity, 'Security');
            addAudit(sec.checkSecHeaders, 'Security');
            addAudit(sec.checkMixedContent, 'Security');
            addAudit(sec.checkExternalLinksSafety, 'Security');
            addAudit(sec.checkRedirectionRules, 'Security');
            addAudit(sec.checkPagePrivacy, 'Policy');
        }

        if (tech) {
            addAudit(tech.checkSemanticHTML, 'Technical');
            addAudit(tech.checkLinkHealth, 'Technical');
            addAudit(tech.checkTechStack, 'Technical');
            addAudit(tech.checkDOMComplexity, 'Technical');

            if (['all', 'seo'].includes(currentTool)) {
                addAudit(tech.checkImageOptimization, 'UX');
                addAudit(tech.checkRenderBlocking, 'UX');
            }

            addAudit(tech.checkSocialPresence, 'Social');
            addAudit(tech.checkOpenGraph, 'Social');
        }

        return audits;
    }
}

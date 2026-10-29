/**
 * Shared logic for Connect Tag Modems Directory (Local-First V8 Architecture)
 */
const ModemApp = (function() {
    const API_URL = 'https://api.connecttag.app/v5/yemen4g/lists?X-Api-Key=ktmo5flizpu';
    const CACHE_KEY = 'modems_list_cache';
    const CACHE_TIME = 12 * 60 * 60 * 1000; // 12 Hours

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    return {
        apiUrl: API_URL,
        cacheKey: CACHE_KEY,
        escapeHtml: escapeHtml,

        /**
         * Returns local pre-bundled modems data immediately if available.
         */
        getData: function() {
            if (Array.isArray(window.MODEMS_DATA) && window.MODEMS_DATA.length > 0) {
                return window.MODEMS_DATA;
            }
            return this.loadFromCache();
        },

        /**
         * Returns local pre-bundled organizations dictionary if available.
         */
        getOrganizations: function() {
            if (window.MODEM_ORGS_DATA && typeof window.MODEM_ORGS_DATA === 'object') {
                return window.MODEM_ORGS_DATA;
            }
            return {};
        },

        /**
         * Finds an organization by its ID from the local bundle.
         */
        getOrganizationById: function(id) {
            if (!id) return null;
            const orgs = this.getOrganizations();
            return orgs[String(id)] || null;
        },

        /**
         * Finds a modem in the catalog by canonical slug, slugAliases, or ID.
         */
        findModemBySlugOrId: function(catalog, slugOrId) {
            if (!Array.isArray(catalog) || !slugOrId) return null;
            const q = String(slugOrId).trim();
            if (!q) return null;
            const qLower = q.toLowerCase();

            return catalog.find(item => {
                if (!item) return false;
                if (item.slug === q || String(item.id) === q) return true;
                if (item.slug && item.slug.toLowerCase() === qLower) return true;
                if (Array.isArray(item.slugAliases)) {
                    return item.slugAliases.some(alias => String(alias).toLowerCase() === qLower);
                }
                return false;
            }) || null;
        },

        loadFromCache: function() {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TIME) return data;
                }
            } catch (e) {
                console.warn('Cache access error', e);
            }
            return null;
        },

        saveToCache: function(data) {
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, timestamp: Date.now() }));
            } catch (e) {
                console.warn('Cache write error', e);
            }
        },

        /**
         * Resolves modems data from local bundle first (zero server load).
         * Only falls back to network fetch if local bundle is absent.
         */
        fetchData: function(callback, errorCallback, isBackground = false) {
            if (Array.isArray(window.MODEMS_DATA) && window.MODEMS_DATA.length > 0) {
                if (callback) callback(window.MODEMS_DATA);
                return;
            }

            fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.result && Array.isArray(data.result.items)) {
                    const filtered = data.result.items.filter(it => !it.isForDev && String(it.id) !== '1026');
                    this.saveToCache(filtered);
                    if (callback) callback(filtered);
                } else if (!isBackground && errorCallback) {
                    errorCallback('تعذر استرجاع قائمة المودمات حالياً.');
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                if (!isBackground && errorCallback) {
                    errorCallback('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
                }
            });
        },

        /**
         * Combines arabicName + modelOrVersion without duplicating the model string
         * (e.g. avoids "مودم ذا فيوتشر M90 M90").
         */
        formatDisplayName: function(item) {
            if (!item) return '';
            const name = (item.arabicName || '').replace(/\s+/g, ' ').trim();
            const model = (item.modelOrVersion || item.model || '').replace(/M90-RRO/i, 'M90-PRO').trim();
            if (!model) return name;
            const normName = name.toLowerCase();
            const normModel = model.toLowerCase();
            if (normName.includes(normModel)) return name;
            if (normModel === '4g' && (normName.includes('فورجي') || normName.includes('جيب'))) return name;
            if (normModel === 'cat6' && normName.includes('كات 6')) return name;
            const firstToken = normModel.split(/[\s-]+/)[0];
            if (firstToken && normName.endsWith(' ' + firstToken)) {
                return name.slice(0, name.length - firstToken.length).trim() + ' ' + model;
            }
            return `${name} ${model}`.trim();
        },

        /**
         * Cleans multi-line/markdown descriptions for meta tags and short summaries.
         */
        cleanMetaText: function(text) {
            return String(text || '')
                .replace(/---+/g, ' - ')
                .replace(/\r?\n+/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .trim();
        },

        /**
         * Formats multi-line descriptions (with --- dividers and newlines) into clean HTML.
         */
        formatDescriptionHtml: function(text) {
            const raw = String(text || '').trim();
            if (!raw) return '';
            if (!raw.includes('\n') && !raw.includes('---')) {
                return `<p class="mb-0">${escapeHtml(raw)}</p>`;
            }
            const sections = raw.split(/\r?\n\s*---+\s*\r?\n/);
            return sections.map(section => {
                const lines = section.split(/\r?\n/).map(l => l.trim()).filter(l => l && l !== '-');
                if (lines.length === 0) return '';
                if (lines.length === 1) {
                    return `<p class="desc-lead">${escapeHtml(lines[0].replace(/^[-•*]\s*/, ''))}</p>`;
                }
                const heading = escapeHtml(lines[0].replace(/^[-•*]\s*/, ''));
                const items = lines.slice(1)
                    .map(l => l.replace(/^[-•*]\s*/, '').trim())
                    .filter(Boolean)
                    .map(l => `<li>${escapeHtml(l)}</li>`)
                    .join('');
                if (!items) {
                    return `<p class="desc-lead">${heading}</p>`;
                }
                return `<div class="desc-section"><div class="desc-section-title">${heading}</div><ul class="desc-section-list">${items}</ul></div>`;
            }).filter(Boolean).join('');
        },

        getQueryParams: function() {
            return new URLSearchParams(window.location.search);
        },

        showToast: function(message, duration = 2500) {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.className = 'toast-msg show';
                setTimeout(() => {
                    toast.className = toast.className.replace('show', '').trim();
                }, duration);
            } else if (typeof window.showToast === 'function') {
                window.showToast(message, 'info');
            } else if (window.toast && typeof window.toast.show === 'function') {
                window.toast.show(message, 'info');
            }
        }
    };
})();

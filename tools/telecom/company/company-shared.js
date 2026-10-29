/**
 * Shared logic for Connect Tag Company Directory (Instant Seeded + Slug/ID Normalized)
 */
const CompanyApp = (function() {
    const API_URL = 'https://api.connecttag.app/v5/yemenview/initial-data';
    const API_KEY = 'ws9syryf5hyd';
    const CACHE_KEY = 'telecom_companies_cache_v2';
    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 Hours

    const SLUG_MAP = {
        'YOU': 'you',
        'SABAFON': 'sabafon',
        'YEMENMOBILE': 'yemen-mobile',
        'Y_YEMEN': 'y-yemen',
        'YEMENTELECOM': 'yemen-telecom'
    };

    const DEFAULT_COMPANIES = [
        {
            id: 'YOU',
            slug: 'you',
            name: 'You',
            arName: 'يو',
            arDescription: 'يو للاتصالات هي الشركة الرائدة في تقديم خدمات الجيل الرابع في اليمن.',
            logo: 'https://cdn.connecttag.app/image/logo/telecom/you.svg',
            website: 'https://www.you.com.ye',
            email: 'info@you.com.ye',
            phoneNumbers: ['111'],
            socialLinks: [
                { type: 'FACEBOOK', value: 'https://facebook.com/youtelecom', active: true },
                { type: 'TELEGRAM', value: 'https://t.me/youtelecom', active: true }
            ]
        },
        {
            id: 'SABAFON',
            slug: 'sabafon',
            name: 'Sabafone',
            arName: 'سبأفون',
            arDescription: 'سبأفون أول شركة للهاتف النقال في اليمن.',
            logo: 'https://cdn.connecttag.app/image/logo/telecom/sabafon.svg',
            website: 'https://www.sabafon.com.ye',
            email: 'info@sabafon.com.ye',
            phoneNumbers: ['211'],
            socialLinks: [
                { type: 'FACEBOOK', value: 'https://facebook.com/sabafon', active: true }
            ]
        },
        {
            id: 'YEMENMOBILE',
            slug: 'yemen-mobile',
            name: 'Yemen Mobile',
            arName: 'يمن موبايل',
            arDescription: 'يمن موبايل المشغل الوطني لخدمات الاتصالات باليمن.',
            logo: 'https://cdn.connecttag.app/image/logo/telecom/yemen-mobile.svg',
            website: 'https://www.yemenmobile.com.ye',
            email: 'info@yemenmobile.com.ye',
            phoneNumbers: ['121'],
            socialLinks: [
                { type: 'FACEBOOK', value: 'https://facebook.com/yemenmobile.ye', active: true }
            ]
        },
        {
            id: 'Y_YEMEN',
            slug: 'y-yemen',
            name: 'Y',
            arName: 'واي',
            arDescription: 'شركة واي للاتصالات وخدمات متطورة للهاتف النقال.',
            logo: 'https://cdn.connecttag.app/image/logo/telecom/y.svg',
            website: 'https://www.y-yemen.com',
            email: 'info@y-yemen.com',
            phoneNumbers: ['102'],
            socialLinks: []
        },
        {
            id: 'YEMENTELECOM',
            slug: 'yemen-telecom',
            name: 'Yemen Telecom',
            arName: 'الاتصالات اليمنية',
            arDescription: 'المؤسسة العامة للاتصالات اليمنية.',
            logo: 'https://cdn.connecttag.app/image/logo/telecom/yemen-telecom.webp',
            website: 'https://ptc.gov.ye',
            email: 'info@ptc.gov.ye',
            phoneNumbers: ['8000000'],
            socialLinks: []
        }
    ];

    function normalizeKey(val) {
        return String(val || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
    }

    function enrichCompanies(list) {
        if (!Array.isArray(list)) return DEFAULT_COMPANIES;
        return list.map(c => {
            const idStr = String(c.id || '').toUpperCase();
            return {
                ...c,
                slug: c.slug || SLUG_MAP[idStr] || String(c.id || '').toLowerCase().replace(/_/g, '-')
            };
        });
    }

    return {
        apiUrl: API_URL,
        apiKey: API_KEY,
        cacheKey: CACHE_KEY,

        getInitialCompanies: function() {
            const cached = this.loadFromCache();
            if (cached && Array.isArray(cached.companies) && cached.companies.length > 0) {
                return enrichCompanies(cached.companies);
            }
            return DEFAULT_COMPANIES;
        },

        findCompany: function(companies, params) {
            const list = enrichCompanies(companies && companies.length ? companies : DEFAULT_COMPANIES);
            const rawTarget = (params.get('slug') || params.get('companyId') || params.get('id') || '').trim();
            if (!rawTarget) return null;
            const normTarget = normalizeKey(rawTarget);
            return list.find(c =>
                normalizeKey(c.slug) === normTarget ||
                normalizeKey(c.id) === normTarget ||
                normalizeKey(c.name) === normTarget
            ) || null;
        },

        loadFromCache: function() {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TIME && data) {
                        if (Array.isArray(data.companies)) {
                            data.companies = enrichCompanies(data.companies);
                        }
                        return data;
                    }
                }
            } catch (e) {
                console.warn('Cache read error', e);
            }
            return null;
        },

        saveToCache: function(data) {
            try {
                if (data && Array.isArray(data.companies)) {
                    data.companies = enrichCompanies(data.companies);
                }
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            } catch (e) {
                console.warn('Cache write error', e);
            }
        },

        fetchData: function(callback, errorCallback, isBackground = false) {
            fetch(API_URL, {
                method: 'GET',
                headers: { 'X-Api-Key': API_KEY }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.result) {
                    if (Array.isArray(data.result.companies)) {
                        data.result.companies = enrichCompanies(data.result.companies);
                    }
                    this.saveToCache(data.result);
                    if (callback) callback(data.result);
                } else if (!isBackground && errorCallback) {
                    errorCallback('عذراً، فشل تحميل البيانات.');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                if (!isBackground && errorCallback) {
                    errorCallback('حدث خطأ في الاتصال بالخادم.');
                }
            });
        },

        getQueryParams: function() {
            return new URLSearchParams(window.location.search);
        },

        showToast: function(message, duration = 2400) {
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

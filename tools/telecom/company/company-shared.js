/**
 * Shared logic for Connect Tag Company Directory
 */
const CompanyApp = (function() {
    const API_URL = 'https://api.connecttag.app/v5/yemenview/initial-data';
    const API_KEY = 'ws9syryf5hyd';
    const CACHE_KEY = 'telecom_companies_cache';
    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 Hours

    return {
        apiUrl: API_URL,
        apiKey: API_KEY,
        cacheKey: CACHE_KEY,

        loadFromCache: function() {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TIME) return data;
                }
            } catch (e) {
                console.warn('Cache read error', e);
            }
            return null;
        },

        saveToCache: function(data) {
            try {
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
                    toast.className = toast.className.replace('show', '');
                }, duration);
            } else if (window.toast) {
                window.toast.show(message, 'info');
            }
        }
    };
})();

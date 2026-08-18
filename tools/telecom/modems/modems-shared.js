/**
 * Shared logic for Connect Tag Modems Directory
 */
const ModemApp = (function() {
    const API_URL = 'https://api.connecttag.app/v5/yemen4g/lists?X-Api-Key=ktmo5flizpu';
    const CACHE_KEY = 'modems_list_cache';
    const CACHE_TIME = 12 * 60 * 60 * 1000; // 12 Hours

    return {
        apiUrl: API_URL,
        cacheKey: CACHE_KEY,

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

        fetchData: function(callback, errorCallback, isBackground = false) {
            fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.result && Array.isArray(data.result.items)) {
                    this.saveToCache(data.result.items);
                    if (callback) callback(data.result.items);
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

        getQueryParams: function() {
            return new URLSearchParams(window.location.search);
        },

        showToast: function(message, duration = 2500) {
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

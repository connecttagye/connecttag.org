export default class HistoryManager {
    constructor(key = 'seo_history', limit = 6) {
        this.key = key;
        this.limit = limit;
    }

    save(title, source, score = null) {
        let history = this.getAll();
        history = history.filter(h => h.source !== source);
        history.unshift({
            title: title || 'تحليل موقع',
            source,
            score,
            date: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
        });
        try {
            localStorage.setItem(this.key, JSON.stringify(history.slice(0, this.limit)));
        } catch {
            // Ignore quota errors
        }
    }

    getAll() {
        try {
            const raw = localStorage.getItem(this.key);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch {
            // Ignore errors
        }
    }
}

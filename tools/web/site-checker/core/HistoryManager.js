export default class HistoryManager {
    constructor(key = 'seo_history', limit = 5) {
        this.key = key;
        this.limit = limit;
    }

    save(title, source) {
        let history = this.getAll();
        history = history.filter(h => h.source !== source);
        history.unshift({
            title,
            source,
            date: new Date().toLocaleTimeString('ar-YE')
        });
        localStorage.setItem(this.key, JSON.stringify(history.slice(0, this.limit)));
    }

    getAll() {
        return JSON.parse(localStorage.getItem(this.key) || '[]');
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}

/**
 * Connect Tag Unified Toast Component
 * Usage: window.showToast("Message", "success" | "error" | "info");
 */
class SiteToast extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.shadowRoot.appendChild(this.container);
        this.shadowRoot.appendChild(this.getStyles());
    }

    connectedCallback() {
        window.showToast = (message, type = 'info') => this.add(message, type);
    }

    add(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <i class="fa ${icon}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    getIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-triangle';
            case 'warn': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }

    getStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
            #toast-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                font-family: 'Cairo', sans-serif;
                direction: rtl;
            }
            .toast {
                background: #fff;
                color: #1e293b;
                padding: 12px 25px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                font-weight: 700;
                transform: translateX(120%);
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                border-right: 5px solid #006b98;
                min-width: 250px;
            }
            .toast.show { transform: translateX(0); }
            .toast-success { border-right-color: #2ecc71; }
            .toast-error { border-right-color: #ef4444; }
            .toast-warn { border-right-color: #f1c40f; }

            .toast i { font-size: 18px; }
            .toast-success i { color: #2ecc71; }
            .toast-error i { color: #ef4444; }
            .toast-warn i { color: #f1c40f; }
            .toast-info i { color: #006b98; }

            @media (max-width: 768px) {
                #toast-container { right: 20px; left: 20px; bottom: 20px; }
                .toast { min-width: auto; }
            }
        `;
        return style;
    }
}

customElements.define('site-toast', SiteToast);

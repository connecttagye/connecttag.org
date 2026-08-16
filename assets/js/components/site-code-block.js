/**
 * Connect Tag - Web Component: <site-code-block>
 * A professional code snippet display component with copy-to-clipboard functionality.
 */
class SiteCodeBlock extends HTMLElement {
  connectedCallback() {
    const language = this.getAttribute('language') || 'Code';
    const title = this.getAttribute('title') || '';
    const codeContent = this.innerHTML.trim();

    // Clear innerHTML to replace with shadow DOM-like structure (but light DOM for styles)
    this.innerHTML = `
      <div class="ct-code-wrapper">
        <div class="ct-code-header">
          <div class="ct-code-controls">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="ct-code-title">${title || language}</div>
          <button class="ct-copy-btn" title="نسخ الكود">
            <i class="fa-regular fa-copy"></i>
            <span class="copy-text">نسخ</span>
          </button>
        </div>
        <div class="ct-code-body">
          <pre><code class="language-${language.toLowerCase()}">${this.escapeHtml(codeContent)}</code></pre>
        </div>
      </div>
    `;

    // Add Copy Functionality
    const copyBtn = this.querySelector('.ct-copy-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeContent).then(() => {
        const icon = copyBtn.querySelector('i');
        const text = copyBtn.querySelector('.copy-text');

        icon.className = 'fa-solid fa-check';
        text.textContent = 'تم النسخ';
        copyBtn.classList.add('copied');

        setTimeout(() => {
          icon.className = 'fa-regular fa-copy';
          text.textContent = 'نسخ';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
}

customElements.define('site-code-block', SiteCodeBlock);

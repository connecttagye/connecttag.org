/**
 * Connect Tag - Web Component: <site-share-buttons>
 * Dynamic social sharing buttons for articles.
 */
class SiteShareButtons extends HTMLElement {
  connectedCallback() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = this.getAttribute('text') || document.title;

    this.innerHTML = `
      <div class="ct-share-container">
        <h4 class="ct-share-title">شارك :</h4>
        <div class="ct-share-grid">
          <a href="https://api.whatsapp.com/send?text=${title}%20${url}" target="_blank" rel="noopener" class="ct-share-btn whatsapp" title="مشاركة عبر واتساب">
            <i class="fa fa-whatsapp"></i>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener" class="ct-share-btn facebook" title="مشاركة عبر فيسبوك">
            <i class="fa fa-facebook"></i>
          </a>
          <a href="https://x.com/intent/tweet?text=${title}&url=${url}" target="_blank" rel="noopener" class="ct-share-btn twitter" title="مشاركة عبر X">
            <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://t.me/share/url?url=${url}&text=${title}" target="_blank" rel="noopener" class="ct-share-btn telegram" title="مشاركة عبر تليجرام">
            <i class="fa fa-paper-plane"></i>
          </a>
          <a href="https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}" target="_blank" rel="noopener" class="ct-share-btn linkedin" title="مشاركة عبر لينكد إن">
            <i class="fa fa-linkedin"></i>
          </a>
        </div>
      </div>
    `;
  }
}

customElements.define('site-share-buttons', SiteShareButtons);

/**
 * Connect Tag - Web Component: <site-share-buttons>
 * Dynamic social sharing buttons for articles.
 */
class SiteShareButtons extends HTMLElement {
  connectedCallback() {
    const url = window.location.href;
    const title = document.title;
    const text = this.getAttribute('text') || title;

    const isShareSupported = !!navigator.share;

    this.innerHTML = `
      <div class="ct-share-container">
        <h4 class="ct-share-title">شارك :</h4>
        <div class="ct-share-grid">
          ${isShareSupported ? `
            <a href="#" class="ct-share-btn native-share" title="مشاركة عبر الهاتف">
              <i class="fa-solid fa-share-nodes"></i>
            </a>
          ` : ''}
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}" target="_blank" rel="noopener" class="ct-share-btn whatsapp" title="مشاركة عبر واتساب">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" class="ct-share-btn facebook" title="مشاركة عبر فيسبوك">
            <i class="fa-brands fa-facebook"></i>
          </a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener" class="ct-share-btn telegram" title="مشاركة عبر تليجرام">
            <i class="fa-brands fa-telegram"></i>
          </a>
        </div>
      </div>
    `;

    // Add event listener for native share
    if (isShareSupported) {
      this.querySelector('.native-share').addEventListener('click', (e) => {
        e.preventDefault();
        navigator.share({
          title: title,
          text: text,
          url: url
        }).then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      });
    }
  }
}

customElements.define('site-share-buttons', SiteShareButtons);

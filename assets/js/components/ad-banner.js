/**
 * Connect Tag - Web Component: <ad-banner>
 * AdSense Policy Compliant Ad Container.
 * Features:
 * - Mandatory "إعلان / Sponsored" Label (Prevents accidental click violations)
 * - Reserved Aspect Ratio & Min-Height (Prevents CLS / layout shifts)
 * - Safe AdSense initialization & fallback display.
 */
class AdBanner extends HTMLElement {
  connectedCallback() {
    const client = this.getAttribute('data-ad-client') || 'ca-pub-XXXXXXXXXXXXXXXX'; // Replace with actual Publisher ID
    const slot = this.getAttribute('data-ad-slot') || '';
    const format = this.getAttribute('data-ad-format') || 'auto';
    const layout = this.getAttribute('data-ad-layout') || '';
    const type = this.getAttribute('type') || 'responsive'; // responsive, rectangle, leaderboard
    const labelText = this.getAttribute('label') || 'إعلان / Sponsored';

    const containerClass = `ct-ad-container ad-${type}`;

    this.innerHTML = `
      <div class="${containerClass}">
        <div class="ct-ad-label">${labelText}</div>
        <div class="ct-ad-slot-wrapper">
          ${slot ? `
            <ins class="adsbygoogle"
                 style="display:block; width:100%;"
                 data-ad-client="${client}"
                 data-ad-slot="${slot}"
                 data-ad-format="${format}"
                 ${layout ? `data-ad-layout="${layout}"` : ''}
                 data-full-width-responsive="true"></ins>
          ` : `
            <div class="ct-ad-placeholder">
              <i class="fa fa-bullhorn"></i>
              <span>مساحة إعلانية مخصصة - Ad Placement</span>
            </div>
          `}
        </div>
      </div>
    `;

    // Try executing AdSense script if slot exists
    if (slot && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push notice:', e);
      }
    }
  }
}

customElements.define('ad-banner', AdBanner);

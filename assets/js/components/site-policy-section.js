/**
 * Connect Tag - Web Component: <site-policy-section>
 */
class SitePolicySection extends HTMLElement {
  connectedCallback() {
    this.classList.add('ct-policy-content');
    // We don't modify innerHTML, just act as a styled container
  }
}

customElements.define('site-policy-section', SitePolicySection);

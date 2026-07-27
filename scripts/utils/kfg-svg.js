class KfgSvg extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._loaded = false;
  }
  static get observedAttributes() {
    return ['name', 'size', 'color'];
  }
  attributeChangedCallback() {
    if (this._loaded) this.loadSvg();
  }
  connectedCallback() {
    if (!this.shadowRoot.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = `:host { display: inline-flex; vertical-align: middle; }`;
      this.shadowRoot.appendChild(style);
    }
    if (!this._loaded) {
      this._loaded = true;
      this.loadSvg();
    }
  }
  async loadSvg() {
    const name = this.getAttribute('name');
    const size = this.getAttribute('size') || '24';
    const color = this.getAttribute('color');
    const existingStyle = this.shadowRoot.querySelector('style');
    this.shadowRoot.innerHTML = '';
    if (existingStyle) this.shadowRoot.appendChild(existingStyle);
    if (!name) return;
    try {
      const response = await fetch(`/svg/${name}.svg`);
      if (!response.ok) throw new Error('SVG not found');
      const svgText = await response.text();
      const wrapper = document.createElement('span');
      wrapper.innerHTML = svgText;
      wrapper.style.display = 'contents';
      const svgEl = wrapper.querySelector('svg');
      if (svgEl) {
        svgEl.style.display = 'block';
        svgEl.style.width = size + 'px';
        svgEl.style.height = size + 'px';
        if (color) {
          svgEl.style.color = color;
          svgEl.setAttribute('fill', 'currentColor');
        }
      }
      this.shadowRoot.appendChild(wrapper);
    } catch {
    }
  }
}
customElements.define('kfg-svg', KfgSvg);
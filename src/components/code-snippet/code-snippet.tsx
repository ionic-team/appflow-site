import { Component, Host, h, Prop, Element } from '@stencil/core';

@Component({
  tag: 'code-snippet',
  styleUrl: 'code-snippet.scss',
  shadow: true
})
export class CodeSnippet {
  @Element() el!: HTMLCodeSnippetElement;
  @Prop() language!: string;
  @Prop() code!: string;

  codeRef: HTMLElement | undefined;
  scriptEl: HTMLScriptElement | undefined;

  componentDidLoad() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/prismjs@latest/components/prism-' + this.language + '.js';
    script.async = true;
    script.addEventListener('load', () => {
      if (!this.codeRef) return;
      window.Prism.highlightElement(this.codeRef, false);
    });

    this.scriptEl = script;

    this.el.appendChild(script);
  }

  disconnectedCallback() {
    this.scriptEl?.parentNode?.removeChild(this.scriptEl);
  }

  render() {
    return (
      <Host>
        <pre><code class={`language-${this.language}`} ref={e => this.codeRef = e}>{this.code.trim()}</code></pre>
      </Host>
    );
  }

}

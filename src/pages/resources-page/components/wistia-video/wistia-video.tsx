import { Component, Host, h, Prop, Element, State, Listen } from '@stencil/core';

@Component({
  tag: 'wistia-video',
  styleUrl: 'wistia-video.scss',
  scoped: true
})
export class WistiaVideo {
  @Element() el?: HTMLElement;
  @Prop() videoId?: string;

  @State() width = 720;
  @State() height = 520;

  @Listen('resize', { target: 'window' })
  handleWindowResize() {
    window.requestAnimationFrame(() => this.resizeVideo());
  }

  componentDidLoad() {
    window.requestAnimationFrame(() => this.resizeVideo());
  }

  resizeVideo() {
    if (this.el) {
      const parent = this.el.parentElement;

      const width = parent?.offsetWidth;
      if (!width) {
        return;
      }

      this.width = width;
      this.height = width * (10 / 16);
    }
  }

  render() {
    const { videoId } = this;

    if (!videoId) {
      return null;
    }

    return (
      <Host>
        <script src="//fast.wistia.com/assets/external/E-v1.js" async></script>
        <div
          class={`wistia_embed wistia_async_${videoId}`}
          style={{
            width: `${this.width}px`,
            height: `${this.height}px`,
          }}>
          &nbsp;
        </div>
      </Host>
    );
  }
}

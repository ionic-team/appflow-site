
import { Component, Prop, h, Host } from '@stencil/core';

@Component({
  tag: 'site-backdrop',
  styleUrl: 'site-backdrop.scss',
  scoped: true
})
export class MoreButton {
  @Prop() visible = false;

  render() {
    return (
      <Host
        tabindex="-1"
        class={{
          'site-backdrop--visible': this.visible
        }}
      />
    );
  }
}
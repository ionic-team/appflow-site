import { Component, h, Element, State, Host } from '@stencil/core';
import { ResponsiveContainer, IntersectionHelper, Breadcrumbs, Breakpoint } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'blog-subnav',
  styleUrl: 'blog-subnav.scss',
  scoped: true
})
export class BlogPage {
  @Element() el?: HTMLElement;
  @State() sticky = false;
  @State() open = false;

  componentDidLoad() {
    IntersectionHelper.addListener(({ entries }) => {
      const e = entries.find((e) => (e.target as HTMLElement) === this.el);
      if (!e) {
        return;
      }

      if (e.intersectionRatio < 1) {
        this.sticky = true;
      } else {
        this.sticky = false;
      }
    });
    IntersectionHelper.observe(this.el!);
  }

  render = () => (
    <Host
      class={{
        'sticky': this.sticky,
      }}
    >
      <div class="subnav-wrapper">
        <ResponsiveContainer class="content">
          <Breadcrumbs onClick={() => window.scrollTo(0, 0)}>
            <slot></slot>
            <slot></slot>
          </Breadcrumbs>       
          <div class="blog-search-wrapper">
            <Breakpoint md={true}>
              <blog-search />
            </Breakpoint>
            <Breakpoint class="mobile" xs={true} md={false} display="flex">
              {this.open
              ? <ion-icon onClick={() => this.open = false} role="button" name="chevron-up-outline"></ion-icon>
              : <ion-icon onClick={() => this.open = true} role="button" name="chevron-down-outline"></ion-icon> }
            </Breakpoint>
          </div>
          <div
            class={{
              'subnav-dropdown': true,
              'open': this.open
            }}
          >
            <ResponsiveContainer>
              <blog-social-actions />
              <blog-search />
            </ResponsiveContainer>
          </div>
        </ResponsiveContainer>
      </div>
    </Host>
  )
}
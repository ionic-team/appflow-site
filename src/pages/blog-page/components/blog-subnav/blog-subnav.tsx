import { Component, h, Element, Prop, State, Host } from '@stencil/core';
import { ResponsiveContainer, IntersectionHelper, Breadcrumbs } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'blog-subnav',
  styleUrl: 'blog-subnav.scss',
  scoped: true
})
export class BlogPage {
  @Element() el?: HTMLElement;
  @Prop() renderContent?: () => any;
  @State() sticky = false;

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
      <ResponsiveContainer class="content">
        <Breadcrumbs>
          {this.renderContent && this.renderContent()}
        </Breadcrumbs>
        <input type="text" placeholder="Search the blog..."/>
      </ResponsiveContainer>
    </Host>
  )
}
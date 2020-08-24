import { Component, h, Element, State, Host, Prop } from '@stencil/core';
import { ResponsiveContainer, IntersectionHelper, Breadcrumbs, Breakpoint } from '@ionic-internal/ionic-ds';

import { href } from 'stencil-router-v2';
import Router from '../../../../router';


@Component({
  tag: 'blog-subnav',
  styleUrl: 'blog-subnav.scss',
  scoped: true
})
export class BlogSubnav {
  @Element() el?: HTMLElement;
  @State() sticky = false;
  @State() open = false;
  @Prop() breadcrumbs: [string, string][] = []
  @Prop() socialActions: boolean = false;
  @Prop() pagination: boolean = false;

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
            {this.breadcrumbs.map(crumb => (
              <li>
                <a class="ui-heading-5" {...href(`${crumb[1]}`, Router)}>{crumb[0]}</a>
              </li> 
            ))}          
          </Breadcrumbs>     
          <div class="blog-search-wrapper">
            <Breakpoint md={true}>
              <blog-search />
            </Breakpoint>
            <Breakpoint class="mobile" xs={true} md={false} display="flex">
              {this.open
              ? <ion-icon
                  onClick={() => this.open = false}
                  class="drawer-button"
                  role="button" aria-label="close drawer"
                  name="chevron-up-outline"
                ></ion-icon>
              : <ion-icon
                  onClick={() => this.open = true}
                  class="drawer-button"
                  role="button" aria-label="open drawer"
                  name="chevron-down-outline"
                ></ion-icon> }
            </Breakpoint>
          </div>
          <div
            class={{
              'subnav-dropdown': true,
              'open': this.open
            }}
          >
            <ResponsiveContainer>
              <blog-search />
              {this.socialActions
              ? <blog-social-actions /> : ''}
              {this.pagination
              ? <blog-pagination linkText={['Older', 'Newer']}/> : ''}
            </ResponsiveContainer>
          </div>
        </ResponsiveContainer>
      </div>
    </Host>
  )
}
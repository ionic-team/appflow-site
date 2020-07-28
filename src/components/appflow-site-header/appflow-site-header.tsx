import { Component, Element, State, h, VNode, Host } from '@stencil/core';
import { ResponsiveContainer, IntersectionHelper } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';

import Router from '../../router';
// import state from '../../store';


@Component({
  tag: 'appflow-site-header',
  styleUrl: 'appflow-site-header.scss',
  scoped: true
})
export class SiteHeader {
  @Element() el: HTMLElement;

  @State() expanded = false;

  @State() sticky = false;

  // Hovered nav items
  @State() forceHovered: string | null = null;
  @State() hovered: string | null = null;

  async componentWillLoad() {
    // Figure out if we should force hover a nav item
    this.forceHovered = Router.activePath.replace('/', '').replace('#', '');

    Router.onChange('activePath', (v: any) => {
      // TODO: Make this an object and share it w/ render
      if (['/#features', '/docs', '/blog', '/enterprise', '/community'].findIndex(x => x === v) >= 0) {
        this.forceHovered = v.replace('/', '').replace('#', '');
      }
    });

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

  setHovered = (h: string) => () => this.hovered = h;

  clearHover = () => this.hovered = null;

  toggleExpanded = () => this.expanded = !this.expanded;

  render() {
    const { clearHover, expanded, forceHovered, hovered, sticky } = this;

    return (
      <Host class={{
        'site-header--sticky': sticky,
        'site-header--expanded': expanded
      }}>
        <site-backdrop visible={expanded} onClick={() => this.toggleExpanded()} />

        <ResponsiveContainer class="site-header">
          <a {...href('/')} class="site-header__logo-link">
            <svg width="114" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M43.882 6.392v11.781h-2.994v-1.439c-.754 1.08-2.102 1.709-3.793 1.709-3.474 0-5.508-2.743-5.508-6.16 0-3.418 2.034-6.16 5.508-6.16 1.69 0 3.039.629 3.793 1.708V6.392h2.994zm-6.102 2.54c-1.805 0-2.948 1.44-2.948 3.35 0 1.912 1.143 3.35 2.948 3.35 1.806 0 2.948-1.438 2.948-3.35 0-1.91-1.142-3.35-2.948-3.35zM48.446 22.528H45.2V6.392h2.993v1.44c.755-1.08 2.103-1.71 3.794-1.71 3.474 0 5.507 2.743 5.507 6.16 0 3.418-2.033 6.16-5.507 6.16-1.691 0-2.925-.718-3.542-1.528v5.614zm2.856-6.895c1.806 0 2.948-1.44 2.948-3.35 0-1.911-1.142-3.35-2.948-3.35-1.805 0-2.947 1.439-2.947 3.35 0 1.91 1.142 3.35 2.947 3.35zM61.759 22.528h-3.245V6.392h2.993v1.44c.755-1.08 2.103-1.71 3.794-1.71 3.474 0 5.507 2.743 5.507 6.16 0 3.418-2.034 6.16-5.507 6.16-1.691 0-2.925-.718-3.542-1.528v5.614zm2.856-6.895c1.806 0 2.948-1.44 2.948-3.35 0-1.911-1.142-3.35-2.948-3.35-1.805 0-2.947 1.439-2.947 3.35 0 1.91 1.142 3.35 2.947 3.35zM81.363 1.472h-3.245v16.701h3.245V1.472zM75.02 5.541c0-.99.584-1.304 1.361-1.304.366 0 .748.023.748.023V1.517s-.715-.045-1.287-.045c-2.422 0-4.067 1.304-4.067 4.136v12.565h3.245V8.91h2.177V6.392H75.02v-.851zM82.305 12.283c0-3.35 2.445-6.16 6.285-6.16 3.839 0 6.284 2.81 6.284 6.16s-2.445 6.16-6.284 6.16c-3.84 0-6.285-2.81-6.285-6.16zm6.285 3.35c1.713 0 3.039-1.237 3.039-3.35 0-2.114-1.326-3.35-3.04-3.35-1.713 0-3.039 1.236-3.039 3.35 0 2.113 1.326 3.35 3.04 3.35zM103.816 10.889h-.045l-2.445 7.284h-3.04l-4.182-11.78h3.36l2.4 7.756 2.467-7.757h2.925l2.491 7.802 2.422-7.802h3.291l-4.182 11.781h-3.039l-2.423-7.284z"
                fill="#001A3A" />
              <ellipse cx="13.764" cy="16.755" rx="2.99" ry="2.943" fill="#4F68FF" />
              <path d="M26.988 24L16.823 0h-6.099L20.89 24h6.099z" fill="#4F68FF" />
              <path opacity=".2" d="M14.854 9.75L16.824 0h-6.1l2.541 6 1.271 3 .159.375.159.375z" fill="#000" />
              <path d="M.54 24L10.705 0h6.098L6.64 24H.54z" fill="#639CFF" />
            </svg>
          </a>

          <button onClick={() => this.toggleExpanded()} class="more-button">
            <ion-icon icon="ellipsis-vertical" />
          </button>

          <div class="site-header-links">
            <div class={{
              'site-header-links__menu': true,
              'site-header-links__menu--hovered': !!hovered || !!forceHovered
            }}>
              <nav>
                <NavLink
                  path="/#features"
                  hovered={(hovered || forceHovered) === 'features'}
                  onHover={this.setHovered('features')}
                  onExit={clearHover}>
                  Product
                </NavLink>
                <NavLink
                  path="/docs"
                  hovered={hovered === 'docs'}
                  onHover={this.setHovered('docs')}
                  onExit={clearHover}>
                  Why Appflow
                </NavLink>
                <NavLink
                  path="/community"
                  hovered={hovered === 'community' || forceHovered === 'community'}
                  onHover={this.setHovered('community')}
                  onExit={clearHover}>
                  Resources
                </NavLink>
                <NavLink
                  path="/blog"
                  hovered={hovered === 'blog'}
                  onHover={this.setHovered('blog')}
                  onExit={clearHover}>
                  Pricing
                </NavLink>
                <a
                  href="https://ionicframework.com/native"
                  target="_blank"
                  onMouseOver={this.setHovered('enterprise')}
                  onMouseOut={clearHover}
                  class={{
                    'link--hovered': hovered === 'enterprise'
                  }}>
                  Docs
                </a>
              </nav>
            </div>

            <div class="site-header-links__buttons">
              <ul>
                <li><button class="button--plain">Log in</button></li>
                <li><button class="button--shaded">Get started <span style={{'letter-spacing': '0px'}}>-&gt;</span></button></li>
              </ul>
            </div>
          </div>
        </ResponsiveContainer>
      </Host>
    );
  }
}

interface NavLinkProps {
  hovered: boolean;
  path: string;
  onHover: () => void;
  onExit: () => void;
}

const NavLink = ({ path, hovered, onHover, onExit }: NavLinkProps, children: VNode) => {
  // Detect active if path equals the route path or the current active path plus
  // the route hash equals the path, to support links like /#features
  const active = Router.activePath === path ||
                 Router.activePath + Router.url.hash === path;

  return (
    <a
      {...href(path)}
      onMouseOver={onHover}
      onMouseOut={onExit}
      class={{
      'link--active': active,
      'link--hovered': hovered
    }}>
      {children}
    </a>
  )
}

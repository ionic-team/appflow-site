import { Component, Element, State, h, VNode, Host } from '@stencil/core';
import { ResponsiveContainer, IntersectionHelper } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';

import { appflowLogoWithText } from '../../svgs';

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
      if (['/', '/docs', '/why-appflow', '/resources', '/pricing', '/docs'].findIndex(x => x === v) >= 0) {
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
            {appflowLogoWithText({}, {width: 114, height: 24 })}
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
                  path="/"
                  hovered={(hovered || forceHovered) === 'features'}
                  onHover={this.setHovered('product')}
                  onExit={clearHover}>
                  Product
                </NavLink>
                <NavLink
                  path="/why-appflow"
                  hovered={hovered === 'docs'}
                  onHover={this.setHovered('why-appflow')}
                  onExit={clearHover}>
                  Why Appflow
                </NavLink>
                <NavLink
                  path="/resources"
                  hovered={hovered === 'community' || forceHovered === 'community'}
                  onHover={this.setHovered('resources')}
                  onExit={clearHover}>
                  Resources
                </NavLink>
                <NavLink
                  path="/pricing"
                  hovered={hovered === 'blog'}
                  onHover={this.setHovered('pricing')}
                  onExit={clearHover}>
                  Pricing
                </NavLink>
                <a
                  href="/docs"
                  target="_blank"
                  onMouseOver={this.setHovered('docs')}
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

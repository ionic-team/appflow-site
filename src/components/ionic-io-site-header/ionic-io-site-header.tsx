import { Component, Element, State, h, VNode } from '@stencil/core';
import { ResponsiveContainer, Button, AnchorButton } from '@ionic-internal/sites-shared';
import { href } from 'stencil-router-v2';

import Router from '../../router';
import state from '../../store';

const formatNumber = (n) => {
  if (n > 1000) {
    return (n / 1000).toFixed(1) + 'K';
  }

  return n;
}

@Component({
  tag: 'ionic-io-site-header',
  styleUrl: 'ionic-io-site-header.scss',
  scoped: true
})
export class SiteHeader {
  @Element() el: Element;

  @State() isMobileMenuShown: boolean;
  @State() isDropdownShown: boolean;
  @State() isScrolled = false;

  @State() starCount?: number;

  async componentWillLoad() {
    try {
      const ret = await fetch("https://api.github.com/repos/ionic-team/capacitor")

      const json = await ret.json();

      this.starCount = formatNumber(json.stargazers_count);
    } catch (e) {
      console.error('Unable to get stars', e);
    }
  }

  handleDropdownEnter () {
    this.isDropdownShown = true;
  }

  handleDropdownLeave () {
    this.isDropdownShown = false;
  }

  render() {
    return (
      <ResponsiveContainer class="site-header">
        <a {...href('/')} class="site-header__logo-link">
          {state.pageTheme === 'dark' ? (
            <img src="/assets/img/heading/logo-white.png" alt="Capacitor Logo" />
          ) : (
            <img src="/assets/img/heading/logo-black.png" alt="Capacitor Logo" />
          )}
        </a>

        <div class="site-header__menu">
          <NavLink path="/#features">
            Features
          </NavLink>
          <NavLink path="/docs">
            Docs
          </NavLink>
          <NavLink path="/community">
            Community
          </NavLink>
          <NavLink path="/blog">
            Blog
          </NavLink>
          <NavLink path="/enterprise">
            Enterprise
          </NavLink>
        </div>

        <div class="site-header__buttons">
          <AnchorButton href="https://github.com/ionic-team/capacitor" class="site-header__buttons__github">
            <ion-icon name="logo-github" />
            {this.starCount ? this.starCount : 'GitHub'}
          </AnchorButton>
          <Button class="site-header__buttons__install">
            Install
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }
}

const NavLink = ({ path }: { path: string }, children: VNode) => {
  // Detect active if path equals the route path or the current active path plus
  // the route hash equals the path, to support links like /#features
  const active = Router.activePath === path ||
                 Router.activePath + Router.url.hash === path;

  return (
    <a {...href(path)} class={{
      'link--active': active
    }}>
      {children}
    </a>
  )
}

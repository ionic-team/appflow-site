import { Component, Element, State, h, Host } from '@stencil/core';
import { ResponsiveContainer } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';
import state from '../../store';

import { appflowLogoWithText } from '../../svgs';

import Router from '../../router';


@Component({
  tag: 'appflow-site-header',
  styleUrl: 'appflow-site-header.scss',
  scoped: true
})
export class SiteHeader {
  @Element() el: HTMLElement;

  @State() expanded = false;

  // Hovered nav items
  @State() forceHovered: string | null = null;
  @State() hovered: string | null = null;

  async componentWillLoad() {
    // Figure out if we should force hover a nav item
    this.forceHovered = Router.activePath.replace('/', '').replace('#', '');

    Router.onChange('activePath', (v: any) => {
      // TODO: Make this an object and share it w/ render
      if (['/', '/docs', '/why-appflow', '/resources', '/pricing', '/docs', '/blog'].findIndex(x => x === v) >= 0) {
        this.forceHovered = v.replace('/', '').replace('#', '');
      }
    });
  }

  setHovered = (h: string) => () => this.hovered = h;

  clearHover = () => this.hovered = null;

  toggleExpanded = (top: boolean) => {
    this.expanded = !this.expanded;
    if (top) window.scrollTo(0, 0);
    //TODO P3 lock in scroll when mobile menu is expanded
    // this.expanded ? document.body.style.overflowY = 'hidden' : document.body.style.overflowY = 'visible'
  }

  handleActive = (e: HTMLAnchorElement) => {
    const hrefParts = e.href.split('/');
    if (hrefParts.length < 4) return;    

    const { hash, href } = Router.url;
    const urlParts = href.replace(hash, '').split('/');
    if (urlParts.length < 4) return;  

    if (hrefParts[3] === urlParts[3]) {
      return e.classList.add('active');
    }

    e.classList.remove('active');
  }

  render() {
    const { expanded, toggleExpanded, handleActive } = this;

    return (
      <Host class={{
        'sticky': state.stickyHeader,
        'expanded': expanded
      }}>
        <header>
          <site-backdrop visible={expanded} onClick={() => toggleExpanded(false)} />

          <ResponsiveContainer class="site-header">
            <a {...href('/')} class="site-header__logo-link">
              {appflowLogoWithText({}, {width: 114, height: 24 })}
            </a>

            <button onClick={() => toggleExpanded(false)} class="more-button">
              <ion-icon icon="ellipsis-vertical" />
            </button>

            <div
              class= {{
                'site-header-links': true,
                'site-header-links--expanded': expanded
              }}
            >
              <div class="nav__wrapper">
                <nav onClick={() => toggleExpanded(true)}>
                  <a
                    {...href('/')}
                    ref={e => handleActive(e)}
                  >
                    Product
                  </a>
                  <a
                    {...href('/why-appflow')}
                    ref={e => handleActive(e)}
                  >                    
                    Why Appflow
                  </a>
                  {/* <NavLink
                    path="/resources">
                    Resources
                  </NavLink> */}
                  <a
                    {...href('/pricing')}
                    ref={e => handleActive(e)}
                  >
                    Pricing
                  </a>
                  <a
                    href="https://ionicframework.com/docs/appflow"
                    ref={e => handleActive(e)}
                    target="_blank"
                  >
                    Docs
                  </a>
                  <a
                    {...href('/blog')}
                    ref={e => handleActive(e)}
                  >
                    Blog
                  </a>
                </nav>
              </div>

              <div class="site-header-links__buttons">
                <ul>
                  <li>
                    <a href="https://ionicframework.com/login?source=appflow-site&product=appflow">Log in</a>
                  </li>
                  <li>
                    <a class="button" href="https://ionicframework.com/signup?source=appflow-site&product=appflow">Get started <span style={{'letter-spacing': '0px'}}>-&gt;</span></a>
                  </li>
                </ul>
              </div>
            </div>
          </ResponsiveContainer>
        </header>
      </Host>
    );
  }
}
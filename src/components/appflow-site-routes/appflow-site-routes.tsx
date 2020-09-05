import { Component, Host, h } from '@stencil/core';

import {
  Route, match, 
  // match 
} from 'stencil-router-v2';

import { InternalRouterState } from 'stencil-router-v2/dist/types';

import state from '../../store';
import Router from '../../router';

@Component({
  tag: 'appflow-site-routes',
  styleUrl: 'appflow-site-routes.css',
})
export class AppflowSiteRoutes {

  componentWillLoad() {
    Router.onChange('url', (newValue: InternalRouterState['url'], _oldValue: InternalRouterState['url']) => {
      (window as any).gtag('config', 'UA-44023830-42', { 'page_path': newValue.pathname + newValue.search });
      state.pageTheme = 'light';
      state.stickyHeader = true;
    });
  }

  render() {
    return (
      <Host>
        <Router.Switch>
          <Route path={match('/', { exact: true })}>
            <landing-page />
          </Route>
          
          <Route
            path={match('/blog', { exact: true })}
          >
            <blog-page viewMode="previews"/>
          </Route>

          <Route
            path={match('/blog/:slug')}
            render={({ slug }) => <blog-page slug={slug} viewMode="detail" />}
          />

          <Route path="/why-appflow">
            <why-appflow />
          </Route>

          <Route path="/resources">
            <resources-page />
          </Route>
          <Route
            path={match('/resources/:id')}
            render={({ id }) => <resources-page prismicUid={id} />}
          />

          <Route path="/pricing">
            <pricing-page />
          </Route>

          <Route path="/privacy-policy">
            <markdown-page file="privacy-policy" />
          </Route>

          <Route path="/tos">
            <markdown-page file="tos" />
          </Route>
        </Router.Switch>
      </Host>
    );
  }

}

import { Component, h } from '@stencil/core';

import state from '../../store';
import Helmet from '@stencil/helmet';
import router from '../../router'

@Component({
  tag: 'appflow-site',
  styleUrl: 'appflow-site.scss'
})
export class App {  

  render() {
    return (
      <site-root class={`page-theme--${state.pageTheme}`}>
        <MetaHead/>
        <appflow-site-header></appflow-site-header>

        <main>
          <appflow-site-routes />
        </main>

        <appflow-site-footer></appflow-site-footer>
      </site-root>
    );
  }
}

const MetaHead = () => {
  return (
    <Helmet>
      {console.log(state)}
      <title>{state.title}</title>
      <meta
        name="description"
        content={state.description}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@useappflow" />
      <meta name="twitter:creator" content="appflow" />
      <meta name="twitter:title" content={state.title} />
      <meta name="twitter:description" content={state.description} />

      <meta name="twitter:image" content={state.meta_image}/>

      <meta property="fb:page_id" content="1321836767955949" />
      {/* <meta property="og:url" content="https://ionicframework.com/resources" /> */}
      {/* <meta property="og:type" content="article" /> */}
      <meta property="og:title" content={state.title} />

      <meta property="og:image" content={router.url.origin + state.meta_image} />
      <meta property="og:description" content={state.description} />
      <meta property="og:site_name" content="Appflow" />
      <meta property="article:publisher" content="https://www.facebook.com/ionicframework" />
      <meta property="og:locale" content="en_US" />
    </Helmet>
  );
}
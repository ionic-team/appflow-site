import { Component, h } from '@stencil/core';

import state from '../../store';
import Helmet from '@stencil/helmet';

@Component({
  tag: 'ionic-io-site',
  styleUrl: 'ionic-io-site.scss'
})
export class App {  

  render() {
    return (
      <site-root class={`page-theme--${state.pageTheme}`}>
        <MetaHead/>
        <ionic-io-site-routes />
      </site-root>      
    );
  }
}

const MetaHead = () => {
  return (
    <Helmet>
      <title>{state.title}</title>
      <meta
        name="description"
        content={state.description}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ionicframework" />
      <meta name="twitter:creator" content="ionicframework" />
      <meta name="twitter:title" content={state.title} />
      <meta name="twitter:description" content={state.description} />

      <meta name="twitter:image" content={state.meta_image}/>

      <meta property="fb:page_id" content="1321836767955949" />
      {/* <meta property="og:url" content="https://ionicframework.com/resources" /> */}
      {/* <meta property="og:type" content="article" /> */}
      <meta property="og:title" content={state.title} />

      <meta property="og:image" content={state.meta_image} />
      <meta property="og:description" content={state.description} />
      <meta property="og:site_name" content="Ionic" />
      <meta property="article:publisher" content="https://www.facebook.com/ionicframework" />
      <meta property="og:locale" content="en_US" />
    </Helmet>
  );
}
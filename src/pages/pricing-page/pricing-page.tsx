import { Component, Host, h, getAssetPath} from '@stencil/core';

import { ResponsiveContainer, PrismicRichText } from '@ionic-internal/ionic-ds';
import {  } from '../../svgs';
import { getPage } from '../../prismic';
import state from '../../store';



@Component({
  tag: 'pricing-page',
  styleUrl: 'pricing-page.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class PricingPage {
  
  async componentWillLoad() {
    await getPage('appflow_pricing');
  }

  render = () => (
    <Host>
      <header>
        <appflow-site-header></appflow-site-header>
      </header>

      <main>
        <Top />
        <Tiers />
      </main>

      <footer>
        <appflow-site-footer></appflow-site-footer>
      </footer>
    </Host>
  )
}

const Top = () => {
  const { top } = state.pageData;

  return (
    <ResponsiveContainer id="top" as="section">
      <div class="heading-group">
        <PrismicRichText richText={top} paragraphLevel={2}/>       
      </div> 
    </ResponsiveContainer>
  );
}


const Tiers = () => {
  return (
    <ResponsiveContainer id="tiers" as="section">
      <site-modal></site-modal>

      <plan-pricing></plan-pricing>

      <a class="anchor-cta anchor" href="#features">
        See full feature comparison
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L6 6L1 11" stroke="#639CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

      </a>
    </ResponsiveContainer>
  );
}
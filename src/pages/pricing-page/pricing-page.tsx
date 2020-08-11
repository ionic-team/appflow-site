import { Component, Host, h } from '@stencil/core';

import { ResponsiveContainer, PrismicRichText, Heading} from '@ionic-internal/ionic-ds';
import { getPage } from '../../prismic';
import state from '../../store';
import { aaaLogo, amtrakLogo, nasaLogo, ibmLogo, burgerKingLogo, catLogo, targetLogo } from '../../svgs';



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
        <Companies />
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
      <plan-pricing></plan-pricing>
    </ResponsiveContainer>
  );
}

const Companies = () => {
  return (
    <ResponsiveContainer id="companies" as="section">
      <Heading level={6}>Trusted by the world’s best teams</Heading>
      <div class="logos">
        <div class="wrapper">
          {aaaLogo({ main: 'var(--c-indigo-60)' }, { width: 50, height: 30 })}
          {amtrakLogo({ main: 'var(--c-indigo-60)' }, { width: 63.78, height: 26.25 })}
          {nasaLogo({ main: 'var(--c-indigo-60)' }, { width: 71.29, height: 18.75 })}
          {ibmLogo({ main: 'var(--c-indigo-60)' }, { width: 52.53, height: 21.56 })}
        </div>
        <div class="wrapper">
          {burgerKingLogo({ main: 'var(--c-indigo-60)', second: 'var(--c-indigo-60)', third: 'var(--c-indigo-60)' }, { width: 30.32, height: 32 })}
          {catLogo({ main: 'var(--c-indigo-60)', second: 'var(--c-indigo-60)' }, { width: 41.27, height: 24.38 })}
          {targetLogo({ main: 'var(--c-indigo-60)' }, { width: 32, height: 32 })}
        </div>
      </div>
    </ResponsiveContainer>
  );
}
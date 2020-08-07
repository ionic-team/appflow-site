import { Component, Host, h, getAssetPath} from '@stencil/core';

import { ResponsiveContainer, PrismicRichText} from '@ionic-internal/ionic-ds';
import {  } from '../../svgs';
import { getPage } from '../../prismic';
import state from '../../store';



@Component({
  tag: 'why-appflow',
  styleUrl: 'why-appflow.scss',
  assetsDirs: ['img-why-appflow']
})
export class WhyAppflow {
  
  async componentWillLoad() {
    await getPage('appflow_why_appflow');
  }

  render = () => (
    <Host>
      <header>
        <appflow-site-header></appflow-site-header>
      </header>

      <main>
        <Top />
        <Companies />
        {/* <Benefits />
        <Delivery />
        <Problems />
        <Different /> */}
      </main>

      <footer>
        <appflow-site-footer></appflow-site-footer>
      </footer>
    </Host>
  )
}

const Top = () => {
  const { top, top__cta } = state.pageData;

  return (
    <section id="top">
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={top} paragraphLevel={2}/>
          <a href="#">{top__cta}</a>
        </div>      
        <div class="image">
          <img
            src={getAssetPath('./img-why-appflow/top@2x.png')}
            srcset={`${getAssetPath('./img-why-appflow/top@2x.png')} 2x,
                    ${getAssetPath('./img-why-appflow/top.png')} 1x`}
            loading="eager"
            width="1024" height="1328"
          />
        </div>         
      </ResponsiveContainer>
    </section>
  );
}

const Companies = () => {
  // const { top, top__cta } = state.pageData;

  const icons = [['bcbs', 128, 24], ['nhs', 56, 24], ['target', 116, 26], ['amtrak', 180, 22],
  ['supr-daily', 68, 32], ['study-com', 153, 24], ['caterpillar', 138, 22], ['norfolk-southern', 96, 24]]

  return (
    <ResponsiveContainer id="companies" as="section">
      <div class="row row1">
        {icons.slice(0,4).map(item => (
          <img
          src={getAssetPath(`./img-why-appflow/logo-${item[0]}@2x.png`)} 
          srcset={`${getAssetPath(`./img-why-appflow/logo-${item[0]}.png`)} 1x,
                   ${getAssetPath(`./img-why-appflow/logo-${item[0]}@2x.png`)} 2x`}
          loading="lazy"
          width={item[1]} height={item[2]}
        /> ))}
      </div>
      <div class="row row2">
        {icons.slice(4,8).map(item => (
          <img
          src={getAssetPath(`./img-why-appflow/logo-${item[0]}@2x.png`)} 
          srcset={`${getAssetPath(`./img-why-appflow/logo-${item[0]}.png`)} 1x,
                   ${getAssetPath(`./img-why-appflow/logo-${item[0]}@2x.png`)} 2x`}
          loading="lazy"
          width={item[1]} height={item[2]}
        /> ))}
      </div>
        

        

    </ResponsiveContainer>
  );
}


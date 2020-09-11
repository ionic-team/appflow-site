import { Component, Host, h, getAssetPath} from '@stencil/core';

import { ResponsiveContainer, PrismicRichText, Grid, Col, Heading } from '@ionic-internal/ionic-ds';
import { getPage } from '../../global/utils/prismic/prismic';
import state from '../../store';



@Component({
  tag: 'why-appflow',
  styleUrl: 'why-appflow.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class WhyAppflow {
  
  async componentWillLoad() {
    await getPage('appflow_why_appflow');
  }

  render() {
    return (
      <Host>
        <Top />
        <Companies />
        <Benefits />
        <Integrated />
        <Problems />
        <Different />
        <get-started-section />
      </Host>
    )
  }
}

const Top = () => {
  const { top, top__cta } = state.pageData;

  return (
    <section id="top">
      <ResponsiveContainer>
        <Grid>
          <Col class="heading-group" cols={12} sm={6}>
            <PrismicRichText richText={top} paragraphLevel={2}/>
            <a class="cta button" href="https://ionicframework.com/signup?source=framework-products&product=appflow">{top__cta}</a>
          </Col>
          <Col class="image" cols={12} sm={6}>
            <img
              src={getAssetPath('./assets/top@2x.png')}
              srcset={`${getAssetPath('./assets/top@2x.png')} 2x,
                      ${getAssetPath('./assets/top.png')} 1x`}
              loading="eager"
              width="1024" height="1328"
              alt="tiple stack of icons with appflow in the middle"
            />          
          </Col>
        </Grid>            
      </ResponsiveContainer>
    </section>
  );
}

const Companies = () => {
  const icons: [string, number, number][] = [    
    ['bcbs', 128, 24],
    ['nhs', 56, 24],
    ['target', 116, 26],
    ['amtrak', 180, 22],    
    ['supr-daily', 68, 32],
    ['study-com', 153, 24],
    ['caterpillar', 138, 22],
    ['norfolk-southern', 96, 24]
  ]

  const iconFactory = (item: typeof icons[0]) => (
    <img
      src={getAssetPath(`./assets/logo-${item[0]}@2x.png`)} 
      srcset={`${getAssetPath(`./assets/logo-${item[0]}.png`)} 1x,
              ${getAssetPath(`./assets/logo-${item[0]}@2x.png`)} 2x`}
      loading="lazy"
      width={item[1]} height={item[2]}
      alt={`${item[0]} logo`}
    />
  )

  return (
    <ResponsiveContainer id="companies" as="section">
      <Grid>
        {icons.map(icon => (
          <Col class="wrapper" cols={6} xs={3}>
            {iconFactory(icon)}
          </Col>
        ))}
      </Grid>
    </ResponsiveContainer>
  );
}

const Benefits = () => {
  const { benefits, benefits__subtext, benefits__list } = state.pageData;

  return (
    <section id="benefits">
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={benefits} paragraphLevel={2}/>  
        </div>        
        <div class="subtext">
          <PrismicRichText richText={benefits__subtext} />
        </div> 
        <Grid class="list">
          {benefits__list.map(({ content }: { content: any}) => (
            <Col class="list-item" cols={12} sm={4}>
              <PrismicRichText richText={content}/>
            </Col>
          ))}
        </Grid>
      </ResponsiveContainer>
    </section>
  );
}

const Integrated = () => {
  const { integrated, integrated__list } = state.pageData;

  const icons = [
    ['wrench-gear', 96, 96],
    ['floating-cube', 88, 96],
    ['spinning-gear', 96, 98],
    ['integration', 96, 96],
    ['venn-diagram', 102, 102],
    ['downward-triangles', 96, 98],
    ['two-way-arrow', 96, 96],
    ['signal-bars', 96, 96]
  ]

  return (
    <ResponsiveContainer id="integrated" as="section">
      <div class="heading-group">
        <PrismicRichText richText={integrated}/>  
      </div>        

      <Grid class="list">
        {integrated__list.map(({ content }: { content: any }, i: number) => (
          <Col class="list-item" xs={6} sm={6} md={4} lg={3}>
            <img
              src={getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 
              srcset={`${getAssetPath(`./assets/icon-${icons[i][0]}.png`)} 1x,
                      ${getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 2x`}
              loading="lazy"
              width={icons[i][1]} height={icons[i][2]}
              alt={`${icons[0]} icon`}
            />
            <PrismicRichText richText={content} paragraphLevel={4}/>
          </Col>
        ))}
      </Grid>
    </ResponsiveContainer>
  );
}

const Problems = () => {
  const { problems, problems__list } = state.pageData;

  const icons = [
    ['double-server', 128, 128],
    ['window', 128, 128],
    ['apple-cloud', 128, 128],
    ['pipeline', 128, 128],
    ['lightning', 128, 128],
  ]

  return (
    <section id="problems">
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={problems}/>  
        </div>        

        <ul class="list">
          {problems__list.map(({ content }: { content: any }, i: number) => (
            <li class="list-item">
              <Grid>
                <Col xs={12} md={1}>
                  <img
                    src={getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 
                    srcset={`${getAssetPath(`./assets/icon-${icons[i][0]}.png`)} 1x,
                            ${getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 2x`}
                    loading="lazy"
                    width={icons[i][1]} height={icons[i][2]}
                    alt={`${icons[0]} icon`}
                  />
                </Col>
                <Col xs={6} md={4}>
                  <Heading level={content[0].type.slice(-1)}>{content[0].text}</Heading>
                </Col>
                <Col xs={12} md={7} class="paragraphs">
                  <PrismicRichText richText={content.slice(1)}/>
                </Col>
              </Grid>              
            </li>
          ))}
        </ul>
      </ResponsiveContainer>
    </section>
  );
}

const Different = () => {
  const { different, different__list } = state.pageData;

  const icons = [
    ['lightbulb-head', 324, 324],
    ['square-target', 325, 324],
    ['infinity-circle', 432, 321],
  ]

  return (
    <section id="different">
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={different}/>  
        </div>
        <Grid class="list">
        {different__list.map(({ content }: { content: any }, i: number) => (
          <Col class="list-item" cols={12} sm={6} md={4}>
            <img
              src={getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 
              srcset={`${getAssetPath(`./assets/icon-${icons[i][0]}.png`)} 1x,
                      ${getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 2x`}
              loading="lazy"
              width={icons[i][1]} height={icons[i][2]}
              alt={`${icons[0]} icon`}
            />
            <PrismicRichText richText={content}/>
          </Col>
        ))}
      </Grid>
      </ResponsiveContainer>
    </section>
  );
}

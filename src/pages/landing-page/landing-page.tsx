import { Component, Host, h} from '@stencil/core';

import { ResponsiveContainer, Paragraph, PrismicRichText, Heading, Skeleton, Grid, Col } from '@ionic-internal/ionic-ds';
import { aaaLogo, amtrakLogo, nasaLogo, burgerKingLogo, catLogo, targetLogo, ibmLogo, triplePhoneIcon, tripleLayerIcon,
         buildingBlocksIcon, publishingIcon, appleCloudIcon, appleStoreCheckedIcon, testflightLogo,
         googleStoreCheckedIcon, checkmarkCircle, cloudCircleIcon } from '../../svgs';
import { getPage } from '../../prismic';
import state from '../../store';



@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss',
})
export class LandingPage {
  
  async componentWillLoad() {
    await getPage('appflow_homepage');
  }

  render = () => (
    <Host>
      <header>
        <appflow-site-header></appflow-site-header>
      </header>

      <main>
        <Top />
        <Companies />
        <Ship />
        <Push />
        <Live />
        <Native />
        <Automate />
        <Managed />
        <Experience />
        <GetStarted />
      </main>

      <footer>

      </footer>
    </Host>
  )
}

const Top = () => {
  const { top, top__cta } = state.pageData;

  return (
    <section id="top">
      <svg class="background" viewBox="0 0 1600 992" xmlns="http://www.w3.org/2000/svg">
        <rect width="1600" height="992" fill="url(#landing_bg_paint1_linear)" />

        <path d="M1298.04 97.309L1494.1 970.579L1066.48 878.169L859.254 53.3663L1298.04 97.309Z"
          fill="url(#landing_bg_paint3_linear)" fill-opacity="0.12" />
        <path d="M1665.55 102.568L1760.72 1044.29L1304.71 873.559L1209.54 -68.1665L1665.55 102.568Z"
          fill="url(#landing_bg_paint4_linear)" fill-opacity="0.08" />
        <path d="M996.453 199.416L1325.18 982.749L887.983 955.103L559.252 171.77L996.453 199.416Z"
          fill="url(#landing_bg_paint5_linear)" fill-opacity="0.1" />
        <path d="M753.376 310.796L1135.39 1073.31L690.115 1071.58L308.1 309.07L753.376 310.796Z"
          fill="url(#landing_bg_paint6_linear)" fill-opacity="0.1" />
        <path d="M555.833 445.941L991.857 1178.91L547.616 1209.31L111.592 476.339L555.833 445.941Z"
          fill="url(#landing_bg_paint7_linear)" fill-opacity="0.1" />
        <path d="M389.921 598.053L857.694 1311.18L415.215 1361.05L-52.5576 647.919L389.921 598.053Z"
          fill="url(#landing_bg_paint8_linear)" fill-opacity="0.1" />
        <path d="M244.912 756.619L712.685 1469.75L270.206 1519.61L-197.567 806.485L244.912 756.619Z"
          fill="url(#landing_bg_paint9_linear)" fill-opacity="0.1" />
        <defs>
          <linearGradient id="landing_bg_paint1_linear" x1="0" y1="496" x2="1600" y2="496" gradientUnits="userSpaceOnUse">
            <stop stop-color="#634CF2" />
            <stop offset="1" stop-color="#67A5F8" />
          </linearGradient>
          <linearGradient id="landing_bg_paint2_linear" x1="0" y1="496" x2="1600" y2="496" gradientUnits="userSpaceOnUse">
            <stop stop-color="#634CF2" />
            <stop offset="1" stop-color="#6799F8" />
          </linearGradient>
          <linearGradient id="landing_bg_paint3_linear" x1="941.605" y1="385.074" x2="1301.97" y2="330.074"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="landing_bg_paint4_linear" x1="1246.73" y1="310.405" x2="1652.44" y2="307.959"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="landing_bg_paint5_linear" x1="690.478" y1="486.947" x2="1050.11" y2="343.353"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="landing_bg_paint6_linear" x1="460.75" y1="615.931" x2="820.393" y2="452.104"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="landing_bg_paint7_linear" x1="285.98" y1="771.39" x2="632.869" y2="582.046"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="landing_bg_paint8_linear" x1="134.612" y1="935.032" x2="472.856" y2="730.646"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="landing_bg_paint9_linear" x1="-10.397" y1="1093.6" x2="327.847" y2="889.212"
            gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={top} poster paragraphLevel={2} />
          <a href="" class="cta">{top__cta}</a>
        </div>
      </ResponsiveContainer>

      <appflow-activator></appflow-activator>
    </section>
  );
}

const Companies = () => {
  const { companies } = state.pageData;

  return (
    <ResponsiveContainer id="companies" as="section">
      <Heading level={6}>{companies}</Heading>
      <div class="logos">
        <div class="wrapper">
          {aaaLogo({}, { width: '50' })}
          {amtrakLogo({}, { width: '64' })}
          {nasaLogo({}, { width: '50' })}
          {ibmLogo({}, { width: '53' })}
        </div>
        <div class="wrapper">
          {burgerKingLogo({}, { width: '50' })}
          {catLogo({}, { width: '50' })}
          {targetLogo({}, { width: '50' })}
        </div>
      </div>
    </ResponsiveContainer>
  );
}

const Ship = () => {
  const { ship, ship__list } = state.pageData;

  const icons: HTMLElement[] = [
    triplePhoneIcon({}, { width: 64, height: 64 }),
    tripleLayerIcon({}, { width: 64, height: 64 }),
    buildingBlocksIcon({}, { width: 64, height: 64 })
  ]

  return (
    <ResponsiveContainer id="ship" as="section">
      <div class="heading-group">
        <PrismicRichText richText={ship} paragraphLevel={2} />
      </div>

      <Grid class="list">
        {ship__list.map(({ content }, i) => (
          <Col class="list-item">
            {icons[i]}
            <PrismicRichText richText={content}/>
          </Col>
        ))}
      </Grid>
    </ResponsiveContainer>
  );
}
    
const Push = () => {
  const { push, push__list } = state.pageData;

  const icons: HTMLElement[] = [
    publishingIcon({}, { width: 48, height: 48 }),
    appleCloudIcon({}, { width: 48, height: 48 })
  ]

  return (
    <section id="push">
      <ResponsiveContainer>
        <PrismicRichText richText={push} paragraphLevel={2} />
        <ul class="list">
          {push__list.map(({ content }, i) => (
            <li class="list-item">
              {icons[i]}
              <PrismicRichText richText={content} paragraphLevel={4}/>
            </li>
          ))}
        </ul>
      </ResponsiveContainer>
      {appleStoreCheckedIcon({}, { width: 52, height: 52 })}
      {testflightLogo({}, { width: 52, height: 52 })}
      {googleStoreCheckedIcon({}, { width: 52, height: 52 })}
    </section>
  )
}

const Live = () => {
  const { live, live__list } = state.pageData;

  return (
    <section id="live">
      <ResponsiveContainer>
        <PrismicRichText richText={live} paragraphLevel={2} />
        <ul class="list">
          {live__list.map(({ content }) => (
            <li class="list-item">
              {checkmarkCircle({}, { width: 16, height: 16})}
              <Paragraph>{content}</Paragraph>
            </li>
          ))}
        </ul>            
      </ResponsiveContainer>
    </section>
  )
}

const Native = () => {
  const { native, native__subtext } = state.pageData;

  return (
    <section id="native">
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={native} paragraphLevel={2} />
        </div>
        <div class="subtext">
          {cloudCircleIcon({}, { width: 48, height: 48})}
          <PrismicRichText richText={native__subtext} paragraphLevel={4} />
        </div>        
      </ResponsiveContainer>
    </section>
  )
}

const Automate = () => {
  const { automate, automate__subtext } = state.pageData;

  return (
    <section id="automate">
      <ResponsiveContainer>
        <div class="heading-group">
          <PrismicRichText richText={automate} paragraphLevel={2} />
        </div>
        <div class="subtext">
          <PrismicRichText richText={automate__subtext} paragraphLevel={3} />
        </div>
      </ResponsiveContainer>
    </section>
  )
}
const Managed = () => {
  const { managed } = state.pageData;

  return (
    <section id="managed">
      <ResponsiveContainer>
        <PrismicRichText richText={managed} paragraphLevel={2} />
      </ResponsiveContainer>
    </section>
  )
}
const Experience = () => {
  const { experience__title, experience__subtext, experience__cta, experience__list } = state.pageData;

  return (
    <section id="experience">
      <ResponsiveContainer>
        <PrismicRichText richText={experience__title} />
        <div>
          <div class="subtext">
            <PrismicRichText richText={experience__subtext} paragraphLevel={2} />
            <a href="" class="cta">{experience__cta}</a>
          </div>
          <ul class="list">
            {experience__list.map(({ content }) => (
              <li class="list-item">
                {checkmarkCircle({ main: '#8C93FF' }, { width: 16, height: 16 })}
                <Paragraph>{content}</Paragraph>
              </li>
            ))}
          </ul> 
        </div>        
      </ResponsiveContainer>
    </section>
  )
}
const GetStarted = () => {
  const { getstarted, getstarted__cta } = state.pageData;

  return (
    <ResponsiveContainer as="section">
      <PrismicRichText richText={getstarted} paragraphLevel={2} />
    </ResponsiveContainer>
  )
}
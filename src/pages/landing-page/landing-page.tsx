import { Component, Host, h} from '@stencil/core';

// import { ResponsiveContainer, Grid, Col, Button, PrismicRichText, Heading } from '@ionic-internal/ionic-ds';
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

  render() {
    const page = state.pageData;

    console.log(page);

    return (
    <Host>
      <header>
        <appflow-site-header></appflow-site-header>
      </header>

      <main>
        <section>
          <svg width="1600" height="992" viewBox="0 0 1600 992" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <appflow-activator></appflow-activator>
        </section>

      </main>

      <footer>

      </footer>
    </Host>
    );
  }
}
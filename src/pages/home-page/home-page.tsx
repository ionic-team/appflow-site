import { Component, Host, h, getAssetPath} from '@stencil/core';

import { ResponsiveContainer, Paragraph, PrismicRichText, Heading, Grid, Col, Breakpoint } from '@ionic-internal/ionic-ds';
import { aaaLogo, amtrakLogo, nasaLogo, burgerKingLogo, catLogo, targetLogo, ibmLogo, triplePhoneIcon, tripleLayerIcon,
         buildingBlocksIcon, publishingIcon, appleCloudIcon, appleStoreCheckedIcon, testflightLogo,
         googleStoreCheckedIcon, checkmarkCircle, cloudCircleIcon } from '../../svgs';
import { getPage } from '../../global/utils/prismic/prismic';
import state from '../../store';



@Component({
  tag: 'home-page',
  styleUrl: 'home-page.scss',
  assetsDirs: ['assets'],
  scoped: true
})
export class HomePage {
  
  async componentWillLoad() {
    await getPage('appflow_homepage');
  }

  render = () => (
    <Host>
      <Cached/>
      {/* <Top /> */}
      {/* <Companies /> */}
      {/* <Ship /> */}
      {/* <Push /> */}
      {/* <Live /> */}
      {/* <Native /> */}
      {/* <Automate /> */}
      {/* <Managed /> */}
      {/* <Experience /> */}
      <get-started-section />
    </Host>
  )
}

const Cached = () => {
  return (
    <div innerHTML={`<section id=top class="sc-home-page" c-id=7.0.0.0><svg class="background sc-home-page"
    viewBox="0 0 1600 992" xmlns="http://www.w3.org/2000/svg" c-id=7.1.1.0><rect width=1600 height=992 fill=url(#landing_bg_paint1_linear)
    class="sc-home-page" c-id=7.2.2.0></rect><path d="M1298.04 97.309L1494.1 970.579L1066.48 878.169L859.254 53.3663L1298.04 97.309Z"
    fill=url(#landing_bg_paint3_linear) fill-opacity=0.12 class="sc-home-page" c-id=7.3.2.1></path><path d="M1665.55 102.568L1760.72 1044.29L1304.71 873.559L1209.54 -68.1665L1665.55 102.568Z"
    fill=url(#landing_bg_paint4_linear) fill-opacity=0.08 class="sc-home-page" c-id=7.4.2.2></path><path d="M996.453 199.416L1325.18 982.749L887.983 955.103L559.252 171.77L996.453 199.416Z"
    fill=url(#landing_bg_paint5_linear) fill-opacity=0.1 class="sc-home-page" c-id=7.5.2.3></path><path d="M753.376 310.796L1135.39 1073.31L690.115 1071.58L308.1 309.07L753.376 310.796Z"
    fill=url(#landing_bg_paint6_linear) fill-opacity=0.1 class="sc-home-page" c-id=7.6.2.4></path><path d="M555.833 445.941L991.857 1178.91L547.616 1209.31L111.592 476.339L555.833 445.941Z"
    fill=url(#landing_bg_paint7_linear) fill-opacity=0.1 class="sc-home-page" c-id=7.7.2.5></path><path d="M389.921 598.053L857.694 1311.18L415.215 1361.05L-52.5576 647.919L389.921 598.053Z"
    fill=url(#landing_bg_paint8_linear) fill-opacity=0.1 class="sc-home-page" c-id=7.8.2.6></path><path d="M244.912 756.619L712.685 1469.75L270.206 1519.61L-197.567 806.485L244.912 756.619Z"
    fill=url(#landing_bg_paint9_linear) fill-opacity=0.1 class="sc-home-page" c-id=7.9.2.7></path><defs
    class="sc-home-page" c-id=7.10.2.8><linearGradient id=landing_bg_paint1_linear x1=0 y1=496 x2=1600 y2=496
    gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.11.3.0><stop stop-color=#634CF2 class="sc-home-page"
    c-id=7.12.4.0></stop><stop offset=1 stop-color=#67A5F8 class="sc-home-page" c-id=7.13.4.1></stop></linearGradient><linearGradient
    id=landing_bg_paint2_linear x1=0 y1=496 x2=1600 y2=496 gradientUnits=userSpaceOnUse class="sc-home-page"
    c-id=7.14.3.1><stop stop-color=#634CF2 class="sc-home-page" c-id=7.15.4.0></stop><stop offset=1
    stop-color=#6799F8 class="sc-home-page" c-id=7.16.4.1></stop></linearGradient><linearGradient id=landing_bg_paint3_linear
    x1=941.605 y1=385.074 x2=1301.97 y2=330.074 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.17.3.2><stop
    stop-color=white class="sc-home-page" c-id=7.18.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.19.4.1></stop></linearGradient><linearGradient id=landing_bg_paint4_linear x1=1246.73
    y1=310.405 x2=1652.44 y2=307.959 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.20.3.3><stop
    stop-color=white class="sc-home-page" c-id=7.21.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.22.4.1></stop></linearGradient><linearGradient id=landing_bg_paint5_linear x1=690.478
    y1=486.947 x2=1050.11 y2=343.353 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.23.3.4><stop
    stop-color=white class="sc-home-page" c-id=7.24.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.25.4.1></stop></linearGradient><linearGradient id=landing_bg_paint6_linear x1=460.75
    y1=615.931 x2=820.393 y2=452.104 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.26.3.5><stop
    stop-color=white class="sc-home-page" c-id=7.27.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.28.4.1></stop></linearGradient><linearGradient id=landing_bg_paint7_linear x1=285.98
    y1=771.39 x2=632.869 y2=582.046 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.29.3.6><stop
    stop-color=white class="sc-home-page" c-id=7.30.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.31.4.1></stop></linearGradient><linearGradient id=landing_bg_paint8_linear x1=134.612
    y1=935.032 x2=472.856 y2=730.646 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.32.3.7><stop
    stop-color=white class="sc-home-page" c-id=7.33.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.34.4.1></stop></linearGradient><linearGradient id=landing_bg_paint9_linear x1="-10.397"
    y1=1093.6 x2=327.847 y2=889.212 gradientUnits=userSpaceOnUse class="sc-home-page" c-id=7.35.3.8><stop
    stop-color=white class="sc-home-page" c-id=7.36.4.0></stop><stop offset=1 stop-color=white stop-opacity=0
    class="sc-home-page" c-id=7.37.4.1></stop></linearGradient></defs></svg><div class="ui-container sc-home-page"
    c-id=7.38.1.1><div class="heading-group sc-home-page" c-id=7.39.2.0><div class="ui-breakpoint ui-breakpoint-sm ui-breakpoint-md ui-breakpoint-lg ui-breakpoint-xl sc-home-page"
    c-id=7.40.3.0 style="--display: block;"><h1 id="h-mobile-devops-without-the-chaos" class="ui-heading ui-poster-1 sc-home-page"
    c-id=7.41.4.0><!--t.7.42.5.0-->Mobile DevOps without the chaos</h1><p class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page"
    c-id=7.43.4.1><!--t.7.44.5.0-->Appflow is a Mobile DevOps platform for Ionic, Capacitor, and Cordova apps</p></div><div
    class="ui-breakpoint ui-breakpoint-xs sc-home-page" c-id=7.45.3.1 style="--display: block;"><h1 id="h-mobile-devops-without-the-chaos"
    class="ui-heading ui-heading-1 sc-home-page" c-id=7.46.4.0><!--t.7.47.5.0-->Mobile DevOps without the chaos</h1><p
    class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page" c-id=7.48.4.1><!--t.7.49.5.0-->Appflow is a Mobile DevOps platform for Ionic, Capacitor, and Cordova apps</p></div><a
    class="cta button sc-home-page" href="https://ionicframework.com/signup?source=appflow-site&amp;product=appflow"
    c-id=7.50.3.2><!--t.7.51.4.0-->Get started - it’s free to try</a></div></div><div class="activator sc-home-page"
    c-id=7.52.1.2>
    
    <appflow-activator class="sc-home-page sc-appflow-activator-h sc-appflow-activator-s hydrated"
    c-id=7.53.2.0 s-id=8 style="--max-image-width: 1152px;"><!--r.8--></appflow-activator></div></section>
    
    <section id=companies
    class="ui-container sc-home-page" c-id=7.54.0.1><h6 class="ui-heading ui-heading-6 sc-home-page" c-id=7.55.1.0><!--t.7.56.2.0-->Trusted by the world’s best teams</h6><div
    class="logos sc-home-page" c-id=7.57.1.1><div class="wrapper sc-home-page" c-id=7.58.2.0><svg viewBox="0 0 49.71 30"
    width=49.71 class="sc-home-page" c-id=7.59.3.0><path fill=#E21827 d="M49.48 1.17C48.02-1.32 40.37.3 30.83 4.68c.1.07-.1-.07 0 0-3.03-2.38-7.9-4-13.53-4C7.76.68 0 5.5 0 11.38c0 3.56 2.8 6.72 7.09 8.67L7 20.02c-4.14 3.83-6.25 7.08-5.28 8.8 1.19 2 6.3 1.35 13.15-1.18l-.05-.11c-5.5 1.89-9.54 2.27-10.5.65-.81-1.46.9-4.2 4.34-7.5 2.54.92 5.52 1.5 8.66 1.5 9.6 0 17.34-4.86 17.34-10.8 0-2-.9-3.87-2.45-5.48 7.31-3.12 12.96-4.08 14.14-2.03 1.35 2.32-3.99 8.1-12.56 13.83l.11.1C44.36 11 51.1 3.99 49.48 1.18zM26.63 14.24H23l1.78-6.53 1.84 6.53zm-8.41 0H14.6l1.77-6.53 1.84 6.53zM16.55 1.6L13.1 14.24 9.8 3.06c2-.86 4.32-1.35 6.75-1.46zm-6.8 12.64H6.2l1.78-6.53 1.78 6.53zm-6.73-2.86c0-2.76 1.67-5.24 4.36-7.03L4.31 15.48a7.4 7.4 0 01-1.3-4.1zm8.4 8.97a14.48 14.48 0 01-5.98-3.46l.38-1.35h4.31l1.3 4.75v.06zm5.88.86c-1.56 0-3.07-.16-4.47-.49l1.4-5.18h4.36l1.51 5.45c-.91.17-1.83.22-2.8.22zm.54-19.61c2.42.05 4.74.54 6.79 1.35l-3.13 11.3L17.84 1.6zm5.44 18.7l-1.02-3.36.37-1.4H27l.7 2.6a14.1 14.1 0 01-4.42 2.15zm7-4.76l-3.33-11.4c2.9 1.83 4.69 4.37 4.69 7.24 0 1.51-.49 2.92-1.35 4.16z"
    class="sc-home-page" c-id=7.60.4.0></path></svg><svg viewBox="0 0 63.78 26.25" width=63.78 class="sc-home-page"
    c-id=7.61.3.1><path fill=#1E8DB5 d="M29.93 4.77l-.64-2.5-1.52 2.5h-1.79l-1.52-2.5-.63 2.5H21.9l1.24-3.9h2.11l1.64 2.67L28.5.87h2.1l1.24 3.9h-1.91zM15.98.88L13.2 4.73h1.87l.44-.68h2.91l.44.68h2.08L18.13.87h-2.15zm0 2.47l1-1.54 1 1.54h-2zM51.47.88l-2.8 3.86h1.88l.44-.68h2.91l.44.68h2.07L53.62.87h-2.15zm0 2.47l1-1.54 1 1.54h-2zM61.99 4.77L59.7 2.94v1.83H57.8V.87h1.91V2.6L62 .87h2.3l-2.58 1.88 2.79 2.02h-2.51zM45.42 4.77h2.2l-1.44-1.5c.8-.18 1.11-.63 1.11-1.12 0-.6-.44-.9-1.07-1.09-.68-.15-1.56-.19-2.4-.19h-2.95v3.87h1.92V3.57h1.63l1 1.2zm-2.63-3.1h1.2c.99 0 1.39.18 1.39.55 0 .3-.28.53-.6.57-.24.03-.48.07-.84.07H42.8v-1.2zM36.9 1.77v3h-1.96v-3h-2.47l.2-.9h6.74l-.2.9H36.9zM27.23 23.08c3.95 1.56 8 3 11.53 4.05 4.17-8.1 11.75-14.53 25.74-20.44v-.31c-17.94 4.77-29.16 8.2-37.27 16.7zM34.57 7.3C30.62 7.08 9.9 6.49.7 10.86c2.46 1.65 5.13 3.3 8.33 5.2 9.19-4.73 20.94-6.38 31.83-7.09v-.35c-2.14-.24-4.48-.71-6.3-1.3z"
    class="sc-home-page" c-id=7.62.4.0></path><path fill=#1E8DB5 d="M44.63 8.81C36.41 9.66 22 12 13.77 17.06c2.99 1.49 6.09 2.97 9.3 4.34 8.53-7.3 20.07-10.58 31.71-12.8V8.3c-2.88.31-7.37.52-10.15.52z"
    class="sc-home-page" c-id=7.63.4.1></path></svg><svg viewBox="0 0 71.29 18.75" width=71.29 class="sc-home-page"
    c-id=7.64.3.2><path fill=#E72031 d="M14.55 19.38a4.99 4.99 0 01-4.83-3.43L6.45 5.06a.97.97 0 00-.93-.66c-.54 0-.98.4-.98.91v13.6H.5V5.31C.5 2.71 2.74.62 5.5.62c2.25 0 4.23 1.4 4.83 3.42l3.27 10.89c.12.39.5.66.94.66.54 0 .98-.4.98-.91V1.09h4.04v13.6c0 2.58-2.25 4.69-5.01 4.69zM47.41 18.91H36.53v-3.77H47.4c.96 0 1.74-.73 1.74-1.63 0-.9-.78-1.63-1.74-1.63h-5.04c-3.18 0-5.78-2.42-5.78-5.4 0-2.97 2.6-5.4 5.78-5.4h9.84v3.78h-9.84c-.96 0-1.74.73-1.74 1.62 0 .9.78 1.63 1.74 1.63h5.04c3.19 0 5.78 2.42 5.78 5.4 0 2.98-2.59 5.4-5.78 5.4z"
    class="sc-home-page" c-id=7.65.4.0></path><path fill=#E72031 d="M66.57 3.86A4.99 4.99 0 0061.79.63c-2.19 0-4.1 1.3-4.78 3.23L51.77 18.9h4.25l4.83-13.87c.1-.32.44-.64.93-.64.5 0 .83.32.94.64l4.82 13.87h4.25L66.57 3.86zM33.36 3.86A4.99 4.99 0 0028.6.63c-2.19 0-4.1 1.3-4.78 3.23L18.57 18.9h4.25l4.82-13.87c.11-.32.45-.64.94-.64.5 0 .83.32.94.64l4.83 13.88h4.25L33.36 3.86z"
    class="sc-home-page" c-id=7.66.4.1></path></svg><svg viewBox="0 0 52.53 21.56" width=52.53 class="sc-home-page"
    c-id=7.67.3.3><path fill=#1F70C1 d="M53.32 1.75h-8.75l.56-1.53h8.19v1.53zM30 .22h8.12l.5 1.53H30V.22zM23.55.22a5.6 5.6 0 013.47 1.53H12.28V.22h11.27zM10.99.22H.79v1.53h10.2V.22zM53.32 4.6h-9.76l.5-1.54h9.2V4.6h.06zM39.7 4.6H30V3.12h9.13l.56 1.48zM28.2 3.12c.17.51.45.91.45 1.54H12.34V3.12H28.2zM10.99 3.12H.79v1.54h10.2V3.12zM42.6 7.5l.51-1.54h7.35V7.5H42.6zM40.14 5.96l.56 1.54h-7.79V5.96h7.23zM28.76 5.96c0 .52-.06 1.09-.22 1.54h-4.49V5.96h4.71zM8.02 5.96H3.65V7.5h4.37V5.96zM19.68 5.96H15.3V7.5h4.37V5.96zM37.23 9.15v1.14H32.9V8.75h8.24l.5 1.43.51-1.43h8.3v1.54h-4.32V9.15l-.4 1.14h-8.12l-.4-1.14zM15.3 8.81h12.62a6.43 6.43 0 01-1.23 1.54H15.36c-.05-.06-.05-1.54-.05-1.54zM8.02 8.81H3.65v1.54h4.37V8.8zM50.46 11.65h-4.32v1.54h4.32v-1.54zM37.23 11.65H32.9v1.54h4.32v-1.54zM45.3 11.65l-.5 1.54h-6.12l-.56-1.54h7.18zM15.3 11.65h11.33c.5.46 1.01.97 1.35 1.54H15.3v-1.54zM8.02 13.19v-1.54H3.65v1.54h4.37zM50.46 14.56h-4.32v1.53h4.32v-1.53zM37.23 14.56H32.9v1.53h4.32v-1.53zM43.73 16.1s.5-1.54.56-1.54h-5.21l.56 1.53h4.09zM15.3 16.04V14.5h4.44v1.54H15.3zM28.6 14.56c.22.45.22 1.02.27 1.53h-4.7v-1.53h4.42zM8.02 14.56H3.65v1.53h4.37v-1.53zM53.32 17.34h-7.18v1.54h7.18v-1.54zM37.17 17.34h-7.18v1.54h7.18v-1.54zM42.78 18.88h-2.19l-.56-1.54h3.25l-.5 1.54zM.79 17.34v1.54h10.2v-1.54H.79zM28.7 17.34c-.1.52-.22 1.14-.56 1.54h-15.8v-1.54H28.7zM41.77 21.72h-.17l-.56-1.47h1.29l-.56 1.47zM53.32 20.25h-7.18v1.53h7.18v-1.53zM12.34 21.72V20.2h14.8a5.75 5.75 0 01-3.82 1.53H12.34zM37.17 20.25h-7.18v1.53h7.18v-1.53zM10.99 20.25v1.53H.79v-1.53h10.2z"
    class="sc-home-page" c-id=7.68.4.0></path></svg></div><div class="wrapper sc-home-page" c-id=7.69.2.1><svg
    viewBox="0 0 30.32 32" width=30.32 class="sc-home-page" c-id=7.70.3.0><path fill=#FAAF18 d="M23.85 4.5c.08-.18-.07-.36-.07-.36s-1.18-2.01-5.32-2.47c-2.23-.24-5.25.22-7.37 1.38C7.23 5.15 6.65 8.6 6.65 8.6c-.02.09-.05.35.04.46.08.1.21.1.37.05 1.36-.46 5.4-1.82 7.95-2.5a95.24 95.24 0 018.52-1.9c.15-.03.27-.08.32-.2z"
    class="sc-home-page" c-id=7.71.4.0></path><path fill=#185494 d="M28 20.8c-2.18 4.94-6.34 8.38-11.81 8.46a14.09 14.09 0 01-10.03-3.74l-1.53.67v-2.41A14.15 14.15 0 012 15.33C1.99 6.93 8.34.3 17.2.3c1.45 0 2.75.23 3.74.46A15.05 15.05 0 0016.23 0C6.72 0 .32 7.81.32 15.87.32 24.65 7.12 32 16.04 32c8.52 0 13.11-6.09 14.6-9.75L28 20.79z"
    class="sc-home-page" c-id=7.72.4.1></path><path fill=#EE1D23 d="M25.8 19.06a4.31 4.31 0 002.58-1.13c.43-.43.54-1.02.54-1.46.02-.65 0-2.7 0-2.7l-3.31.73v.78c.01.52.26.8.8.7.16-.02.42-.1.42-.1v.64c0-.02.05.36-.78.52-1.1.17-1.59-.5-1.6-1.71.02-1.3.74-2.03 1.62-2.24.98-.22 1.54.01 1.86.06 1.1.16 1.4-1.5.41-1.89-.74-.3-1.7-.36-2.6-.17a4.42 4.42 0 00-3.62 4.63c-.01 2.67 1.93 3.53 3.67 3.34z"
    class="sc-home-page" c-id=7.73.4.2></path><path fill=#EE1D23 d="M15.03 21.91l1.1-.38c.82-.28 1.12-.78 1.12-1.62-.02-.93-.02-2.73-.02-2.73l2.37 2.76c.39.4.87.43 1.3.3.46-.13.84-.55.85-1.15v-6.84s-.6.13-1.11.27c-.58.16-1.03.54-1.03 1.54v2.37s-1.35-1.7-2.21-2.58c-.46-.46-1.24-.18-1.24-.18l-1.13.34v7.9z"
    class="sc-home-page" c-id=7.74.4.3></path><path fill=#EE1D23 d="M14.31 14.19s-.7.2-1.28.42c-.75.27-1.2.72-1.2 1.87v6.56s.66-.23 1.28-.47c.87-.33 1.2-.79 1.2-1.71v-6.67z"
    class="sc-home-page" c-id=7.75.4.4></path><path fill=#EE1D23 d="M10.79 15.75c-.65-.3-1.21.03-1.45.4l-2 3.46v-2.79l-2.38 1v7.87l1.66-.7s.33-.1.53-.42c.18-.3.17-.77.17-.77v-2.5l1.86 2.01c.4.44 1.16.65 1.82.11.6-.49.5-1.32.17-1.7l-1.69-1.73 1.74-2.78c.32-.54.16-1.19-.43-1.46z"
    class="sc-home-page" c-id=7.76.4.5></path><path fill=#FAAF18 d="M9.86 25.01c-.09.21.11.42.11.42.86 1.1 4.68 2.48 8.84 1.46 6.34-1.55 7.68-6.1 7.83-6.74.03-.13.05-.33-.07-.46-.1-.11-.24-.11-.44-.07a117.41 117.41 0 00-15.95 5.16c-.18.07-.26.1-.32.23z"
    class="sc-home-page" c-id=7.77.4.6></path><path fill=#EE1D23 d="M6.1 14.69c-.01-.44-.34-.68-.91-.38v1.4l.32-.15c.34-.17.6-.45.59-.87zm-.92-1.27l.26-.12a.9.9 0 00.54-.81c0-.43-.34-.54-.8-.3v1.23zm2.44 1.06c.02 1.1-.76 1.7-1.79 2.12l-2.09.9v-5.74s1.32-.54 1.75-.7c1.22-.46 1.94.1 1.94.92 0 .55-.24 1.02-.74 1.43.49.08.92.5.93 1.07z"
    class="sc-home-page" c-id=7.78.4.7></path><path fill=#EE1D23 d="M11.58 9.64c0-.48-.33-.6-.73-.5l-.7.24v3.57c0 .36-.05.8-.49.91-.33.09-.49-.14-.49-.5v-2.91c0-.5-.33-.63-.73-.5-.45.15-.7.26-.7.26v3.53c-.01 1.19.8 1.78 2.02 1.41 1.08-.32 1.81-.94 1.82-2.51v-3z"
    class="sc-home-page" c-id=7.79.4.8></path><path fill=#EE1D23 d="M23.21 11.12c.31-.07.5-.3.5-.68v-.62l-1.69.38V9.19l1.06-.23c.3-.07.44-.23.44-.56V7.8l-1.5.33v-.8l1.2-.26c.33-.06.44-.29.44-.6v-.61c-.75.13-2.17.42-3.06.63l-.01 5.23 2.62-.61z"
    class="sc-home-page" c-id=7.80.4.9></path><path fill=#EE1D23 d="M13.4 10.9s.84-.44.84-1.14c-.01-.6-.55-.46-.83-.36v1.5zm.01.82v1.4c0 .39-.26.66-.58.79 0 0 0-.01 0 0l-.84.29V8.8s1.19-.41 1.88-.58c1.07-.26 1.84.24 1.83 1.13a2.21 2.21 0 01-.89 1.71l.93.9c.27.28.3.77-.02 1.08-.19.18-.7.37-1.08-.04l-1.23-1.28zM25.42 8s.82-.3.81-.98c-.01-.57-.56-.47-.82-.4V8zm-1.4 2.96V5.79s1.5-.27 1.88-.31c1.07-.14 1.79.46 1.76 1.31a1.8 1.8 0 01-.86 1.48l.92 1.05c.26.3.24.8-.14 1.05a.73.73 0 01-.98-.13l-1.18-1.43v1.26c0 .38-.23.66-.61.73l-.79.16z"
    class="sc-home-page" c-id=7.81.4.10></path><path fill=#EE1D23 d="M20.25 8.79l-2.1.48v.6c0 .28.19.46.47.4l.3-.06v.6c0 .23-.34.38-.7.37-.51-.02-.8-.42-.8-1.18 0-1 .48-1.58 1.11-1.75.31-.08.6-.04.83 0 .54.08.85-.18.86-.64.01-.48-.42-.79-1.33-.75-1.99.06-3 1.51-3 3.24 0 1.77 1.14 2.55 2.53 2.3a2.9 2.9 0 001.45-.66c.27-.24.38-.6.38-.91V8.79z"
    class="sc-home-page" c-id=7.82.4.11></path><path fill=#fff d="M11.93 3C9.6 4.05 8.03 6.53 7.94 7.57c-.03.41.51.48.57.03C9 5.7 10.5 3.9 11.93 3zM19.66 4.78c1.25-.31 1.94-.35 1.95-.93.03-.95-2.65-2.06-5.11-1.85 2.5.17 4 1.15 4 1.82.01.43-.36.81-.84.96zM20.43 25.83a8.7 8.7 0 004.7-4.34c.29-.62-.55-.94-.78-.2a8.97 8.97 0 01-3.92 4.54z"
    class="sc-home-page" c-id=7.83.4.12></path></svg><svg viewBox="0 0 41.27 24.38" width=41.27 class="sc-home-page"
    c-id=7.84.3.1><path fill=#FFC409 d="M22.25 15.2L9.65 25.2h25.2l-12.6-9.98z" class="sc-home-page" c-id=7.85.4.0></path><path
    fill=#03060B d="M37.24 25.19l-4.52-3.55V6.04h-3.6v-4.5H41.9v4.5h-3.58V25.2h-1.08zM25.97 1.54h-7.53l-4.08 17.98 7.75-6.15.14-.11 7.83 6.23-4.11-17.95zM22.08 12.4h-1.46l1.46-6.5v.02l1.46 6.5h-1.46v-.02zM12.49 20.93l-5.16 4.12c-.16 0-.33.03-.47.03-4.77-.03-6.23-1.93-6.23-6V6.8C.63 2.74 2.1.81 6.9.81c4.93 0 6.4 1.93 6.4 6v4.14H8.4V5.94c0-.76-.58-1.14-1.38-1.14-.66 0-1.38.38-1.38 1.14v14.04c0 .79.72 1.3 1.38 1.3.66 0 1.38-.4 1.38-1.3v-4.77h4.88v3.88c0 .48-.25 1.4-.8 1.84z"
    class="sc-home-page" c-id=7.86.4.1></path></svg><svg viewBox="0 0 33 32" width=32 class="sc-home-page"
    c-id=7.87.3.2><path fill=#C00 d="M.9 16a15.99 15.99 0 1132 0c0 8.84-7.15 16-16 16-8.84.05-16-7.16-16-16zm16 10.68c5.92 0 10.69-4.77 10.69-10.68S22.82 5.32 16.9 5.32A10.67 10.67 0 006.22 16c0 5.91 4.77 10.68 10.68 10.68zM22.22 16a5.32 5.32 0 11-10.65-.01 5.32 5.32 0 0110.65.01z"
    class="sc-home-page" c-id=7.88.4.0></path></svg></div></div></section>
    
    <section id=ship class="ui-container sc-home-page"
    c-id=7.89.0.2><div class="heading-group sc-home-page" c-id=7.90.1.0><h2 id="h-ship-at-the-speed-of-development"
    class="ui-heading ui-heading-2 sc-home-page" c-id=7.91.2.0><!--t.7.92.3.0-->Ship at the speed of development</h2><p
    class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page" c-id=7.93.2.1><!--t.7.94.3.0-->Spend more time on what matters. Appflow takes care of the rest, with a suite of powerful mobile DevOps tools and services for every type of app.</p></div><div
    class="ui-grid list sc-home-page" c-id=7.95.1.1><div class="ui-col ui-col-12 ui-col-xs-12 ui-col-sm-4 list-item sc-home-page"
    c-id=7.96.2.0><svg width=64 height=64 class="sc-home-page" c-id=7.97.3.0><rect x=38 width=26 height=48
    rx=6 fill=#BFE4FF class="sc-home-page" c-id=7.98.4.0></rect><rect x=19 y=8 width=26 height=48 rx=6
    fill=#97BDFF class="sc-home-page" c-id=7.99.4.1></rect><rect y=16 width=26 height=48 rx=6 fill=#597EFF
    class="sc-home-page" c-id=7.100.4.2></rect><circle opacity=.8 cx=13 cy=58 r=2 fill=#fff class="sc-home-page"
    c-id=7.101.4.3></circle><circle opacity=.7 cx=32 cy=50 r=2 fill=#fff class="sc-home-page" c-id=7.102.4.4></circle><circle
    opacity=.7 cx=51 cy=42 r=2 fill=#fff class="sc-home-page" c-id=7.103.4.5></circle></svg><h4 id="h-ship-stable-apps-faster"
    class="ui-heading ui-heading-4 sc-home-page" c-id=7.104.3.1><!--t.7.105.4.0-->Ship stable apps, faster</h4><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.106.3.2><!--t.7.107.4.0-->Deliver a better mobile experience for your users by sending updates directly to them in real-time, without waiting on app store approval.</p></div><div
    class="ui-col ui-col-12 ui-col-xs-12 ui-col-sm-4 list-item sc-home-page" c-id=7.108.2.1><svg viewBox="0 0 64 64"
    width=64 height=64 class="sc-home-page" c-id=7.109.3.0><path fill=#BFE4FF d="M32 32c-2.07 0-4.14.37-5.76 1.1L3.47 43.5C2.43 43.96 0 45.35 0 47.96c0 2.62 2.43 4 3.47 4.48l22.97 10.48a14.76 14.76 0 0011.1 0l22.99-10.48c1.04-.47 3.47-1.86 3.47-4.48s-2.43-4-3.47-4.48L37.76 33.1A14.29 14.29 0 0032 32z"
    class="sc-home-page" c-id=7.110.4.0></path><path fill=#97BDFF d="M32 16c-2.07 0-4.14.37-5.76 1.1L3.47 27.5C2.43 27.96 0 29.35 0 31.96c0 2.62 2.43 4 3.47 4.48l22.97 10.48a14.76 14.76 0 0011.1 0l22.99-10.48c1.04-.47 3.47-1.86 3.47-4.48s-2.43-4-3.47-4.48L37.76 17.1A14.29 14.29 0 0032 16z"
    class="sc-home-page" c-id=7.111.4.1></path><path fill=#597EFF d="M32 0c-2.07 0-4.14.37-5.76 1.1L3.47 11.5C2.43 11.96 0 13.35 0 15.96c0 2.62 2.43 4 3.47 4.48l22.97 10.48a14.76 14.76 0 0011.1 0l22.99-10.48c1.04-.47 3.47-1.86 3.47-4.48s-2.43-4-3.47-4.48L37.76 1.1A14.29 14.29 0 0032 0z"
    class="sc-home-page" c-id=7.112.4.2></path><path fill=url(#figure_8_gradient_1) d="M 47.375 12.3593 C 46.8125 15.5675 41.8544 17.1769 37.0625 16.6563 C 37.0625 16.6563 26.6875 15.3593 26.6875 15.3593 C 23.5781 14.9293 21.7263 16.3282 21.7081 17.4013 C 21.7081 17.4013 16.6563 16.9532 16.6563 16.9532 C 17 14.1093 21.4375 11.8907 26.4063 12.3907 C 26.4063 12.3907 34.6875 13.4218 34.6875 13.4218 C 37.0113 13.6718 38.5681 14.0012 39.6819 13.7063 C 41.8756 13.3362 42.3181 12.24 42.4063 11.6398 C 42.4063 11.64 47.375 12.3593 47.375 12.3591 Z"
    class="sc-home-page" c-id=7.113.4.3></path><path fill=url(#figure_8_gradient_0) d="M 16.656 16.95 C 16.4431 18.9332 18.6263 22.0131 24.75 22.8282 C 31.5625 23.3593 34.3438 20.5157 34.2813 18.8593 C 34.2813 18.8593 34.8438 10.4843 34.8438 10.4843 C 35.1075 9.5532 36.8975 9.0357 39.0113 9.2063 C 42.4775 9.8424 42.4063 11.6399 42.4063 11.6399 C 42.4063 11.6399 47.3738 12.3605 47.3738 12.3605 C 47.7656 10.125 45.3125 6.7188 38.0862 6.2106 C 34.3362 6.1274 29.7119 7.4337 29.7656 10.6875 C 29.7656 10.6875 29.75 10.7657 29.2188 18.6718 C 28.7287 19.8756 25.7294 20.255 24.2919 19.7138 C 22.1694 19.1363 21.7856 18.1062 21.7081 17.4012 Z"
    class="sc-home-page" c-id=7.114.4.4></path><defs class="sc-home-page" c-id=7.115.4.5><linearGradient id=figure_8_gradient_0
    class="sc-home-page" c-id=7.116.5.0><stop offset=0 stop-color=#97BDFF class="sc-home-page" c-id=7.117.6.0></stop><stop
    offset=.1 stop-color=#97BDFF class="sc-home-page" c-id=7.118.6.1></stop><stop offset=.5 stop-color=#fff
    class="sc-home-page" c-id=7.119.6.2></stop><stop offset=.9 stop-color=#97BDFF class="sc-home-page" c-id=7.120.6.3></stop><stop
    offset=1 stop-color=#97BDFF class="sc-home-page" c-id=7.121.6.4></stop></linearGradient><linearGradient id=figure_8_gradient_1
    class="sc-home-page" c-id=7.122.5.1><stop offset=0 stop-color=#97BDFF class="sc-home-page" c-id=7.123.6.0></stop><stop
    offset=.3 stop-color=#97BDFF class="sc-home-page" c-id=7.124.6.1></stop><stop offset=.5 stop-color=#597EFF
    class="sc-home-page" c-id=7.125.6.2></stop><stop offset=.7 stop-color=#97BDFF class="sc-home-page" c-id=7.126.6.3></stop><stop
    offset=1 stop-color=#97BDFF class="sc-home-page" c-id=7.127.6.4></stop></linearGradient></defs></svg><h4
    id="h-deliver-continuously" class="ui-heading ui-heading-4 sc-home-page" c-id=7.128.3.1><!--t.7.129.4.0-->Deliver continuously</h4><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.130.3.2><!--t.7.131.4.0-->Automate app delivery, without being a DevOps expert. Our preconfigured, customizable best practices automate your pipeline in minutes.</p></div><div
    class="ui-col ui-col-12 ui-col-xs-12 ui-col-sm-4 list-item sc-home-page" c-id=7.132.2.2><svg width=64
    height=64 class="sc-home-page" c-id=7.133.3.0><rect y=54 width=64 height=10 rx=2 fill=#3C67FF class="sc-home-page"
    c-id=7.134.4.0></rect><rect x=48 y=36 width=16 height=16 rx=2 fill=#597EFF class="sc-home-page" c-id=7.135.4.1></rect><rect
    x=48 y=18 width=16 height=16 rx=2 fill=#7CABFF class="sc-home-page" c-id=7.136.4.2></rect><rect x=48
    width=16 height=16 rx=2 fill=#8DCFFF class="sc-home-page" c-id=7.137.4.3></rect><rect x=30 y=36 width=16
    height=16 rx=2 fill=#597EFF class="sc-home-page" c-id=7.138.4.4></rect><rect x=30 y=18 width=16 height=16
    rx=2 fill=#7CABFF class="sc-home-page" c-id=7.139.4.5></rect><rect x=12 y=36 width=16 height=16 rx=2
    fill=#597EFF class="sc-home-page" c-id=7.140.4.6></rect></svg><h4 id="h-simplify-the-mobile-pipeline"
    class="ui-heading ui-heading-4 sc-home-page" c-id=7.141.3.1><!--t.7.142.4.0-->Simplify the mobile pipeline</h4><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.143.3.2><!--t.7.144.4.0-->Enjoy a fully managed build environment that takes care of all the OS versions, dependencies, and updates, so you can focus on your app.</p></div></div></section><section
    id=push class="sc-home-page" c-id=7.145.0.3><div class="push__wrapper sc-home-page" c-id=7.146.1.0><div
    class="ui-container sc-home-page" c-id=7.147.2.0><div class="ui-grid sc-home-page" c-id=7.148.3.0><div
    class="ui-col ui-col-12 ui-col-sm-6 text sc-home-page" c-id=7.149.4.0><div class="heading-group sc-home-page"
    c-id=7.150.5.0><h6 id="h-push-to-appstores" class="ui-heading ui-heading-6 sc-home-page" c-id=7.151.6.0><!--t.7.152.7.0-->Push to Appstores</h6><h2
    id="h-publish-immediatly-from-zero-clicks" class="ui-heading ui-heading-2 sc-home-page" c-id=7.153.6.1><!--t.7.154.7.0-->Publish immediatly. From zero clicks.</h2><p
    class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page" c-id=7.155.6.2><!--t.7.156.7.0-->Deploy directly to the iOS App Store and Google Play Store from a secure cloud environment.</p></div><ul
    class="list sc-home-page" c-id=7.157.5.1><li class="list-item sc-home-page" c-id=7.158.6.0><svg viewBox="0 0 48 48"
    width=48 height=48 class="sc-home-page" c-id=7.159.7.0><rect fill=#D3ECFF width=48 height=48 rx=24 class="sc-home-page"
    c-id=7.160.8.0></rect><rect fill=#8DCFFF opacity=.5 x=9 y=9 width=30 height=30 rx=15 class="sc-home-page"
    c-id=7.161.8.1></rect><path stroke=#7493FF fill=none d="M7 13v4.05a8 8 0 008 8h18a8 8 0 018 8V35"
    stroke-width=2 class="sc-home-page" c-id=7.162.8.2></path><circle fill=#597EFF cx=41 cy=41 r=7 class="sc-home-page"
    c-id=7.163.8.3></circle><path stroke=#fff fill=none d="M38 41.75L40 44l4-6" stroke-linecap=round
    stroke-linejoin=round class="sc-home-page" c-id=7.164.8.4></path><circle fill=#597EFF stroke=#B0DEFF cx=24 cy=24 r=8
    stroke-width=2 class="sc-home-page" c-id=7.165.8.5></circle><path fill=#fff d="M22.96 28a.32.32 0 01-.24-.1.3.3 0 01-.07-.26l.48-2.57h-1.86a.28.28 0 01-.24-.15.26.26 0 01.03-.29l3.74-4.51c.04-.06.1-.1.16-.11a.32.32 0 01.36.14.3.3 0 01.04.2v.01l-.49 2.57h1.86a.28.28 0 01.24.16.26.26 0 01-.03.28l-3.74 4.51a.31.31 0 01-.24.12z"
    class="sc-home-page" c-id=7.166.8.6></path><circle fill=#597EFF cx=7 cy=7 r=7 class="sc-home-page" c-id=7.167.8.7></circle><circle
    fill=#fff cx=7 cy=7 r=2 class="sc-home-page" c-id=7.168.8.8></circle></svg><h5 id="h-publishing-made-easy"
    class="ui-heading ui-heading-5 sc-home-page" c-id=7.169.7.1><!--t.7.170.8.0-->Publishing made easy</h5><p
    class="ui-paragraph ui-paragraph-4 ui-paragraph--body sc-home-page" c-id=7.171.7.2><!--t.7.172.8.0-->Appflow handles the details of app publishing. Just add a few basic inputs and we’ll take care of the rest.</p></li><li
    class="list-item sc-home-page" c-id=7.173.6.1><svg viewBox="0 0 48 48" width=48 height=48 class="sc-home-page"
    c-id=7.174.7.0><rect fill=#BFE4FF width=48 height=48 rx=24 class="sc-home-page" c-id=7.175.8.0></rect><path
    fill=#597EFF d="M34.4 36H15.1c-2.71 0-5.23-.93-7.1-2.62a9.1 9.1 0 01-3-6.83c0-2.7 1-5.04 2.87-6.74a10.92 10.92 0 015.14-2.5 1.19 1.19 0 00.84-.68c.71-1.6 1.78-3.01 3.12-4.14a11.43 11.43 0 0114.98.68 12.95 12.95 0 013.65 6.8 1.18 1.18 0 00.9.9c3.38.76 6.5 3.2 6.5 7.45 0 2.46-.9 4.49-2.63 5.85A9.51 9.51 0 0134.4 36z"
    class="sc-home-page" c-id=7.176.8.1></path><path fill=#F0F6FF d="M26.91 20.28c-1.26 0-1.79.6-2.67.6-.9 0-1.58-.6-2.68-.6-1.07 0-2.2.65-2.93 1.76-1.02 1.57-.84 4.52.8 7.04.6.9 1.38 1.9 2.41 1.92h.02c.9 0 1.16-.59 2.4-.6h.01c1.22 0 1.46.6 2.36.6h.01c1.04-.01 1.86-1.13 2.45-2.03.43-.64.58-.97.91-1.7-2.38-.9-2.76-4.28-.4-5.57a3.56 3.56 0 00-2.69-1.42z"
    class="sc-home-page" c-id=7.177.8.2></path><path fill=#F0F6FF d="M26.64 17a3.3 3.3 0 00-2.14 1.15c-.47.57-.85 1.4-.7 2.22h.06c.8 0 1.62-.48 2.1-1.1.45-.59.8-1.42.68-2.27z"
    class="sc-home-page" c-id=7.178.8.3></path></svg><h5 id="h-no-mac-required" class="ui-heading ui-heading-5 sc-home-page"
    c-id=7.179.7.1><!--t.7.180.8.0-->No Mac required</h5><p class="ui-paragraph ui-paragraph-4 ui-paragraph--body sc-home-page"
    c-id=7.181.7.2><!--t.7.182.8.0-->Build for iOS in our secure cloud environment, then publish directly to the Apple App Store, without a Mac.</p></li></ul></div><div
    class="ui-col ui-col-12 ui-col-sm-6 image sc-home-page" c-id=7.183.4.1><div class="icons sc-home-page"
    c-id=7.184.5.0><svg viewBox="0 0 52 52" width=52 height=52 class="sc-home-page" c-id=7.185.6.0><rect
    fill=url(#app_store_checked_icon_gradient_0) y=4 width=48 height=48 rx=15.2852 class="sc-home-page" c-id=7.186.7.0></rect><circle
    fill=#fff cx=43.9999 cy=7.99991 r=5.99991 class="sc-home-page" c-id=7.187.7.1></circle><path fill=#597EFF
    d="M43.9999 0C39.5888 0 36 3.74553 36 8.34927C36 12.953 39.5888 16.6985 43.9999 16.6985C48.411 16.6985 51.9998 12.953 51.9998 8.34927C51.9998 3.74553 48.411 0 43.9999 0ZM48.1633 5.55106L42.9941 11.9736C42.9374 12.0441 42.8669 12.101 42.7872 12.1406C42.7076 12.1801 42.6208 12.2013 42.5326 12.2028H42.5222C42.436 12.2027 42.3507 12.1838 42.2719 12.1471C42.1931 12.1105 42.1226 12.057 42.0649 11.99L39.8496 9.42103C39.7933 9.35875 39.7495 9.28536 39.7208 9.20517C39.6921 9.12499 39.6791 9.03963 39.6824 8.9541C39.6858 8.86858 39.7055 8.78462 39.7404 8.70716C39.7753 8.6297 39.8247 8.5603 39.8857 8.50304C39.9466 8.44578 40.0179 8.40182 40.0954 8.37374C40.1729 8.34566 40.255 8.33402 40.3368 8.33951C40.4187 8.34501 40.4986 8.36752 40.572 8.40573C40.6454 8.44394 40.7107 8.49708 40.7642 8.56202L42.5061 10.5819L47.221 4.72496C47.3267 4.59735 47.4764 4.5183 47.6375 4.50489C47.7987 4.49149 47.9584 4.54481 48.0822 4.65334C48.206 4.76186 48.2839 4.91687 48.2991 5.08486C48.3142 5.25284 48.2655 5.42031 48.1633 5.55106Z"
    class="sc-home-page" c-id=7.188.7.2></path><path fill=#fff d="M 19.6 31.8 C 20.202 31.629 21.15 31.7 21.8 31.7 C 21.8 31.7 25.2 31.7 25.2 31.7 C 25.946 31.701 26.758 31.783 27.4 32.197 C 28.175 32.696 28.665 33.58 28.696 34.5 C 28.706 34.813 28.673 35.585 28.357 35.743 C 28.214 35.814 27.866 35.8 27.7 35.8 C 27.7 35.8 9.9 35.8 9.9 35.8 C 9.191 35.799 8.376 35.709 7.804 35.247 C 6.823 34.455 6.897 32.9 7.902 32.164 C 8.466 31.75 9.414 31.701 10.1 31.7 C 10.1 31.7 13.8 31.7 13.8 31.7 C 14.047 31.7 14.369 31.72 14.59 31.598 C 14.953 31.397 15.73 29.851 16 29.4 C 16 29.4 20.339 21.9 20.339 21.9 C 20.339 21.9 21.251 20.3 21.251 20.3 C 21.415 20.004 21.587 19.75 21.491 19.4 C 21.43 19.182 21.073 18.625 20.94 18.4 C 20.94 18.4 20.28 17.2 20.28 17.2 C 19.687 16.195 19.266 15.813 19.302 14.6 C 19.315 14.128 19.42 13.797 19.753 13.447 C 20.712 12.435 22.231 12.715 22.991 13.801 C 23.178 14.07 23.697 15.196 24 15.196 C 24.33 15.196 24.83 14.107 25.011 13.829 C 25.814 12.599 27.64 12.405 28.466 13.704 C 29.159 14.796 28.533 15.835 27.985 16.8 C 27.985 16.8 26.78 18.9 26.78 18.9 C 26.78 18.9 25.358 21.4 25.358 21.4 C 25.358 21.4 21.472 28.1 21.472 28.1 C 21.472 28.1 20.14 30.4 20.14 30.4 C 19.863 30.872 19.576 31.238 19.6 31.8 Z M 27.1 21 C 27.1 21 29.231 24.6 29.231 24.6 C 29.231 24.6 30.699 27.1 30.699 27.1 C 30.699 27.1 31.84 29.1 31.84 29.1 C 31.84 29.1 32.77 30.7 32.77 30.7 C 32.928 30.989 33.126 31.431 33.418 31.598 C 33.633 31.72 33.957 31.7 34.2 31.7 C 34.2 31.7 38.1 31.7 38.1 31.7 C 38.61 31.706 39.461 31.786 39.9 32.036 C 41.229 32.795 41.255 34.699 39.9 35.444 C 38.968 35.957 36.902 35.8 35.8 35.8 C 35.976 36.357 37.07 38.17 37.428 38.8 C 37.696 39.272 38.014 39.749 38.082 40.3 C 38.239 41.576 37.331 42.681 36 42.567 C 34.841 42.468 34.5 41.833 33.956 40.925 C 33.956 40.925 32.057 37.628 32.057 37.628 C 32.057 37.628 28.119 30.8 28.119 30.8 C 27.517 29.768 26.23 27.753 25.93 26.7 C 25.77 26.141 25.581 25.275 25.604 24.7 C 25.654 23.422 26.192 21.914 27.1 21 Z M 12.3 36.843 C 13.244 36.726 14.085 36.855 14.9 37.371 C 15.119 37.509 15.482 37.746 15.559 38.004 C 15.664 38.357 15.071 39.176 14.885 39.5 C 14.181 40.727 13.619 42.429 12 42.567 C 10.739 42.675 9.72 41.536 9.933 40.3 C 10.056 39.585 10.577 38.82 10.939 38.2 C 11.401 37.408 11.357 37.01 12.3 36.843 Z"
    class="sc-home-page" c-id=7.189.7.3></path><defs class="sc-home-page" c-id=7.190.7.4><linearGradient id=app_store_checked_icon_gradient_0
    gradientTransform=rotate(90) class="sc-home-page" c-id=7.191.8.0><stop offset=0 stop-color=#30cdfb class="sc-home-page"
    c-id=7.192.9.0></stop><stop offset=1 stop-color=#1d70f1 class="sc-home-page" c-id=7.193.9.1></stop></linearGradient></defs></svg><svg
    viewBox="0 0 52 52" width=52 height=52 class="sc-home-page" c-id=7.194.6.1><rect y=4 width=48 height=48 rx=15.29
    fill=url(#app_store_checked_icon_gradient_0) class="sc-home-page" c-id=7.195.7.0></rect><circle cx=44 cy=8
    r=6 fill=#fff class="sc-home-page" c-id=7.196.7.1></circle><path fill=#597EFF d="M44 0c-4.41 0-8 3.75-8 8.35s3.59 8.35 8 8.35 8-3.75 8-8.35S48.41 0 44 0zm4.16 5.55L43 11.97a.62.62 0 01-.46.23.6.6 0 01-.47-.21l-2.21-2.57a.65.65 0 01-.17-.47.67.67 0 01.2-.45.6.6 0 01.46-.16.6.6 0 01.42.22l1.75 2.02 4.71-5.86a.6.6 0 01.86-.07.66.66 0 01.08.9z"
    class="sc-home-page" c-id=7.197.7.2></path><path fill=#fff d="M23.1 9.25c.58-.09 2-.16 2.45.22.6.48.51 1.17.56 1.83l.09 1v3.2l-.1 1.7-.12 2.3-.3 2.9-.1 1.3c.04.39.42.47.72.66.38.23.78.6 1.07.94.42.52.74 1.23.81 1.9.04.38-.07 1.07.18 1.36.15.18.8.45 1.04.56l1.5.6 1.3.6 5.2 2.65c.85.47 2.15 1.15 2.9 1.75 1.09.88.62 1.58.08 2.58-.25.44-.46.9-.98 1.04-.63.19-1.16-.11-1.7-.38l-2-1.06-5.7-3.54-2-1.43c-.24-.18-.86-.68-1.1-.76-.39-.13-1.02.34-1.4.48-.5.2-1.07.16-1.6.15-.51 0-.83-.08-1.3-.29-.3-.14-.65-.43-1-.34-.27.06-.84.54-1.1.73l-2.3 1.64a62.96 62.96 0 01-5.4 3.35l-2.7 1.4c-1.22.44-1.67-.37-2.2-1.29-.3-.52-.56-1.11-.26-1.7.33-.63 2.18-1.67 2.86-2.02l1.3-.75 5.4-2.64 2.1-.87c.2-.1.7-.31.83-.47.17-.21.07-.58.09-.85.03-.45.19-1.19.37-1.6.24-.57.63-1.05 1.11-1.43.25-.2.83-.53.93-.8.1-.2.01-.54 0-.77l-.21-1.7-.32-4.4-.1-1.1v-4.2c0-.97 0-2.13 1.1-2.45zm2.2 2.45h-1.8c-.2 0-.46-.01-.6.16-.12.16-.1.54-.1.74 0 2.5.07 5 .32 7.5l.34 2.7c.03.25.02.74.21.9.18.14.8.1 1.03.1l.27-2.3.23-3.3.1-1.5v-5zM24 24.93c-.67.11-1.39.38-1.87.89a2.88 2.88 0 001.97 4.86c1.88.14 3.33-1.68 2.95-3.48a2.87 2.87 0 00-1.85-2.08 2.4 2.4 0 00-1.2-.2zm-3.61 4.64c-.38.05-2.35.9-2.79 1.1l-1.6.7-2.6 1.33-.9.43-1.1.64c-.3.16-1.36.73-1.57.92-.41.4.35 1.33.58 1.7.13.2.23.43.5.44.25 0 .67-.27.89-.39l1.6-.9 5.8-3.77c.3-.2 1.48-1.04 1.64-1.25.28-.36-.1-.84-.45-.95zM38.9 34.8l-1.5-.87-2.7-1.43-2.8-1.37-3.6-1.53c-.52-.13-.82.42-.8.7.03.24.32.4.5.54l1.2.88a59.99 59.99 0 005.6 3.67l2 1.14c.22.13.6.39.86.3.2-.06.35-.36.46-.53.27-.46.62-1 .78-1.5z"
    class="sc-home-page" c-id=7.198.7.3></path><circle cx=24.2 cy=27.9 r=18.7 stroke=#fff opacity=.3 fill=transparent
    class="sc-home-page" c-id=7.199.7.4></circle><path fill=#fff opacity=.3 d="M24.7 27.78s-.03.02 0 .06l.66.65c.13.19 0 .55-.37.43l-.66-.65c-.03-.04-.1-.04-.13 0l-.64.69c-.28.12-.53-.06-.45-.39l.69-.7c.02-.02 0-.06 0-.06l-.74-.74c-.07-.28.15-.51.44-.41l.7.7c.05.05.08.04.12-.01l.68-.7c.25-.12.53.14.4.4l-.7.73z"
    class="sc-home-page" c-id=7.200.7.5></path><defs class="sc-home-page" c-id=7.201.7.6><linearGradient id=app_store_checked_icon_gradient_0
    gradientTransform=rotate(90) class="sc-home-page" c-id=7.202.8.0><stop offset=0 stop-color=#30cdfb class="sc-home-page"
    c-id=7.203.9.0></stop><stop offset=1 stop-color=#1d70f1 class="sc-home-page" c-id=7.204.9.1></stop></linearGradient></defs></svg><svg
    viewBox="0 0 45 54.27" width=52 height=52 class="sc-home-page" c-id=7.205.6.2><path fill=#00C1F3 d="M0 7.25v43.94c0 .1.03.2.08.27.05.08.12.14.2.18a.45.45 0 00.52-.1l22.13-22.32L.8 6.91a.46.46 0 00-.51-.1.47.47 0 00-.21.17.5.5 0 00-.08.27z"
    class="sc-home-page" c-id=7.206.7.0></path><path fill=#00DA68 d="M32.21 20.05L4.46 4.25l-.02-.01c-.48-.27-.93.4-.54.79l21.76 21.5 6.55-6.48z"
    class="sc-home-page" c-id=7.207.7.1></path><path fill=#F93245 d="M3.9 53.42c-.4.39.06 1.06.54.79l.02-.01 27.75-15.8-6.55-6.49L3.9 53.42z"
    class="sc-home-page" c-id=7.208.7.2></path><path fill=#FFC803 d="M43.42 26.43L35.67 22l-7.29 7.21 7.29 7.2 7.75-4.4a3.26 3.26 0 000-5.6z"
    class="sc-home-page" c-id=7.209.7.3></path><circle fill=#fff cx=37 cy=8 r=6 class="sc-home-page" c-id=7.210.7.4></circle><path
    fill=#597EFF d="M37 0c-4.41 0-8 3.75-8 8.35s3.59 8.35 8 8.35 8-3.75 8-8.35S41.41 0 37 0zm4.16 5.55L36 11.97a.62.62 0 01-.46.23.6.6 0 01-.47-.21l-2.21-2.57a.65.65 0 01-.17-.47.67.67 0 01.2-.45.6.6 0 01.46-.16.6.6 0 01.42.22l1.75 2.02 4.71-5.86a.6.6 0 01.86-.07.66.66 0 01.08.9z"
    class="sc-home-page" c-id=7.211.7.5></path></svg></div><img src="/assets/push@2x.png" srcset="/assets/push.png, /assets/push@2x.png 2x"
    loading=lazy width=1568 height=1234 alt="appflow deploys screen" class="sc-home-page" c-id=7.212.5.1></div></div></div></div></section><section
    id=live class="sc-home-page" c-id=7.213.0.4><div class="ui-container sc-home-page" c-id=7.214.1.0><div
    class="text sc-home-page" c-id=7.215.2.0><h6 id="h-live-deployments" class="ui-heading ui-heading-6 sc-home-page"
    c-id=7.216.3.0><!--t.7.217.4.0-->live deployments</h6><h2 id="h-deploy-live-hot-code-updates" class="ui-heading ui-heading-2 sc-home-page"
    c-id=7.218.3.1><!--t.7.219.4.0-->Deploy live, hot code updates.</h2><p class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page"
    c-id=7.220.3.2><!--t.7.221.4.0-->Ship live app updates, content changes, A/B tests, bug fixes, beta features, and more—before or after your app is in the store. No lines, no waiting, no slowdowns.</p><ul
    class="list sc-home-page" c-id=7.222.3.3><li class="list-item sc-home-page" c-id=7.223.4.0><svg viewBox="0 0 16 16"
    width=16 height=16 class="sc-home-page" c-id=7.224.5.0><circle cx=8 cy=8 r=8 fill=#597EFF class="sc-home-page"
    c-id=7.225.6.0></circle><path d="M11 5l-4.2 6L5 8.75" fill=none stroke=#EEFEFF stroke-linecap=round
    stroke-linejoin=round class="sc-home-page" c-id=7.226.6.1></path></svg><p class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page"
    c-id=7.227.5.1><!--t.7.228.6.0-->Skip the waiting process</p></li><li class="list-item sc-home-page"
    c-id=7.229.4.1><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page" c-id=7.230.5.0><circle
    cx=8 cy=8 r=8 fill=#597EFF class="sc-home-page" c-id=7.231.6.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.232.6.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.233.5.1><!--t.7.234.6.0-->Keep users on the latest versions</p></li><li
    class="list-item sc-home-page" c-id=7.235.4.2><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.236.5.0><circle cx=8 cy=8 r=8 fill=#597EFF class="sc-home-page" c-id=7.237.6.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.238.6.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.239.5.1><!--t.7.240.6.0-->Rollback to previous versions instantly</p></li><li
    class="list-item sc-home-page" c-id=7.241.4.3><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.242.5.0><circle cx=8 cy=8 r=8 fill=#597EFF class="sc-home-page" c-id=7.243.6.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.244.6.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.245.5.1><!--t.7.246.6.0-->Run live A/B tests and control who sees what</p></li></ul></div>
    
    <phone-animator></phone-animator>
  
  </div></section>
    
    <section id=native
    class="sc-home-page" c-id=7.248.0.5><div class="ui-container sc-home-page" c-id=7.249.1.0><div class="sc-home-page"
    c-id=7.250.2.0><div class="heading-group sc-home-page" c-id=7.251.3.0><h6 id="h-native-binary-compilation"
    class="ui-heading ui-heading-6 sc-home-page" c-id=7.252.4.0><!--t.7.253.5.0-->Native binary compilation</h6><h2
    id="h-cloud-native-builds-from-a-secure-reliable-place" class="ui-heading ui-heading-2 sc-home-page"
    c-id=7.254.4.1><!--t.7.255.5.0-->Cloud native builds from a secure, reliable place.</h2><p class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page"
    c-id=7.256.4.2><!--t.7.257.5.0-->Create native app binaries in the cloud to get from code to app store with no platform dependencies or complicated build steps.</p></div><div
    class="subtext sc-home-page" c-id=7.258.3.1><svg viewBox="0 0 48 48" width=48 height=48 class="sc-home-page"
    c-id=7.259.4.0><rect fill=#BFE4FF width=48 height=48 rx=24 class="sc-home-page" c-id=7.260.5.0></rect><path
    fill=#3C67FF opacity=0.6 d="M29.75 35H13.5C11.2225 35 9.1025 34.2144 7.53063 32.7869C5.89875 31.305 5 29.25 5 27C5 24.7138 5.83688 22.7425 7.42 21.2988C8.55188 20.2657 10.0588 19.5332 11.7438 19.1819C11.8991 19.1498 12.0445 19.0812 12.1681 18.9817C12.2916 18.8823 12.3898 18.7549 12.4544 18.6101C13.0543 17.2596 13.9529 16.0629 15.0825 15.1101C16.735 13.7307 18.7812 13.0001 21 13.0001C23.4958 12.9892 25.8977 13.951 27.6963 15.6813C29.2419 17.1694 30.29 19.1363 30.77 21.4313C30.8085 21.6195 30.9005 21.7926 31.0348 21.9299C31.1691 22.0673 31.3402 22.163 31.5275 22.2057C34.375 22.8388 37 24.9019 37 28.5C37 30.5869 36.235 32.2988 34.7869 33.4519C33.5144 34.4644 31.7731 35 29.75 35Z"
    class="sc-home-page" c-id=7.261.5.1></path><path fill=#194BFD opacity=0.3 d="M38.4688 28H28.3125C26.8891 28 25.5641 27.5001 24.5816 26.5917C23.5617 25.6486 23 24.3409 23 22.9091C23 21.4542 23.523 20.1998 24.5125 19.2811C25.2199 18.6236 26.1617 18.1575 27.2148 17.934C27.3119 17.9135 27.4028 17.8698 27.48 17.8066C27.5573 17.7433 27.6186 17.6622 27.659 17.57C28.0339 16.7106 28.5956 15.9491 29.3016 15.3428C30.3344 14.465 31.6133 14.0001 33 14.0001C34.5599 13.9931 36.061 14.6052 37.1852 15.7063C38.1512 16.6533 38.8063 17.9049 39.1063 19.3654C39.1303 19.4851 39.1878 19.5953 39.2718 19.6827C39.3557 19.7701 39.4626 19.831 39.5797 19.8582C41.3594 20.2611 43 21.5739 43 23.8637C43 25.1917 42.5219 26.281 41.6168 27.0148C40.8215 27.6592 39.7332 28 38.4688 28Z"
    class="sc-home-page" c-id=7.262.5.2></path></svg><h5 id="h-leave-it-to-us" class="ui-heading ui-heading-5 sc-home-page"
    c-id=7.263.4.1><!--t.7.264.5.0-->Leave it to us</h5><p class="ui-paragraph ui-paragraph-4 ui-paragraph--body sc-home-page"
    c-id=7.265.4.2><!--t.7.266.5.0-->Turn web assets into native SDKs for iOS and Android. Appflow configures, compiles, and packages it all in the cloud, and gives you everything you need to deploy to the app stores.</p></div></div><div
    class="image sc-home-page" c-id=7.267.2.1><div class="image__wrapper sc-home-page" c-id=7.268.3.0><img
    src="/assets/native@2x.png" srcset="/assets/native.png, /assets/native@2x.png 2x" loading=lazy width=1805
    height=1177 alt="cube with floating squares entering and exiting containing programming language names"
    class="sc-home-page" c-id=7.269.4.0></div></div></div></section>
    
    <section id=automate class="sc-home-page"
    c-id=7.270.0.6><div class="ui-container sc-home-page" c-id=7.271.1.0><div class="ui-grid sc-home-page"
    c-id=7.272.2.0><div class="ui-col ui-col-12 ui-col-lg-6 sc-home-page" c-id=7.273.3.0><div class="heading-group sc-home-page"
    c-id=7.274.4.0><h6 id="h-cicd-automation" class="ui-heading ui-heading-6 sc-home-page" c-id=7.275.5.0><!--t.7.276.6.0-->CI/CD Automation</h6><h2
    id="h-automate-your-entire-app-workflow" class="ui-heading ui-heading-2 sc-home-page" c-id=7.277.5.1><!--t.7.278.6.0-->Automate your entire app workflow.</h2><p
    class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page" c-id=7.279.5.2><!--t.7.280.6.0-->Fully automate your delivery pipeline—from native binary builds to QA—in minutes using our preconfigured, smart defaults and powerful workflows, with customizability to fit your team’s unique needs.</p></div><div
    class="subtext sc-home-page" c-id=7.281.4.1><p class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page"
    c-id=7.282.5.0><!--t.7.283.6.0-->Teams using Appflow are <strong class="sc-home-page" c-id=7.284.6.1><!--t.7.285.7.0-->81% more likely to release multiple times per week</strong><!--t.7.286.6.2--> or more, compared to teams that aren’t using a CI/CD tool.</p></div></div><div
    class="ui-col ui-col-12 ui-col-lg-6 sc-home-page" c-id=7.287.3.1><pipeline-animator class="sc-home-page sc-pipeline-animator-h sc-pipeline-animator-s hydrated"
    c-id=7.288.4.0 s-id=10><!--r.10--><div class="anim-automate sc-pipeline-animator" c-id=10.0.0.0><div
    class="anim-automate_ui sc-pipeline-animator" c-id=10.1.1.0><div class="master sc-pipeline-animator" c-id=10.2.2.0><img
    src="/assets/master.png" width=200 height=60 loading=lazy alt="master branch icon" class="sc-pipeline-animator"
    c-id=10.3.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator" c-id=10.4.3.1><!--t.10.5.4.0-->Push code</p></div><div
    class="staging sc-pipeline-animator" c-id=10.6.2.1><img src="/assets/staging.png" width=220 height=60
    loading=lazy alt="staging branch icon" class="sc-pipeline-animator" c-id=10.7.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator"
    c-id=10.8.3.1><!--t.10.9.4.0-->Push code</p></div><div class="qa sc-pipeline-animator" c-id=10.10.2.2><img
    src="/assets/qa.png" width=122 height=60 loading=lazy alt="qa branch icon" class="sc-pipeline-animator"
    c-id=10.11.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator" c-id=10.12.3.1><!--t.10.13.4.0-->Push code</p></div><div
    class="android sc-pipeline-animator" c-id=10.14.2.3><img src="/assets/android.png" width=124 height=124
    loading=lazy alt="green android circle icon" class="sc-pipeline-animator" c-id=10.15.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator"
    c-id=10.16.3.1><!--t.10.17.4.0-->Trigger Android build</p></div><div class="ios sc-pipeline-animator"
    c-id=10.18.2.4><img src="/assets/ios.png" width=124 height=124 loading=lazy alt="dark gray ios circle icon"
    class="sc-pipeline-animator" c-id=10.19.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator"
    c-id=10.20.3.1><!--t.10.21.4.0-->Trigger iOS build</p></div><div class="web sc-pipeline-animator" c-id=10.22.2.5><img
    src="/assets/js.png" width=124 height=124 loading=lazy alt="yellow javascript circle icon" class="sc-pipeline-animator"
    c-id=10.23.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator" c-id=10.24.3.1><!--t.10.25.4.0-->Trigger Web build</p></div><div
    class="testflight sc-pipeline-animator" c-id=10.26.2.6><img src="/assets/testflight.png" width=106 height=106
    loading=lazy alt="blue testflight icon" class="sc-pipeline-animator" c-id=10.27.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator"
    c-id=10.28.3.1><!--t.10.29.4.0-->Deploy to TestFlight</p></div><div class="playstore sc-pipeline-animator"
    c-id=10.30.2.7><img src="/assets/playstore.png" width=100 height=110 loading=lazy alt="Google play store icon"
    class="sc-pipeline-animator" c-id=10.31.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator"
    c-id=10.32.3.1><!--t.10.33.4.0-->Deploy to Google Play</p></div><div class="webhook sc-pipeline-animator"
    c-id=10.34.2.8><img src="/assets/webhook.png" width=116 height=108 loading=lazy alt="Webhook icon" class="sc-pipeline-animator"
    c-id=10.35.3.0><p class="ui-paragraph ui-paragraph-5 ui-paragraph--body sc-pipeline-animator" c-id=10.36.3.1><!--t.10.37.4.0-->Trigger webhook</p></div></div><svg
    width=1346 height=790 xmlns="http://www.w3.org/2000/svg" class="sc-pipeline-animator" c-id=10.38.1.1><g
    transform="translate(-14 -14)" class="sc-pipeline-animator" c-id=10.39.2.0><g class="sc-pipeline-animator"
    c-id=10.40.3.0><rect class="threeC sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 1022.725 496.6375)"
    x=919.725 y=393.6375 width=206 height=206 rx=34 c-id=10.41.4.0></rect><rect class="threeB sc-pipeline-animator"
    fill=#F5F7FD transform="rotate(135 672 496.6375)" x=569 y=393.6375 width=206 height=206 rx=34 c-id=10.42.4.1></rect><rect
    class="threeA sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 321.275 496.6375)" x=218.275 y=393.6375
    width=206 height=206 rx=34 c-id=10.43.4.2></rect><rect class="twoA sc-pipeline-animator" fill=#F5F7FD
    transform="rotate(135 496.6375 321.275)" x=393.6375 y=218.275 width=206 height=206 rx=34 c-id=10.44.4.3></rect><rect
    class="twoB sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 847.3625 321.275)" x=744.3625 y=218.275
    width=206 height=206 rx=34 c-id=10.45.4.4></rect><rect class="one sc-pipeline-animator" fill=#DDE6F7
    transform="rotate(135 672 145.9126)" x=569 y=42.9126 width=206 height=206 rx=34 c-id=10.46.4.5></rect></g><path
    d="M920.4007 393.1937l28.9914 28.9914" class="connector sc-pipeline-animator" id=twoB_R stroke=#F2F6FF
    stroke-width=5 stroke-linecap=square c-id=10.47.3.1></path><path d="M774.3242 394.6079l-28.9913 28.9914" class="connector sc-pipeline-animator"
    id=twoB_L stroke=#F2F6FF stroke-width=5 stroke-linecap=square c-id=10.48.3.2></path><path d="M568.9392 395.3445l28.9914 28.9914"
    class="connector sc-pipeline-animator" id=twoA_R stroke=#F2F6FF stroke-width=5 stroke-linecap=square c-id=10.49.3.3></path><path
    d="M422.9216 393.9303l-28.9913 28.9913" class="connector sc-pipeline-animator" id=twoA_L stroke=#F2F6FF
    stroke-width=5 stroke-linecap=square c-id=10.50.3.4></path><path d="M745.0088 219.2749l28.9914 28.9914" class="connector sc-pipeline-animator"
    id=one_R stroke=#F2F6FF stroke-width=5 stroke-linecap=square c-id=10.51.3.5></path><path d="M598.2841 218.5678l-28.9914 28.9914"
    class="connector sc-pipeline-animator" id=one_L stroke=#F2F6FF stroke-width=5 stroke-linecap=square c-id=10.52.3.6></path><g
    class="sc-pipeline-animator" c-id=10.53.3.7><rect class="four sc-pipeline-animator" fill=#F5F7FD
    transform="rotate(135 1198.0874 672)" x=1095.0874 y=569 width=206 height=206 rx=34 c-id=10.54.4.0></rect><rect
    class="four sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 145.9126 672)" x=42.9126 y=569 width=206
    height=206 rx=34 c-id=10.55.4.1></rect><rect class="four sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 496.6375 672)"
    x=393.6375 y=569 width=206 height=206 rx=34 c-id=10.56.4.2></rect><rect class="four sc-pipeline-animator"
    fill=#F5F7FD transform="rotate(135 847.3625 672)" x=744.3625 y=569 width=206 height=206 rx=34 c-id=10.57.4.3></rect><rect
    class="threeC sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 1022.725 496.6375)" x=919.725 y=393.6375
    width=206 height=206 rx=34 c-id=10.58.4.4></rect><rect class="threeB sc-pipeline-animator" fill=#F5F7FD
    transform="rotate(135 672 496.6375)" x=569 y=393.6375 width=206 height=206 rx=34 c-id=10.59.4.5></rect><rect
    class="threeA sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 321.275 496.6375)" x=218.275 y=393.6375
    width=206 height=206 rx=34 c-id=10.60.4.6></rect><rect class="twoA sc-pipeline-animator" fill=#F5F7FD
    transform="rotate(135 496.6375 321.275)" x=393.6375 y=218.275 width=206 height=206 rx=34 c-id=10.61.4.7></rect><rect
    class="twoB sc-pipeline-animator" fill=#F5F7FD transform="rotate(135 847.3625 321.275)" x=744.3625 y=218.275
    width=206 height=206 rx=34 c-id=10.62.4.8></rect><rect class="one sc-pipeline-animator" fill=#DDE6F7
    transform="rotate(135 672 145.9126)" x=569 y=42.9126 width=206 height=206 rx=34 c-id=10.63.4.9></rect></g></g></svg></div></pipeline-animator></div></div></div></section><section
    id=managed class="sc-home-page" c-id=7.289.0.7><div class="ui-container sc-home-page" c-id=7.290.1.0><div
    class="text sc-home-page" c-id=7.291.2.0><h6 id="h-fully-managed-build-environments" class="ui-heading ui-heading-6 sc-home-page"
    c-id=7.292.3.0><!--t.7.293.4.0-->Fully Managed Build Environments</h6><h2 id="h-save-time-with-fully-managed-build-environments"
    class="ui-heading ui-heading-2 sc-home-page" c-id=7.294.3.1><!--t.7.295.4.0-->Save time with fully managed build environments.</h2><p
    class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page" c-id=7.296.3.2><!--t.7.297.4.0-->Managing and maintaining your own build environment means keeping up with the latest build tools, operating systems, constant patching and upgrades, and a whole lot more. With Appflow, we take care of that for you, so you can focus on your app.</p></div><div
    class="image sc-home-page" c-id=7.298.2.1><div class="image__wrapper sc-home-page" c-id=7.299.3.0><img
    src="/assets/managed@2x.png" srcset="/assets/managed.png 1x,
                          /assets/managed@2x.png 2x"
    loading=lazy width=1704 height=1511 alt="floating phone with app icons surround central Appflow icon" class="sc-home-page"
    c-id=7.300.4.0></div></div></div></section>
    
    <section id=experience class="sc-home-page" c-id=7.301.0.8><div
    class="ui-container sc-home-page" c-id=7.302.1.0><h2 class="ui-heading ui-heading-2 title sc-home-page"
    id="h-a-new-mobile-devops-experience-only-possible-with-appflow" c-id=7.303.2.0><!--t.7.304.3.0-->A new mobile DevOps experience. Only possible with Appflow.</h2><div
    class="ui-grid sc-home-page" c-id=7.305.2.1><div class="ui-col ui-col-12 ui-col-xs-12 ui-col-md-5 subtext sc-home-page"
    c-id=7.306.3.0><h4 id="h-the-mobile-devops-problem-today" class="ui-heading ui-heading-4 sc-home-page"
    c-id=7.307.4.0><!--t.7.308.5.0-->The Mobile DevOps Problem today:</h4><p class="ui-paragraph ui-paragraph-2 ui-paragraph--body sc-home-page"
    c-id=7.309.4.1><!--t.7.310.5.0-->General purpose CI/CD tools aren’t sufficient for managing the unique complexities of mobile app delivery — from maintaining mobile build environments to app store publishing and dependency management. Appflow fixes this.</p><a
    href="/why-appflow" class="cta button sc-home-page" c-id=7.311.4.2><!--t.7.312.5.0-->Why Appflow is different</a></div><div
    class="ui-col ui-col-12 ui-col-xs-12 ui-col-md-7 sc-home-page" c-id=7.313.3.1><div class="list__wrapper sc-home-page"
    c-id=7.314.4.0><ul class="list sc-home-page" c-id=7.315.5.0><li class="list-item sc-home-page" c-id=7.316.6.0><svg
    viewBox="0 0 16 16" width=16 height=16 class="sc-home-page" c-id=7.317.7.0><circle cx=8 cy=8 r=8 fill=#8C93FF
    class="sc-home-page" c-id=7.318.8.0></circle><path d="M11 5l-4.2 6L5 8.75" fill=none stroke=#EEFEFF
    stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.319.8.1></path></svg><p class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page"
    c-id=7.320.7.1><!--t.7.321.8.0-->Convert your project files into native app binaries</p></li><li class="list-item sc-home-page"
    c-id=7.322.6.1><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page" c-id=7.323.7.0><circle
    cx=8 cy=8 r=8 fill=#8C93FF class="sc-home-page" c-id=7.324.8.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.325.8.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.326.7.1><!--t.7.327.8.0-->Connect directly to your existing git repos</p></li><li
    class="list-item sc-home-page" c-id=7.328.6.2><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.329.7.0><circle cx=8 cy=8 r=8 fill=#8C93FF class="sc-home-page" c-id=7.330.8.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.331.8.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.332.7.1><!--t.7.333.8.0-->Securely collaborate and share projects with team members</p></li><li
    class="list-item sc-home-page" c-id=7.334.6.3><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.335.7.0><circle cx=8 cy=8 r=8 fill=#8C93FF class="sc-home-page" c-id=7.336.8.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.337.8.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.338.7.1><!--t.7.339.8.0-->Manage versions across test, QA, and production environments</p></li><li
    class="list-item sc-home-page" c-id=7.340.6.4><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.341.7.0><circle cx=8 cy=8 r=8 fill=#8C93FF class="sc-home-page" c-id=7.342.8.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.343.8.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.344.7.1><!--t.7.345.8.0-->Push live app updates directly to your users</p></li><li
    class="list-item sc-home-page" c-id=7.346.6.5><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.347.7.0><circle cx=8 cy=8 r=8 fill=#8C93FF class="sc-home-page" c-id=7.348.8.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.349.8.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.350.7.1><!--t.7.351.8.0-->Publish your apps to the app stores with 1-click</p></li><li
    class="list-item sc-home-page" c-id=7.352.6.6><svg viewBox="0 0 16 16" width=16 height=16 class="sc-home-page"
    c-id=7.353.7.0><circle cx=8 cy=8 r=8 fill=#8C93FF class="sc-home-page" c-id=7.354.8.0></circle><path d="M11 5l-4.2 6L5 8.75"
    fill=none stroke=#EEFEFF stroke-linecap=round stroke-linejoin=round class="sc-home-page" c-id=7.355.8.1></path></svg><p
    class="ui-paragraph ui-paragraph-3 ui-paragraph--body sc-home-page" c-id=7.356.7.1><!--t.7.357.8.0-->Automate everything, from the moment code is checked in</p></li></ul></div></div></div></div></section>
    
    

    `}></div>
  )

}

const _Top = () => {
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
          <Breakpoint sm={true}>
            <PrismicRichText richText={top} poster paragraphLevel={2} />
          </Breakpoint>
          <Breakpoint xs={true} sm={false}>
            <PrismicRichText richText={top} paragraphLevel={2} />
          </Breakpoint>
          
          <a class="cta button" href="https://ionicframework.com/signup?source=appflow-site&product=appflow">{top__cta}</a>
        </div>
      </ResponsiveContainer>

      <div class="activator">
        <appflow-activator></appflow-activator>
      </div>
    </section>
  );
}

const _Companies = () => {
  const { companies } = state.pageData;

  return (
    <ResponsiveContainer id="companies" as="section">
      <Heading level={6}>{companies}</Heading>
      <div class="logos">
        <div class="wrapper">
          {aaaLogo({}, { width: '49.71' })}
          {amtrakLogo({}, { width: '63.78' })}
          {nasaLogo({}, { width: '71.29' })}
          {ibmLogo({}, { width: '52.53' })}
        </div>
        <div class="wrapper">
          {burgerKingLogo({}, { width: '30.32' })}
          {catLogo({}, { width: '41.27' })}
          {targetLogo({}, { width: '32' })}
        </div>
      </div>
    </ResponsiveContainer>
  );
}

const _Ship = () => {
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
        {ship__list.map(({ content }: { content: any }, i: number) => (
          <Col class="list-item" xs={12} sm={4}>
            {icons[i]}
            <PrismicRichText richText={content}/>
          </Col>
        ))}
      </Grid>
    </ResponsiveContainer>
  );
}
    
const _Push = () => {
  const { push, push__list } = state.pageData;

  const icons: HTMLElement[] = [
    publishingIcon({}, { width: 48, height: 48 }),
    appleCloudIcon({}, { width: 48, height: 48 })
  ]

  return (
    <section id="push">
      <div class="push__wrapper">
        <ResponsiveContainer>
          <Grid>
            <Col class="text" cols={12} sm={6}>
              <div class="heading-group">
                <PrismicRichText richText={push} paragraphLevel={2} />
              </div>
              <ul class="list">
                {push__list.map(({ content }: { content: any }, i: number) => (
                  <li class="list-item">
                    {icons[i]}
                    <PrismicRichText richText={content} paragraphLevel={4}/>
                  </li>
                ))}
              </ul>
            </Col>
            <Col class="image" cols={12} sm={6}> 
              <div class="icons">
                {appleStoreCheckedIcon({}, { width: 52, height: 52 })}
                {testflightLogo({}, { width: 52, height: 52 })}
                {googleStoreCheckedIcon({}, { width: 52, height: 52 })}
              </div>
              <img
                src={getAssetPath('./assets/push@2x.png')}
                srcset={`${getAssetPath('./assets/push.png')}, ${getAssetPath('./assets/push@2x.png')} 2x`}
                loading="lazy"
                width="1568"
                height="1234"
                alt="appflow deploys screen"
              />
            </Col>
          </Grid>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

const _Live = () => {
  const { live, live__list } = state.pageData;

  return (
    <section id="live">
      <ResponsiveContainer>
        <div class="text">
          <PrismicRichText richText={live} paragraphLevel={2} />
          <ul class="list">
            {live__list.map(({ content }: { content: any }) => (
              <li class="list-item">
                {checkmarkCircle({}, { width: 16, height: 16})}
                <Paragraph>{content}</Paragraph>
              </li>
            ))}
          </ul>      
        </div>
        <phone-animator></phone-animator>      
      </ResponsiveContainer>
    </section>
  )
}

const _Native = () => {
  const { native, native__subtext } = state.pageData;

  return (
    <section id="native">
      <ResponsiveContainer>
        <div>
          <div class="heading-group">
            <PrismicRichText richText={native} paragraphLevel={2} />
          </div>
          <div class="subtext">
            {cloudCircleIcon({}, { width: 48, height: 48})}
            <PrismicRichText richText={native__subtext} paragraphLevel={4} />
          </div>   
        </div>    
        <div class="image"> 
          <div class="image__wrapper">
            <img
              src={getAssetPath('./assets/native@2x.png')}
              srcset={`${getAssetPath('./assets/native.png')}, ${getAssetPath('./assets/native@2x.png')} 2x`}
              loading="lazy"
              width="1805"
              height="1177"
              alt="cube with floating squares entering and exiting containing programming language names"
            />
          </div>
        </div>
      </ResponsiveContainer>
      
    </section>
  )
}

const _Automate = () => {
  const { automate, automate__subtext } = state.pageData;

  return (
    <section id="automate">
      <ResponsiveContainer>
        <Grid>
          <Col cols={12} lg={6}>
            <div class="heading-group">
              <PrismicRichText richText={automate} paragraphLevel={2} />
            </div>
            <div class="subtext">
              <PrismicRichText richText={automate__subtext} paragraphLevel={3} />
            </div>
          </Col>
          <Col cols={12} lg={6}>
            <pipeline-animator></pipeline-animator>
          </Col>
        </Grid>        
      </ResponsiveContainer>
    </section>
  )
}

const _Managed = () => {
  const { managed } = state.pageData;

  return (
    <section id="managed">
      <ResponsiveContainer>
        <div class="text">
          <PrismicRichText richText={managed} paragraphLevel={2} />
        </div>
        <div class="image">
          <div class="image__wrapper">
            <img
              src={getAssetPath('./assets/managed@2x.png')}
              srcset={`${getAssetPath('./assets/managed.png')} 1x,
                      ${getAssetPath('./assets/managed@2x.png')} 2x`}
              loading="lazy"
              width="1704"
              height="1511"
              alt="floating phone with app icons surround central Appflow icon"
            />
          </div>
        </div>
      </ResponsiveContainer>
      
    </section>
  )
}

const _Experience = () => {
  const { experience__title, experience__subtext, experience__cta, experience__list } = state.pageData;

  return (
    <section id="experience">
      <ResponsiveContainer>
        <PrismicRichText class="title" richText={experience__title} />
        <Grid>
          <Col class="subtext" xs={12} md={5}>
            <PrismicRichText richText={experience__subtext} paragraphLevel={2} />
            <a href="/why-appflow" class="cta button">{experience__cta}</a>
          </Col>
          <Col xs={12} md={7}>
            <div class="list__wrapper">
              <ul class="list">
                {experience__list.map(({ content } : { content: any}) => (
                  <li class="list-item">
                    {checkmarkCircle({ main: '#8C93FF' }, { width: 16, height: 16 })}
                    <Paragraph>{content}</Paragraph>
                  </li>
                ))}
              </ul> 
            </div>
          </Col>
        </Grid>        
      </ResponsiveContainer>
    </section>
  )
}
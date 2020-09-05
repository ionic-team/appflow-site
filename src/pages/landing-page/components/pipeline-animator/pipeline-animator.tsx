import { Component, State, Element, h, Host, getAssetPath } from '@stencil/core';
import { Paragraph, IntersectionHelper } from '@ionic-internal/ionic-ds';

import { importGsap } from '../../../../global/utils/gsap';

interface TileConfigProps {
  [key: string]: {
    location: string,
    color: {
      top: string,
      bottom: string
    }
  }
}

@Component({
  tag: 'pipeline-animator',
  styleUrl: 'pipeline-animator.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class PipelineAnimator {
  private timeline!: GSAPTimeline;
  private tiles: Map<string, HTMLElement> = new Map();
  private bottomLocations: Map<string, SVGElement> = new Map();
  private topLocations: Map<string, SVGElement> = new Map();
  private connectors: Map<string, SVGElement> = new Map();

  private tileConfig: TileConfigProps = {
    master: {
      location: 'one',
      color: {
        top: '#22216A',
        bottom: '#5C59EE'
      }
    },
    staging: {
      location: 'one',
      color: {
        top: '#6D0D3D',
        bottom: '#F24199'
      }
    },
    qa: {
      location: 'one',
      color: {
        top: '#023C47',
        bottom: '#00BCDF'
      }
    },
    android: {
      location: 'twoB',
      color: {
        top: '#0F5134',
        bottom: '#7EC951'
      }
    },
    ios: {
      location: 'twoA',
      color: {
        top: '#484F5E',
        bottom: '#A9AEB7'
      }
    },
    web: {
      location: 'twoB',
      color: {
        top: '#5F5200',
        bottom: '#F6D500'
      }
    },
    playstore: {
      location: 'threeC',
      color: {
        top: '#1D5169',
        bottom: '#00F9FF'
      }
    },
    testflight: {
      location: 'threeA',
      color: {
        top: '#183F74',
        bottom: '#1AC1FA'
      }
    },
    webhook: {
      location: 'threeB',
      color: {
        top: '#4E0057',
        bottom: '#C600DC'
      }
    }
  };

  // private updatesTl;
  @Element() el!: HTMLElement;

  @State() isPaused: boolean = false;


  componentDidLoad() {
    importGsap(this.setUpAutomateAnimation);
  } 

  setIntersectionHelper() {
    IntersectionHelper.addListener(({ entries }) => {
      const e = entries.find((e) => (e.target as HTMLElement) === this.el);
      if (!e) {
        return;
      }
      if (e.intersectionRatio === 0) {
        this.timeline.pause();
      } else {
        this.timeline.play();
      }
    });
    IntersectionHelper.observe(this.el!);
  }

  animateTileIn(name: string) {
    const tile = this.tileConfig[name];
    const elTop: SVGElement = this.topLocations.get(tile.location)!;
    const elBottom: SVGElement  = this.bottomLocations.get(tile.location)!;
    const uiEl: HTMLElement = this.tiles.get(name)!;

    if (!elTop || !elBottom || !uiEl) throw new Error('tile info not found');

    gsap.to(elTop, {
      duration: 0.2, 
      fill: tile.color.top
    });

    gsap.set(elBottom, {
      fill: tile.color.bottom,
      alpha: 1
    });
    gsap.to(elBottom, {
      duration: 1.4,
      scale: 1.07,
      transformOrigin: 'center center',
      ease: Expo.easeOut
    });

    gsap.set(uiEl, {
      alpha: 0,
      y: '-40%',
      transformOrigin: 'center center',
    });

    gsap.to(uiEl, {
      duration: 0.6,
      alpha: 1,
      y: '-50%',
      ease: Expo.easeOut
    });
  }

  animateTileOut(name: string, _delay?: number){
    const tile = this.tileConfig[name];
    const elTop: SVGElement = this.topLocations.get(tile.location)!;
    const elBottom: SVGElement = this.bottomLocations.get(tile.location)!;
    const uiEl: HTMLElement = this.tiles.get(name)!;
    const delay = _delay || 0;
    const defaultColor = tile.location === 'one' ? '#DDE6F7' : '#F5F7FD';

    if (!elTop || !elBottom || !uiEl) throw new Error('tile info not found');

    gsap.to(elBottom, {
      duration: 0.3, 
      alpha: 0,
      scale: 1
    });
    gsap.to(elTop, {
      duration: 0.2,
      fill: defaultColor,
      delay: delay
    });

    gsap.to(uiEl, {
      duration: 0.3,
      alpha: 0,
      y: '-40%',
      delay: delay
    });
  }

  animateConnector(name: string, direction: 'R' | 'L'){
    const tile = this.tileConfig[name];
    const el: SVGElement = this.connectors.get(`${tile.location}_${direction}`)!;
    if (!el) throw new Error('connector not found');

    gsap.set(el, {
      stroke: tile.color.top,
      alpha: 1,
      'stroke-dashoffset': '240px'
    });
    gsap.to(el, {
      duration: 0.8,
      'stroke-dashoffset': '100px',
      delay: 0.3
    });
  }

  setUpAutomateAnimation = () => {
    this.timeline = gsap.timeline({
      defaultEase: Linear.easeNone,
      repeat: -1
    });

    this.timeline.pause();

    const sequence1 = gsap.timeline();
    sequence1
    .add(() => {
      this.animateTileIn('staging');
      this.animateConnector('staging', 'L')
      }, 1)
    .add(() => {
      this.animateTileIn('ios');
      this.animateConnector('ios', 'L')
      this.animateConnector('ios', 'R')
      }, 1.5)
    .add(() => {
      this.animateTileIn('testflight')
      this.animateTileIn('webhook');
      }, 2)
    .add(() => {
      this.animateTileOut('staging');
      this.animateTileOut('ios', 0.15);
      this.animateTileOut('testflight', 0.3);
      this.animateTileOut('webhook', 0.3);
    }, 6);

    this.timeline.add(sequence1, 0);


    const sequence2 = gsap.timeline({
      defaultEase: Linear.easeNone
    });
    sequence2
    .add(() => {
      this.animateTileIn('qa');
      this.animateConnector('qa', 'R')
      }, 1)
    .add(() => {
      this.animateTileIn('web');
      this.animateConnector('web', 'L')
      }, 1.5)
    .add(() => {
      this.animateTileIn('webhook');
      }, 2)
    .add(() => {
      this.animateTileOut('qa');
      this.animateTileOut('web', 0.15);
      this.animateTileOut('webhook', 0.3);
    }, 6);

    this.timeline.add(sequence2, 6);


    const sequence3 = gsap.timeline({
      defaultEase: Linear.easeNone
    })
    sequence3
    .add(() => {
      this.animateTileIn('master');
      this.animateConnector('master', 'R')
      }, 1)
    .add(() => {
      this.animateTileIn('android');
      this.animateConnector('android', 'R')
      this.animateConnector('android', 'L')
      }, 1.5)
    .add(() => {
      this.animateTileIn('playstore');
      this.animateTileIn('webhook');
      }, 2)
    .add(() => {
      this.animateTileOut('master');
      this.animateTileOut('android', 0.15);
      this.animateTileOut('playstore', 0.3);
      this.animateTileOut('webhook', 0.3);
    }, 6);

    this.timeline.add(sequence3, 12);

    this.setIntersectionHelper();
  }

  render() {
    return (
    <Host>
      <div class="anim-automate">
        <div class="anim-automate_ui">
          <div class="master" ref={e => this.tiles.set('master', e!)}>
            <img src={getAssetPath('assets/master.png')} width="200" height="60" loading="lazy" alt="master branch icon"/>
            <Paragraph level={5}>Push code</Paragraph>
          </div>
          <div class="staging" ref={e => this.tiles.set('staging', e!)}>
            <img src={getAssetPath('assets/staging.png')} width="220" height="60" loading="lazy" alt="staging branch icon"/>
            <Paragraph level={5}>Push code</Paragraph>
          </div>
          <div class="qa" ref={e => this.tiles.set('qa', e!)}>
            <img src={getAssetPath('assets/qa.png')} width="122" height="60" loading="lazy" alt="qa branch icon"/>
            <Paragraph level={5}>Push code</Paragraph>
          </div>
          <div class="android" ref={e => this.tiles.set('android', e!)}>
            <img src={getAssetPath('assets/android.png')} width="124" height="124" loading="lazy" alt="green android circle icon"/>
            <Paragraph level={5}>Trigger Android build</Paragraph>
          </div>
          <div class="ios" ref={e => this.tiles.set('ios', e!)}>
            <img src={getAssetPath('assets/ios.png')} width="124" height="124" loading="lazy" alt="dark gray ios circle icon"/>
            <Paragraph level={5}>Trigger iOS build</Paragraph>
          </div>
          <div class="web" ref={e => this.tiles.set('web', e!)}>
            <img src={getAssetPath('assets/js.png')} width="124" height="124" loading="lazy" alt="yellow javascript circle icon"/>
            <Paragraph level={5}>Trigger Web build</Paragraph>
          </div>
          <div class="testflight" ref={e => this.tiles.set('testflight', e!)}>
            <img src={getAssetPath('assets/testflight.png')} width="106" height="106" loading="lazy" alt="blue testflight icon"/>
            <Paragraph level={5}>Deploy to TestFlight</Paragraph>
          </div>
          <div class="playstore" ref={e => this.tiles.set('playstore', e!)}>
            <img src={getAssetPath('assets/playstore.png')} width="100" height="110" loading="lazy" alt="Google play store icon"/>
            <Paragraph level={5}>Deploy to Google Play</Paragraph>
          </div>
          <div class="webhook" ref={e => this.tiles.set('webhook', e!)}>
            <img src={getAssetPath('assets/webhook.png')} width="116" height="108" loading="lazy" alt="Webhook icon"/>
            <Paragraph level={5}>Trigger webhook</Paragraph></div>
        </div>
        <svg width="1346" height="790" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(-14 -14)">
            <g>
              <rect class="threeC" ref={e => this.bottomLocations.set('threeC', e!)} fill="#F5F7FD" transform="rotate(135 1022.725 496.6375)" x="919.725" y="393.6375" width="206" height="206" rx="34"/>
              <rect class="threeB" ref={e => this.bottomLocations.set('threeB', e!)} fill="#F5F7FD" transform="rotate(135 672 496.6375)" x="569" y="393.6375" width="206" height="206" rx="34"/>
              <rect class="threeA" ref={e => this.bottomLocations.set('threeA', e!)} fill="#F5F7FD" transform="rotate(135 321.275 496.6375)" x="218.275" y="393.6375" width="206" height="206" rx="34"/>
              <rect class="twoA" ref={e => this.bottomLocations.set('twoA', e!)} fill="#F5F7FD" transform="rotate(135 496.6375 321.275)" x="393.6375" y="218.275" width="206" height="206" rx="34"/>
              <rect class="twoB" ref={e => this.bottomLocations.set('twoB', e!)} fill="#F5F7FD" transform="rotate(135 847.3625 321.275)" x="744.3625" y="218.275" width="206" height="206" rx="34"/>
              <rect class="one" ref={e => this.bottomLocations.set('one', e!)} fill="#DDE6F7" transform="rotate(135 672 145.9126)" x="569" y="42.9126" width="206" height="206" rx="34"/>
            </g>

            <path d="M920.4007 393.1937l28.9914 28.9914" class="connector" id="twoB_R" ref={e => this.connectors.set('twoB_R', e!)} stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
            <path d="M774.3242 394.6079l-28.9913 28.9914" class="connector" id="twoB_L" ref={e => this.connectors.set('twoB_L', e!)} stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
            <path d="M568.9392 395.3445l28.9914 28.9914" class="connector" id="twoA_R" ref={e => this.connectors.set('twoA_R', e!)} stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
            <path d="M422.9216 393.9303l-28.9913 28.9913" class="connector" id="twoA_L" ref={e => this.connectors.set('twoA_L', e!)} stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
            <path d="M745.0088 219.2749l28.9914 28.9914" class="connector" id="one_R" ref={e => this.connectors.set('one_R', e!)} stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
            <path d="M598.2841 218.5678l-28.9914 28.9914" class="connector" id="one_L" ref={e => this.connectors.set('one_L', e!)} stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>

            <g>
              <rect class="four" fill="#F5F7FD" transform="rotate(135 1198.0874 672)" x="1095.0874" y="569" width="206" height="206" rx="34"/>
              <rect class="four" fill="#F5F7FD" transform="rotate(135 145.9126 672)" x="42.9126" y="569" width="206" height="206" rx="34"/>
              <rect class="four" fill="#F5F7FD" transform="rotate(135 496.6375 672)" x="393.6375" y="569" width="206" height="206" rx="34"/>
              <rect class="four" fill="#F5F7FD" transform="rotate(135 847.3625 672)" x="744.3625" y="569" width="206" height="206" rx="34"/>
              <rect class="threeC" ref={e => this.topLocations.set('threeC', e!)} fill="#F5F7FD" transform="rotate(135 1022.725 496.6375)" x="919.725" y="393.6375" width="206" height="206" rx="34"/>
              <rect class="threeB" ref={e => this.topLocations.set('threeB', e!)} fill="#F5F7FD" transform="rotate(135 672 496.6375)" x="569" y="393.6375" width="206" height="206" rx="34"/>
              <rect class="threeA" ref={e => this.topLocations.set('threeA', e!)} fill="#F5F7FD" transform="rotate(135 321.275 496.6375)" x="218.275" y="393.6375" width="206" height="206" rx="34"/>
              <rect class="twoA" ref={e => this.topLocations.set('twoA', e!)} fill="#F5F7FD" transform="rotate(135 496.6375 321.275)" x="393.6375" y="218.275" width="206" height="206" rx="34"/>
              <rect class="twoB" ref={e => this.topLocations.set('twoB', e!)} fill="#F5F7FD" transform="rotate(135 847.3625 321.275)" x="744.3625" y="218.275" width="206" height="206" rx="34"/>
              <rect class="one" ref={e => this.topLocations.set('one', e!)} fill="#DDE6F7" transform="rotate(135 672 145.9126)" x="569" y="42.9126" width="206" height="206" rx="34"/>
            </g>
          </g>
        </svg>
      </div>
    </Host>
  )}
}
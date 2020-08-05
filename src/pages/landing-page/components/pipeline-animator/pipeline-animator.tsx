import { Component, State, Element, h } from '@stencil/core';
import { Paragraph } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'pipeline-animator',
  styleUrl: 'pipeline-animator.scss',
  scoped: true,
  assetsDir: 'img-pipeline-animator'
})
export class PipelineAnimator {
  private gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';

  private tileConfig = {
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

  private bottomEl: SVGElement;
  private topEl: SVGElement;
  private stageEl: HTMLElement;

  // private updatesTl;
  @Element() el: HTMLElement;

  @State() isPaused: boolean = false;


  componentWillLoad() {
    this.importGsap();
  } 

  importGsap() {    
    const script = document.createElement('script');
    script.src = this.gsapCdn;

    script.onload = () => {
      if (window) {
        this.setupAutomateAnimation();
      } else {
        window.onload = this.setupAutomateAnimation;
      }
    }
    script.onerror = () => console.error('error loading gsap library from: ', this.gsapCdn);      

    document.body.appendChild(script);  
  }

  animateTileIn(name) {
    var tile = this.tileConfig[name];
    var elTop = this.topEl.querySelector('.' + tile.location);
    var elBottom = this.bottomEl.querySelector('.' + tile.location);
    var uiEl = this.stageEl.querySelector('.' + name);

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
      // alpha: 0,
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

  animateTileOut(name, _delay?){
    var tile = this.tileConfig[name];
    var elTop = this.topEl.querySelector('.' + tile.location);
    var elBottom = this.bottomEl.querySelector('.' + tile.location);
    var uiEl = this.stageEl.querySelector('.' + name);
    var delay = _delay || 0;
    var defaultColor = tile.location === 'one' ? '#DDE6F7' : '#F5F7FD';

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

  animateConnector(name, direction){
      var tile = this.tileConfig[name];
      var el = this.stageEl.querySelector('#' + tile.location + '_' + direction);

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

  setupAutomateAnimation() {
    const automateTl = gsap.timeline({
      defaultEase: Linear.easeNone,
      onComplete: function(){
        automateTl.restart();
      }
    });

    automateTl.pause();

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

    automateTl.add(sequence1, 0);


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

    automateTl.add(sequence2, 6);


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

    automateTl.add(sequence3, 12);

    automateTl.play();
  }

  render() {
    return (
    <div class="anim-automate" ref={e => this.stageEl = e}>
      <div class="anim-automate_ui">
        <div class="master"><Paragraph level={5}>Push code</Paragraph></div>
        <div class="staging"><Paragraph level={5}>Push code</Paragraph></div>
        <div class="qa"><Paragraph level={5}>Push code</Paragraph></div>
        <div class="android"><Paragraph level={5}>Trigger Android build</Paragraph></div>
        <div class="ios"><Paragraph level={5}>Trigger iOS build</Paragraph></div>
        <div class="web"><Paragraph level={5}>Trigger Web build</Paragraph></div>
        <div class="testflight"><Paragraph level={5}>Deploy to TestFlight</Paragraph></div>
        <div class="playstore"><Paragraph level={5}>Deploy to Google Play</Paragraph></div>
        <div class="webhook"><Paragraph level={5}>Trigger webhook</Paragraph></div>
      </div>
      <svg width="1346" height="790" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-14 -14)">
          <g ref={e => this.bottomEl = e} >
            <rect class="threeC" fill="#F5F7FD" transform="rotate(135 1022.725 496.6375)" x="919.725" y="393.6375" width="206" height="206" rx="34"/>
            <rect class="threeB" fill="#F5F7FD" transform="rotate(135 672 496.6375)" x="569" y="393.6375" width="206" height="206" rx="34"/>
            <rect class="threeA" fill="#F5F7FD" transform="rotate(135 321.275 496.6375)" x="218.275" y="393.6375" width="206" height="206" rx="34"/>
            <rect class="twoA" fill="#F5F7FD" transform="rotate(135 496.6375 321.275)" x="393.6375" y="218.275" width="206" height="206" rx="34"/>
            <rect class="twoB" fill="#F5F7FD" transform="rotate(135 847.3625 321.275)" x="744.3625" y="218.275" width="206" height="206" rx="34"/>
            <rect class="one" fill="#DDE6F7" transform="rotate(135 672 145.9126)" x="569" y="42.9126" width="206" height="206" rx="34"/>
          </g>

          <path d="M920.4007 393.1937l28.9914 28.9914" class="connector" id="twoB_R" stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
          <path d="M774.3242 394.6079l-28.9913 28.9914" class="connector" id="twoB_L" stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
          <path d="M568.9392 395.3445l28.9914 28.9914" class="connector" id="twoA_R" stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
          <path d="M422.9216 393.9303l-28.9913 28.9913" class="connector" id="twoA_L" stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
          <path d="M745.0088 219.2749l28.9914 28.9914" class="connector" id="one_R" stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>
          <path d="M598.2841 218.5678l-28.9914 28.9914" class="connector" id="one_L" stroke="#F2F6FF" stroke-width="5" stroke-linecap="square"/>

          <g ref={e => this.topEl = e}>
            <rect class="four" fill="#F5F7FD" transform="rotate(135 1198.0874 672)" x="1095.0874" y="569" width="206" height="206" rx="34"/>
            <rect class="four" fill="#F5F7FD" transform="rotate(135 145.9126 672)" x="42.9126" y="569" width="206" height="206" rx="34"/>
            <rect class="four" fill="#F5F7FD" transform="rotate(135 496.6375 672)" x="393.6375" y="569" width="206" height="206" rx="34"/>
            <rect class="four" fill="#F5F7FD" transform="rotate(135 847.3625 672)" x="744.3625" y="569" width="206" height="206" rx="34"/>
            <rect class="threeC" fill="#F5F7FD" transform="rotate(135 1022.725 496.6375)" x="919.725" y="393.6375" width="206" height="206" rx="34"/>
            <rect class="threeB" fill="#F5F7FD" transform="rotate(135 672 496.6375)" x="569" y="393.6375" width="206" height="206" rx="34"/>
            <rect class="threeA" fill="#F5F7FD" transform="rotate(135 321.275 496.6375)" x="218.275" y="393.6375" width="206" height="206" rx="34"/>
            <rect class="twoA" fill="#F5F7FD" transform="rotate(135 496.6375 321.275)" x="393.6375" y="218.275" width="206" height="206" rx="34"/>
            <rect class="twoB" fill="#F5F7FD" transform="rotate(135 847.3625 321.275)" x="744.3625" y="218.275" width="206" height="206" rx="34"/>
            <rect class="one" fill="#DDE6F7" transform="rotate(135 672 145.9126)" x="569" y="42.9126" width="206" height="206" rx="34"/>
          </g>
        </g>
      </svg>
    </div>
  )}
}
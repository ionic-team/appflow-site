import { Component, State, Listen, Element, Host, h, getAssetPath, forceUpdate } from '@stencil/core';
// import { IntersectionHelper } from '@ionic-internal/ionic-ds'


@Component({
  tag: 'phone-animator',
  styleUrl: 'phone-animator.scss',
  scoped: true,
  assetsDir: 'img-phone-animator'
})
export class PhoneAnimator {
  private scriptsLoaded = 0;
  private assetPath = getAssetPath('./img-phone-animator/updates-illustration-device.png');
  private gsapCdns = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.4/TweenLite.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.4/TimelineLite.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.4/easing/EasePack.min.js'
  ];

  private updatesTl;
  @Element() el: HTMLElement;

  @State() isPaused: boolean = false;


  componentWillLoad() {
    this.importGsap();
  } 

  async importGsap() {    
    this.gsapCdns.forEach((cdn) => {
      const script = document.createElement('script');
      script.src = cdn;

      script.onload = () => {
        this.scriptsLoaded++;
        if (this.scriptsLoaded === this.gsapCdns.length) {
          customElements.whenDefined('phone-animator').then(this.setupUpdatesAnimation)
        };
      }
      script.onerror = () => console.error('error loading gsap library from: ', cdn);      
  
      document.body.appendChild(script);
    })      
  }

  start() {

  }

  setupUpdatesAnimation() {
    const foreground = document.querySelector('.anim-updates__foreground');
    const background = document.querySelector('.anim-updates__background');
    const foregroundColors = ['#5d37ff','#7b69ff', '#b9bbff', '#f9fafc' ];
    const backgroundColors = ['#5d37ff','#7b69ff', '#b9bbff', '#f9fafc' ];
    // const backgroundColors = ['#5d37ff', '#261e62', '#141631', '#0d0f1c'];
    const spacing = 208;
    let foregroundScreens = [];
    let backgroundScreens = [];
    let updatesTl;

    // create foreground screens
    for (let i=0; i < 4; i++) {
      let screen = document.createElement('div');
      screen.className = 'anim-updates__screen';
      foreground.appendChild(screen);
      TweenLite.set(screen, {
        backgroundColor: foregroundColors[i],
        y: -i * spacing + 'px'
      });
      foregroundScreens.push(screen);
    }

    // create background screens
    for (let j=0; j < 4; j++) {
      let screen = document.createElement('div');
      screen.className = 'anim-updates__screen';
      background.insertBefore(screen, background.firstChild);
      TweenLite.set(screen, {
        backgroundColor: backgroundColors[j],
        y: (j) * spacing + 'px'
      });
      backgroundScreens.push(screen);
    }

    updatesTl = new TimelineLite();
    createTimeline();
    updatesTl.pause();

    function createTimeline () {
      updatesTl.add(function(){
        for (let f=foregroundScreens.length - 1; f > 0; f--) {
          let screen = foregroundScreens[f];
          TweenLite.to(screen, 1, {
            backgroundColor: foregroundColors[f-1],
            y: - (f - 1) * spacing  + 'px',
            ease: Power3.easeInOut
          });
        }
        for (let b = 0; b < backgroundScreens.length - 1; b++) {
          let screen = backgroundScreens[b];
          TweenLite.to(screen, 1, {
            backgroundColor: backgroundColors[b+1],
            y: (b + 1) * spacing  + 'px',
            ease: Power3.easeInOut
          });
        }
      }, 0)

      updatesTl.to(foregroundScreens[0], 1, {
        backgroundColor: '#4d4668',
      }, 0.3)

      updatesTl.to(foregroundScreens[1], 0.5, {
        boxShadow: '0px 0px 0px 0 #5d37ff',
      }, 0.3)

      updatesTl.add(function(){
        let screen;

        // cleanup foreground
        foregroundScreens[0].remove();
        foregroundScreens.shift();
        screen = document.createElement('div');
        screen.style.cssText = `
          width: 298px;
          height: 924px;
          background: #5d37ff;
          position: absolute;
          top: 3px;
          left: 506px;
          transform-origin: top left;
          transform: rotateX(65.4deg) rotateY(1.4deg) rotateZ(32.9deg) skew(-2.0deg, -4.1deg);
          border-radius: 32px;
        `;
        foreground.appendChild(screen);
        TweenLite.set(screen, {
          backgroundColor: foregroundColors[3],
          y: -(3) * spacing + 'px'
        });
        foregroundScreens.push(screen);

        // cleanup background
        backgroundScreens[backgroundScreens.length - 1].remove();
        backgroundScreens.pop();
        screen = document.createElement('div');
        screen.className = 'anim-updates__screen new';
        screen.style.cssText = `
          width: 298px;
          height: 924px;
          background: #5d37ff;
          position: absolute;
          top: 3px;
          left: 506px;
          transform-origin: top left;
          transform: rotateX(65.4deg) rotateY(1.4deg) rotateZ(32.9deg) skew(-2.0deg, -4.1deg);
          border-radius: 32px;
        `;
        background.appendChild(screen);
        TweenLite.set(screen, {
          backgroundColor: backgroundColors[0],
          y: 0
        });
        backgroundScreens.unshift(screen);
      }, 1.2)

      updatesTl.add(()=>{
        updatesTl.clear();
        createTimeline();
      }, 2.4);
    }

    updatesTl.play();
  }


  render() {
    return (
    <Host
      style={{
        '--asset-path': `url('${this.assetPath}')`
      }}
    >
      <div class="anim-updates">
        
        <div class="anim-updates__root">
          <div class="anim-updates__foreground"></div>
          <div class="anim-updates__device"></div>
          <div class="anim-updates__background"></div>
        </div>
      </div>
    </Host>
    );
  }
}




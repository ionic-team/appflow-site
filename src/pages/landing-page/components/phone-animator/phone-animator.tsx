import { Component, State, Element, Host, h, getAssetPath } from '@stencil/core';
// import { IntersectionHelper } from '@ionic-internal/ionic-ds'


@Component({
  tag: 'phone-animator',
  styleUrl: 'phone-animator.scss',
  scoped: true,
  assetsDir: 'img-phone-animator'
})
export class PhoneAnimator {
  private assetPath = getAssetPath('./img-phone-animator/updates-illustration-device.png');
  private gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
  private foreground: HTMLElement;
  private background: HTMLElement;
  private foregroundColors = ['#5d37ff','#7b69ff', '#b9bbff', '#f9fafc' ];
  private backgroundColors = ['#5d37ff','#7b69ff', '#b9bbff', '#f9fafc' ];
  private spacing = 208;
  private timeline: GSAPTimeline;
  private foregroundScreens: HTMLElement[] = [];
  private backgroundScreens: HTMLElement[] = [];

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
        this.setupUpdatesAnimation();
      } else {
        window.onload = this.setupUpdatesAnimation;
      }
    }
    script.onerror = () => console.error('error loading gsap library from: ', this.gsapCdn);      

    document.body.appendChild(script);  
  }

  setupUpdatesAnimation() {
    this.timeline = gsap.timeline();

    // create foreground screens
    this.foregroundScreens.forEach((screen, i) => {
      gsap.set(screen, {
        backgroundColor: this.foregroundColors[i],
        y: -i * this.spacing
      });
    });
      

    // create background screens
    this.backgroundScreens.forEach((screen, i, arr) => {
      gsap.set(screen, {
        backgroundColor: this.backgroundColors[i],
        y: -i * this.spacing,
        z: arr.length - i
      });
    });

    this.createTimeline();
    this.timeline.play();
  }

  createTimeline() {
    this.timeline.add(() => {
      for (let f=this.foregroundScreens.length - 1; f > 0; f--) {
        let screen = this.foregroundScreens[f];
        gsap.to(screen, {
          duration: 1,
          backgroundColor: this.foregroundColors[f-1],
          y: - (f - 1) * this.spacing,
          ease: Power3.easeInOut
        });
      }
      for (let b = 0; b < this.backgroundScreens.length - 1; b++) {
        let screen = this.backgroundScreens[b];
        gsap.to(screen, {
          duration: 1,
          backgroundColor: this.backgroundColors[b+1],
          y: (b + 1) * this.spacing,
          ease: Power3.easeInOut
        });
      }
    }, 0)

    this.timeline.to(this.foregroundScreens[0], {
      duration: 1,
      backgroundColor: '#4d4668',
    }, 0.3)

    this.timeline.to(this.foregroundScreens[1], {
      duration: .5,
      boxShadow: '0px 0px 0px 0 #5d37ff',
    }, 0.3)

    this.timeline.add(() => {
      let screen;

      // cleanup foreground
      this.foregroundScreens[0].remove();
      this.foregroundScreens.shift();
      screen = document.createElement('div');
      // screen.classList.add('anim-updates__screen');
      screen.style.cssText = `
        width: 298px;
        height: 924px;
        background: #5d37ff;
        position: absolute;
        left: 506px;
        transform-origin: top left;
        transform: rotateX(65.4deg) rotateY(1.4deg) rotateZ(32.9deg) skew(-0deg, -4.1deg);
        border-radius: 32px;
      `;
      this.foreground.appendChild(screen);
      gsap.set(screen, {
        backgroundColor: this.foregroundColors[3],
        y: -(3) * this.spacing
      });
      this.foregroundScreens.push(screen);

      // cleanup background
      this.backgroundScreens[this.backgroundScreens.length - 1].remove();
      this.backgroundScreens.pop();
      screen = document.createElement('div');
      screen.className = 'anim-updates__screen new';
      screen.style.cssText = `
        width: 298px;
        height: 924px;
        background: #5d37ff;
        position: absolute;
        left: 506px;
        transform-origin: top left;
        transform: rotateX(65.4deg) rotateY(1.4deg) rotateZ(32.9deg) skew(0deg, -4.1deg);
        border-radius: 32px;
      `;
      this.background.appendChild(screen);
      gsap.set(screen, {
        backgroundColor: this.backgroundColors[0],
        y: 0
      });
      this.backgroundScreens.unshift(screen);
    }, 1.2)

    this.timeline.add(()=>{
      this.timeline.clear();
      this.createTimeline();
    }, 2.4);
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
          <div class="anim-updates__foreground" ref={e => this.foreground = e}>
            <div class="anim-updates__screen" ref={e => this.foregroundScreens.push(e)}></div>
            <div class="anim-updates__screen" ref={e => this.foregroundScreens.push(e)}></div>
            <div class="anim-updates__screen" ref={e => this.foregroundScreens.push(e)}></div>
            <div class="anim-updates__screen" ref={e => this.foregroundScreens.push(e)}></div>
          </div>
          <div class="anim-updates__device"></div>
          <div class="anim-updates__background" ref={e => this.background = e}>
            <div class="anim-updates__screen" ref={e => this.backgroundScreens.push(e)}></div>
            <div class="anim-updates__screen" ref={e => this.backgroundScreens.push(e)}></div>
            <div class="anim-updates__screen" ref={e => this.backgroundScreens.push(e)}></div>
            <div class="anim-updates__screen" ref={e => this.backgroundScreens.push(e)}></div>
          </div>
        </div>
      </div>
    </Host>
    );
  }
}




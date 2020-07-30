import { Component, State, Listen, Element, Host, h, getAssetPath, Watch, Prop } from '@stencil/core';
import { publishIcon, updatesIcon, buildsIcon, automationsIcon } from './activator-icons'
import { ResponsiveContainer, Heading, Paragraph } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'appflow-activator',
  styleUrl: 'appflow-activator.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class AppflowActivator {
  private tween: GSAPTween;
  private gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
  private screens: any = [
    {
      name: 'App Publishing',
      description: 'Publish directly to the Apple and Google App Stores.',
      icon: publishIcon,
      image: getAssetPath('./assets/screen-app-publishing.png')
    },
    {
      name: 'Live Updates',
      description: 'Send live updates to users without waiting on app store approval.',
      icon: updatesIcon,
      image: getAssetPath('./assets/screen-live-updates.png')
    },
    {
      name: 'Native Builds',
      description: 'Compile native app binaries in the cloud.',
      icon: buildsIcon,
      image: getAssetPath('./assets/screen-native-builds.png')
    },
    {
      name: 'Automations',
      description: 'Fully automate your app delivery pipeline.',
      icon: automationsIcon,
      image: getAssetPath('./assets/screen-automations.png')
    },
  ];

  @Element() el: HTMLElement;

  @State() imageList: { maxHeight: number, images: HTMLElement[] } = {
    maxHeight: 0,
    images: []
  };
  @State() currentScreen = 0;
  @State() isPaused: boolean = false;

  duration = 6;//seconds
  indicators = [];


  componentWillLoad() {
    this.importGsap();
  }

  importGsap() {
      if (window.gsap) return;
  
      const script = document.createElement('script');
      script.src = this.gsapCdn;

      script.onload = () => {
        if (!window) return window.onload = this.start;
        this.start()
      }
      script.onerror = () => console.error('error loading gsap library from: ', this.gsapCdn);      
  
      document.body.appendChild(script);
  }

  start() {    
    const indicator = this.indicators[this.currentScreen];    

    gsap.set(indicator, {
      width: 0,
      alpha: 1
    });

    this.tween = gsap.to(indicator, this.duration, {
      width: '100%',
      onComplete: () => {
        this.increment();
      }
    });
  }  

  override(index) {
    if (this.currentScreen === index) return;
    this.tween.pause();
    this.increment(index);
  }

  increment(index?) {
    gsap.to(this.indicators[this.currentScreen], {
      duration: 0.4,
      alpha: 0
    });

    if (index !== undefined) {
      this.currentScreen = index;
      this.start();
      return;
    }

    this.currentScreen = ++this.currentScreen % this.screens.length;
    this.start();
  }


  handleImageLoad(el: HTMLElement) {
    this.imageList.images.push(el);

    if (el.offsetHeight > this.imageList.maxHeight) {
      this.imageList = {
        maxHeight: el.offsetHeight,
        images: [...this.imageList.images]
      }
    }
  }

  @Listen('scroll', {target: 'window'})
  onScroll() {
    if (this.tween === null) return false;
    const rect = this.el.getBoundingClientRect();
    const isVisible = (rect.top <= window.innerHeight) && (rect.bottom >= 0);

    if (isVisible && this.isPaused) {
      this.tween.play();
      this.isPaused = false;
    }
    if (!isVisible && !this.isPaused) {
      this.tween.pause();
      this.isPaused = true;
    }
  }

  @Listen('resize', { target: 'window'})
  updateSize() {
    this.imageList = {
      maxHeight: this.imageList.images[0].offsetHeight,
      images: [...this.imageList.images]
    }
  }

  render() {
    return (
    <Host>
      <div class="app-screenshot">
        <div class="wrapper" style={{ 'height': this.imageList.maxHeight + 'px' }}>
          {this.screens.map((screen, i) =>
            <div class={`screen ${i === this.currentScreen ? 'animate-in' : 'animate-out'}`}>
              <img src={screen.image} onLoad={({target}) => this.handleImageLoad(target as HTMLElement)}/>
            </div>
          )}
        </div>
      </div>
      <div class="nav">
        <ResponsiveContainer>
          <ul>
            {this.screens.map((screen, i) =>
              <li
                class={(i === this.currentScreen) ? 'active' : 'default'}
                onMouseEnter={() => this.override(i)}>
                {screen.icon(i === this.currentScreen ? 'active' : 'default')}
                <Heading level={5}>{screen.name}</Heading>
                <Paragraph level={4}>{screen.description}</Paragraph>
                <div class="indicator" ref={(el) => this.indicators[i] = el}></div>
              </li>
            )}
          </ul>
        </ResponsiveContainer>
      </div>
    </Host>
    );
  }
}


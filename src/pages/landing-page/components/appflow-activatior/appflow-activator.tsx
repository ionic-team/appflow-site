import { Component, State, Listen, Element, h, getAssetPath } from '@stencil/core';
import { publishIcon, updatesIcon, buildsIcon, automationsIcon } from './activator-icons'


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
      description: 'Deploy live app updates in real-time.',
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

    this.currentScreen = (this.currentScreen >= this.screens.length - 1) ? 0 : this.currentScreen + 1;
    this.start();
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

  render() {
    return ([
      <div class="app-screenshot">
        {this.screens.map((screen, i) =>
          <div class={`screen ${i === this.currentScreen ? 'animate-in' : 'animate-out'}`}>
            <img src={screen.image}/>
          </div>
        )}
      </div>,
      <div class="nav">
        <div class="container">
          <ul>
            {this.screens.map((screen, i) =>
              <li
                class={(i === this.currentScreen) ? 'active' : 'default'}
                onMouseEnter={() => this.override(i)}>
                {screen.icon(i === this.currentScreen ? 'active' : 'default')}
                <h5>{screen.name}</h5>
                <p>{screen.description}</p>
                <div class="indicator" ref={(el) => this.indicators[i] = el}></div>
              </li>
            )}
          </ul>
        </div>
      </div>
    ]);
  }
}


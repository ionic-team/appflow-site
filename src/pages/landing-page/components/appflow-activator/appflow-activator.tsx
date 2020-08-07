import { Component, State, Listen, Element, Host, h, getAssetPath } from '@stencil/core';
import { publishIcon, updatesIcon, buildsIcon, automationsIcon } from './icons'
import { ResponsiveContainer, Heading, Paragraph, IntersectionHelper } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'appflow-activator',
  styleUrl: 'appflow-activator.scss',
  scoped: true,
  assetsDir: 'img-appflow-activator'
})
export class AppflowActivator {
  private gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
  private tween: GSAPTween;
  private screens: any = [
    {
      name: 'App Publishing',
      description: 'Publish directly to the Apple and Google App Stores.',
      icon: publishIcon,
      image: getAssetPath('./img-appflow-activator/screen-app-publishing.png')
    },
    {
      name: 'Live Updates',
      description: 'Send live updates to users without waiting on app store approval.',
      icon: updatesIcon,
      image: getAssetPath('./img-appflow-activator/screen-live-updates.png')
    },
    {
      name: 'Native Builds',
      description: 'Compile native app binaries in the cloud.',
      icon: buildsIcon,
      image: getAssetPath('./img-appflow-activator/screen-native-builds.png')
    },
    {
      name: 'Automations',
      description: 'Fully automate your app delivery pipeline.',
      icon: automationsIcon,
      image: getAssetPath('./img-appflow-activator/screen-automations.png')
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

  componentDidLoad() {
    IntersectionHelper.addListener(({ entries }) => {
      const e = entries.find((e) => (e.target as HTMLElement) === this.el);
      if (!this.tween || !e) {
        return;
      }

      if (e.intersectionRatio === 0) {
        this.tween.pause();
      } else {
        this.tween.play();
      }
    });
    IntersectionHelper.observe(this.el!);
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

    this.tween = gsap.to(indicator, {
      duration: this.duration,
      ease: 'none',
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

  render() {
    return (
    <Host>
      <div class="app-screenshot">
        <div class="image">
          {this.screens.map((screen, i) => (
            <img
              class={`screen ${i === this.currentScreen ? 'animate-in' : 'animate-out'}`}
              src={screen.image}
              width="1153"
              height="611"
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{'position': i !== 0 ? 'absolute' : undefined}}
            />
          ))}
        </div>
        <div class="nav">
          <ResponsiveContainer>
            <ul>
              {this.screens.map((screen, i) =>
                <li
                  class={(i === this.currentScreen) ? 'active' : 'default'}
                  onMouseEnter={() => {this.override(i); this.tween.pause()}}
                  onMouseLeave={() => this.tween.play()}>
                  {screen.icon(i === this.currentScreen ? 'active' : 'default')}                  
                  <Heading level={5}>{screen.name}</Heading>
                  <Paragraph level={4}>{screen.description}</Paragraph>
                  <div class="indicator" ref={(el) => this.indicators[i] = el}></div>
                </li>
              )}
            </ul>
          </ResponsiveContainer>
        </div>
      </div>
    </Host>
    );
  }
}


import { Component, State, Element, Host, Listen, h, getAssetPath } from '@stencil/core';
import { publishIcon, updatesIcon, buildsIcon, automationsIcon } from './assets/icons'
import { ResponsiveContainer, Heading, Paragraph, IntersectionHelper } from '@ionic-internal/ionic-ds';

import { importGsap } from '../../../../global/utils/gsap';

interface ScreenProps {
  name: string,
  description: string,
  icon: (_: 'active' | 'default') => void,
  image: string
}


@Component({
  tag: 'appflow-activator',
  styleUrl: 'appflow-activator.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class AppflowActivator {
  private tween!: GSAPTween;
  private gutter = 16;
  private screens: ScreenProps[] = [
    {
      name: 'App Publishing',
      description: 'Publish directly to the Apple and Google App Stores.',
      icon: publishIcon,
      image: getAssetPath('assets/screen-app-publishing.png')
    },
    {
      name: 'Live Updates',
      description: 'Send live updates to users without waiting on app store approval.',
      icon: updatesIcon,
      image: getAssetPath('assets/screen-live-updates.png')
    },
    {
      name: 'Native Builds',
      description: 'Compile native app binaries in the cloud.',
      icon: buildsIcon,
      image: getAssetPath('assets/screen-native-builds.png')
    },
    {
      name: 'Automations',
      description: 'Fully automate your app delivery pipeline.',
      icon: automationsIcon,
      image: getAssetPath('assets/screen-automations.png')
    },
  ];
  private maxImageWidth = 1152;
  private aspectRatio = 2400 / 1280;
  private duration = 6;//seconds
  private indicators: HTMLDivElement[] = [];

  @Element() el!: HTMLElement;
  @State() currentScreen = 0;
  @State() isPaused: boolean = false;
  @State() imageHeight = 0;

  

  componentWillLoad() {
    this.updateItemOffsets();
  }

  @Listen('resize', { target: 'window'})
  updateItemOffsets() {
    requestAnimationFrame(() => {
      const width = (document.body.offsetWidth - this.gutter * 2);
      if (width > this.maxImageWidth) {
        this.imageHeight = this.maxImageWidth / this.aspectRatio;
      } else {
        this.imageHeight = width / this.aspectRatio;
      }
    })
  }

  componentDidLoad() {
    importGsap(this.start);
  }

  setIntersectionHelper() {
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


  start = () => {    
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

    this.setIntersectionHelper();
  }  

  override(index: number) {
    if (this.currentScreen === index) return;
    this.tween.pause();
    this.increment(index);
  }

  increment(index?: number) {
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

  render = () => (
    <Host
      style={{
        '--max-image-width': this.maxImageWidth + 'px'
      }}
    >
      <div class="app-screenshot">
        <div class="images">
          <div class="images__wrapper" style={{ 'height': this.imageHeight + 'px' }}>
            {this.screens.map((screen: ScreenProps, i: number) => (
              <img
                class={`screen ${i === this.currentScreen ? 'animate-in' : 'animate-out'}`}
                src={screen.image}
                width="2400"
                height="1280"
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{'position': i !== 0 ? 'absolute' : undefined}}
                alt={screen.description}
              />
            ))}
          </div>
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
                  <div class="indicator" ref={el => this.indicators[i] = el!}></div>
                </li>
              )}
            </ul>
          </ResponsiveContainer>
        </div>
      </div>
    </Host>
  )
}


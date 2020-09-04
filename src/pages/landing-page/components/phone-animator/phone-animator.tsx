import { Component, State, Element, Host, h, getAssetPath} from '@stencil/core';
import { IntersectionHelper } from '@ionic-internal/ionic-ds'

import { importGsap } from '../../../../global/utils/gsap';


@Component({
  tag: 'phone-animator',
  styleUrl: 'phone-animator.scss',
  scoped: true,
  assetsDirs: ['assets']
})
export class PhoneAnimator {
  private foreground: SVGElement[] = []
  private background: SVGElement[] = []
  private foregroundColor = ['#5947FB', '#7870FB', '#B8BDFD', '#e2e4fe']
  private backgroundColor = ['#5947FB', '#7870FB', '#B8BDFD', 'rgba(255, 255, 255, 0)']
  private timeline!: GSAPTimeline;
  private spacing = 172;
  private screenEl!: SVGElement;


  // private updatesTl;
  @Element() el!: HTMLElement;

  @State() isPaused: boolean = false;


  componentDidLoad() {
    importGsap(this.setUpAnimation);
  } 

  setIntersectionHelper() {
    IntersectionHelper.addListener(({ entries }) => {
      const e = entries.find((e) => (e.target as HTMLElement) === this.el);
      if (!this.timeline || !e) {
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

  setUpAnimation = () => {
    this.timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.4,
      onRepeat: () => {
        this.timeline.clear()
        this.setUpTimeline();
      },
      defaults: {
        duration: 1,
        ease: Power3.easeInOut
      }
    });

    

    this.setUpTimeline();
    this.timeline.play();
  }

  setUpTimeline() {
    this.timeline.add(() => {
      for(let r = this.foreground.length - 1; r > 0; r--) {
        //set foreground
        this.timeline.set(this.foreground[r], {
          y: -r * this.spacing,
          fill: this.foregroundColor[r],
          opacity: r === this.foreground.length - 1 ? 0 : 1
        }, 0)

        //foreground animation
        this.timeline.to(this.foreground[r], {
          y: -r * this.spacing + this.spacing,
          fill: this.foregroundColor[r - 1 < 0 ? this.foreground.length - 1 : r - 1],
        }, 0)
      }

      let index = 0;
      for(let r = this.background.length - 1; r >= 0; r--) {
        //set background
        this.timeline.set(this.background[r], {
          y: index * this.spacing,
          fill: this.backgroundColor[index],
        }, 0)

        // background animation
        this.timeline.to(this.background[r], {
          y: index * this.spacing + this.spacing,
          fill: this.backgroundColor[index + 1 > this.foreground.length - 1 ? 0 : index + 1],
        }, 0)

        index ++;
      }

      this.timeline.to(this.foreground[this.foreground.length - 1], {
        opacity: 1,
        duration: .3
      }, .3)
    }, 0)

    this.timeline.set(this.foreground[0], {
      y: (this.foreground.length - 1) * this.spacing,
      fill: this.foregroundColor[this.foreground.length - 1],
      zIndex: this.foreground.length + 2,
    }, 0)
  

    this.timeline.set(this.screenEl, {
      fill: this.foregroundColor[0],
    }, 0)
    this.timeline.to(this.screenEl, {
      fill: '#4d4668',
      ease: 'normal'
    }, 0.3)
    this.timeline.set(this.screenEl, {
      fill: this.foregroundColor[0],
    }, 1.3)

    this.timeline.to(this.foreground[1], {
      duration: .5,
      boxShadow: '0px 0px 0px 0 #5d37ff',
    }, 0.3)

    this.timeline.to(this.foreground[1], {
      duration: .5,
      boxShadow: '0px 0px 0px 0 #5d37ff',
    }, 0.3)


    this.setIntersectionHelper();
  }

  render() {
    return (
    <Host>
      <svg class="foreground screen" viewBox="3.79372501373291 133.2659912109375 565.734130859375 307.3507995605469" xmlns="http://www.w3.org/2000/svg">
        <path ref={e => e ? this.foreground.push(e) : ''} opacity="0" d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
        <path ref={e => e ? this.foreground.push(e) : ''} d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
        <path ref={e => e ? this.foreground.push(e) : ''} d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
        <path ref={e => e ? this.foreground.push(e) : ''} d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
      </svg>

      <div class="iphone">
        <svg
          class="screen"
          viewBox="3.79372501373291 133.2659912109375 565.734130859375 307.3507995605469" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path ref={e => e ? this.screenEl = e: ''} fill="#5947FB" d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
        </svg>
        <img
          src={getAssetPath('assets/phone.png')}
          srcset={`${getAssetPath('assets/phone.png')} 1x,
                  ${getAssetPath('assets/phone@2x.png')} 2x`}
          loading="lazy"
          width="1780" height="1541"
          alt="floating iphone with blank screen"
        />
      </div>
      <svg class="background screen" viewBox="3.79372501373291 133.2659912109375 565.734130859375 307.3507995605469" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path ref={e => e ? this.background.push(e): ''} d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
        <path ref={e => e ? this.background.push(e): ''} d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
        <path ref={e => e ? this.background.push(e): ''} d="M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z"></path>
      </svg>
    </Host>
    );
  }
}




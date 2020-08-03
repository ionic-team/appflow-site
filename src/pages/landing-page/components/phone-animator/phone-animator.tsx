import { Component, State, Listen, Element, Host, h, getAssetPath } from '@stencil/core';
// import { IntersectionHelper } from '@ionic-internal/ionic-ds'


@Component({
  tag: 'phone-animator',
  styleUrl: 'phone-animator.scss',
  scoped: true,
  assetsDir: 'img'
})
export class PhoneAnimator {
  private gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
  private timeline: GSAPTimeline;
  private tween: GSAPTween;
  private spacing = 180;
  private screenCount = 8;
  private phoneEls: HTMLElement[] = [];
  private colorSequence = ['transparent', '#B8BDFD', '#7870FB', '#5947FB', '#7870FB', '#B8BDFD', '#e3e5fe', 'transparent']

  @Element() el: HTMLElement;

  @State() isPaused: boolean = false;


  componentWillLoad() {
    this.importGsap();
  } 

  importGsap() {
      if (window.gsap) {
        this.start();
        return;
      }
  
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
    // this.timeline = gsap.timeline({ repeat: Infinity });
    // this.timeline
    //   .to(this.phone1El, { y: 100, duration: .3, ease: Power3.easeInOut }, 2.4)

    // this.timeline.repeat(-1);
    // timeline.to()
    this.tween = gsap.to(this.phoneEls, { keyframes: [
      { y: this.calculateSpacing, duration: .3, delay: 2.4, ease: Power3.easeInOut },
      { y: this.calculateSpacing, duration: .3, delay: 2.4, ease: Power3.easeInOut },
      { y: this.calculateSpacing, duration: .3, delay: 2.4, ease: Power3.easeInOut },
      { y: this.calculateSpacing, duration: .3, delay: 2.4, ease: Power3.easeInOut },
      { y: this.calculateSpacing, duration: .3, delay: 2.4, ease: Power3.easeInOut },
      { y: this.calculateSpacing, duration: .3, delay: 2.4, ease: Power3.easeInOut },
    ]});
    this.tween.repeat(-1);
    // this.
  }  

  calculateSpacing(index, target, targets) {
    return index * this.spacing;
  }

  @Listen('scroll', {target: 'window'})
  onScroll() {
    // if (this.tween === null) return false;
    // const rect = this.el.getBoundingClientRect();
    // const isVisible = (rect.top <= window.innerHeight) && (rect.bottom >= 0);

    // if (isVisible && this.isPaused) {
    //   this.tween.play();
    //   this.isPaused = false;
    // }
    // if (!isVisible && !this.isPaused) {
    //   this.tween.pause();
    //   this.isPaused = true;
    // }
  }

  phoneOutline = (props?, color = '#5947FB') => (
    
  );


  render() {
    return (
    <Host
      style={{
        '--spacing': this.spacing + 'px'
      }}>
      <img src={getAssetPath('./img/updates-illustration-device.png')} loading="lazy" />
      <Screens count={this.screenCount} />
    </Host>
    );
  }
}

const Screens = (count) => {
  return (
    <div>
      {for(let i = 0; i < count; i++) {
        
      }}
    </div>
  )
  
}




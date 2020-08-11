import { Component, State, Element, h, Host, getAssetPath } from '@stencil/core';
import { Paragraph, IntersectionHelper } from '@ionic-internal/ionic-ds';
import { checkmarkRounded } from '../../../svgs';


@Component({
  tag: 'plan-pricing',
  styleUrl: 'plan-pricing.scss',
  assetsDirs: ['assets'],
  scoped: true,
})
export class PlanPricing {
  private hubspotCdn = '//js.hsforms.net/forms/v2.js';
  private contactModal: HTMLSiteModalElement;
  @State() planType: 'monthly' | 'yearly' = 'yearly';

  
  componentWillLoad() {
    // this.importHubspot();
  }

  // importHubspot() {
  //   if (window.hbspt) {
  //     this.createForm();
  //     return;
  //   };

  //   const script = document.createElement('script');
  //   script.src = this.hubspotCdn;

  //   script.onload = () => {
  //     if (!window) return window.onload = this.createForm;
  //     this.createForm()
  //   }
  //   script.onerror = () => console.error('error loading gsap library from: ', this.hubspotCdn);      

  //   document.body.appendChild(script);
  // }

  // createForm () {
  //   hbspt.forms.create({
  //     portalId: "3776657",
  //     formId: "a6d856c5-39f4-4725-a78f-c356d8d64ac5",
  //     css: ""
  //   });
  // }

  render() {
    return (
    <Host
      style={{
        '--checkmark-path': `url(${getAssetPath('assets/checkmark-rounded.svg')})`
      }}
    >
      <site-modal ref={e => this.contactModal = e}>
      <div class="modal collapse fade"
        id="scalePlanForm"
        tabindex="-1"
        role="dialog"
        aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body hubspot-override">
            <button type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <hgroup class="hero text-center">
              <h3>Contact us</h3>
              <p class="lg">
                Send us a detailed message and an Ionic Sales Representative will
                get back to you soon.
              </p>
            </hgroup>
          </div>
        </div>
      </div>
    </div>
      </site-modal>
      <div class="toggle">
        <span class={{ 'active': this.planType === 'monthly' }} onClick={() => this.planType = 'monthly'}>Monthly</span>
        <span class={{ 'active': this.planType === 'yearly' }} onClick={() => this.planType = 'yearly'}>Yearly (15% off)</span>
      </div>
      <div class="plans annually-active">
        <div id="plan-hobby" class="plan__card">
          <h3>Hobby</h3>
          <span class="plan__price">
            <strong>Free</strong>
          </span>
          <div class="plan__description">Perfect for proof of concepts, MVPs, and personal apps</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li>
              {checkmarkRounded()}
              <span>Manage app projects in the Appflow <strong>cloud dashboard</strong></span>              
            </li>
            <li>
              {checkmarkRounded()}
              <span>Deploy <strong>100 live updates</strong> / mo</span>
            </li>
            <li>
              {checkmarkRounded()}
              Community support
            </li>
          </ul>
          <a href="#" class="button light">Start Free <span style={{'letter-spacing': '0px'}}>-&gt;</span></a>
        </div>

        <div id="plan-starter" class="plan__card plan__card">
          <h3>Launch</h3>
          <span class="plan__price">
          <span
              class={{
                'plan__price__monthly': true,
                'active': this.planType === 'monthly'
              }}
            >
              <sup>$</sup><strong>49</strong><small>/mo</small>
            </span>
            <span
              class={{
                'plan__price__yearly': true,
                'active': this.planType === 'yearly'
              }}
            >
              <sup>$</sup><strong>42</strong><small>/mo</small>
            </span>
          </span>
          <div class="plan__description">Recommended for indie and freelance developers</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li class="plan__feature__highlight">
              {checkmarkRounded()}
              <span>All <strong>Hobby</strong> plan features, plus:</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>Deploy <strong>10K live updates</strong> / mo</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>Compile <strong>native app binaries</strong></span>
            </li>
            <li>
              {checkmarkRounded()}
              1 concurrency
            </li>
            <li>
              {checkmarkRounded()}
              Email support
            </li>
          </ul>
          <GetStartedButton />
        </div>

        <div id="plan-growth" class="plan__card">
          <h3>Growth</h3>
          <span class="plan__price">
            <span
              class={{
                'plan__price__monthly': true,
                'active': this.planType === 'monthly'
              }}
            >
              <sup>$</sup><strong>120</strong><small>/mo</small>
            </span>
            <span
              class={{
                'plan__price__yearly': true,
                'active': this.planType === 'yearly'
              }}
            >
              <sup>$</sup><strong>102</strong><small>/mo</small>
            </span>
          </span>
          <div class="plan__description">For lean dev teams and professional developers</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li class="plan__feature__highlight">
              {checkmarkRounded()}
              <span>All <strong>Launch</strong> plan features, plus:</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span><strong>Collaborate</strong> with team members and clients</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span><strong>CI/CD automation</strong> to ship continuously with mobile</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>Deploy <strong>25K live updates</strong> / mo</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>2+ <strong>concurrent builds</strong></span>
            </li>
            <li>
              {checkmarkRounded()}
              Email support
            </li>
          </ul>
          <GetStartedButton />
        </div>

        <div id="plan-scale" class="plan__card plan__card">
          <h3>Scale</h3>
          <span class="plan__price">
            <strong>Custom</strong>
          </span>
          <div class="plan__description">Tailored to businesses building mission-critical apps</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li class="plan__feature__highlight">
              {checkmarkRounded()}
              <span>All <strong>Growth</strong> plan features, plus:</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span><strong>Publish directly to app stores</strong> from your cloud dashboard</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>Scale to millions of users with <strong>custom Deploy limits</strong></span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>iOS <strong>Enterprise builds</strong></span>
            </li>
            <li>
              {checkmarkRounded()}
              <span>Custom <strong>concurrent builds</strong></span>
            </li>
            <li>
              {checkmarkRounded()}
              <span><strong>Role-Based</strong> access control</span>
            </li>
            <li>
              {checkmarkRounded()}
              <span><strong>SAML Single sign-on</strong></span>
            </li>
            <li>
              {checkmarkRounded()}
              <span><strong>Live onboarding</strong> &amp; premium Appflow product support</span>
            </li>
          </ul>
          <a class="button dark" onClick={() => this.contactModal.open = true}>Contact sales</a>
        </div>
      </div>
    </Host>
  )}
}

const GetStartedButton = () => (
  <a href="#" class="button dark">Get started</a>
)
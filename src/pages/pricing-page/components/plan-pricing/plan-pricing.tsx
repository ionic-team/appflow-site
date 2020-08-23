import { Component, State, h, Host, getAssetPath } from '@stencil/core';
import { checkmarkRounded } from '../../../../svgs';
import { Heading, Paragraph } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'plan-pricing',
  styleUrl: 'plan-pricing.scss',
  assetsDirs: ['assets'],
  scoped: true,
})
export class PlanPricing {
  private contactModal!: HTMLSiteModalElement;
  @State() planType: 'monthly' | 'yearly' = 'yearly';


  render() {
    return (
    <Host
      style={{
        '--checkmark-path': `url(${getAssetPath('assets/checkmark-rounded.svg')})`
      }}
    >
      <site-modal ref={e => this.contactModal = e!}>
        <div class="heading-group">
          <Heading>Contact us</Heading>
          <Paragraph>
            Send us a detailed message and an Ionic Sales Representative will
            get back to you soon.
          </Paragraph>
        </div>        
        <hubspot-form formId="a6d856c5-39f4-4725-a78f-c356d8d64ac5"></hubspot-form>
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
              {checkmarkRounded({}, { height: 12 })}
              <span>Manage app projects in the Appflow <strong>cloud dashboard</strong></span>              
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>Deploy <strong>100 live updates</strong> / mo</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              Community support
            </li>
          </ul>
          <a href="https://ionicframework.com/signup?source=appflow-site&product=appflow" class="button light">Start Free <span class="arrow" style={{'letter-spacing': '0px'}}>-&gt;</span></a>
        </div>

        <div id="plan-launch" class="plan__card plan__card">
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
              {checkmarkRounded({}, { height: 12 })}
              <span>All <strong>Hobby</strong> plan features, plus:</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>Deploy <strong>10K live updates</strong> / mo</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>Compile <strong>native app binaries</strong></span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              1 concurrency
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
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
              {checkmarkRounded({}, { height: 12 })}
              <span>All <strong>Launch</strong> plan features, plus:</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span><strong>Collaborate</strong> with team members and clients</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span><strong>CI/CD automation</strong> to ship continuously with mobile</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>Deploy <strong>25K live updates</strong> / mo</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>2+ <strong>concurrent builds</strong></span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
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
              {checkmarkRounded({}, { height: 12 })}
              <span>All <strong>Growth</strong> plan features, plus:</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span><strong>Publish directly to app stores</strong> from your cloud dashboard</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>Scale to millions of users with <strong>custom Deploy limits</strong></span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>iOS <strong>Enterprise builds</strong></span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span>Custom <strong>concurrent builds</strong></span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span><strong>Role-Based</strong> access control</span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
              <span><strong>SAML Single sign-on</strong></span>
            </li>
            <li>
              {checkmarkRounded({}, { height: 12 })}
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
  <a href="https://ionicframework.com/signup?source=appflow-site&product=appflow" class="button dark">Get started</a>
)
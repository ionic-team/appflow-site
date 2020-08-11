import { Component, State, Element, h, Host, getAssetPath } from '@stencil/core';
import { Paragraph, IntersectionHelper } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'plan-pricing',
  styleUrl: 'plan-pricing.scss',
  scoped: true,
})
export class PlanPricing {
  private toggleEl: HTMLElement;

  handleToggle() {
    const wasMonthlyClicked = event.target.textContent === 'Monthly';
    if (this.isMonthly === wasMonthlyClicked) return;
    this.isMonthly = wasMonthlyClicked;
    
    this.toggleEl.querySelector(`span:nth-child(${this.isMonthly ? 1 : 2})`)
        .classList.add('active');
    this.toggleEl.querySelector(`span:nth-child(${this.isMonthly ? 2 : 1})`)
        .classList.remove('active');

    requestAnimationFrame(() => {
      this.$plans.className = 
        `plans ${this.isMonthly ? 'monthly' : 'annually'}-active`
    });
  }

  render() {
    return (
    <Host>
      <div class="toggle" ref={e => this.toggleEl = e}>
        <span onClick={this.handleToggle}>Monthly</span>
        <span onClick={this.handleToggle}>Yearly (15% off)</span>
      </div>
      <div class="plans annually-active">
        <div id="plan-hobby" class="plan__card">
          <h3>Hobby</h3>
          <span class="plan__price">
            <strong>Free</strong>
          </span>
          <div class="plan__description">An easy way to start building with Ionic</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li>Manage app projects in the Ionic <strong>cloud dashboard</strong></li>
            <li>Access and post questions on Ionic <strong>Forum</strong></li>
            <li>Deploy <strong>100 live updates / mo</strong></li>
            <li>Community support</li>
          </ul>
          <a class="plan__cta btn sm light" href="/start">Start Free</a>
        </div>

        <div id="plan-starter" class="plan__card plan__card--featured">
          <div class="plan__note">Best all-in-one package value</div>
          <h3>Launch</h3>
          <span class="plan__price">
            <span class="plan__price__monthly">
              <sup>$</sup><strong>49</strong><small>/mo</small>
            </span>
            <span class="plan__price__annually">
              <sup>$</sup><strong>42</strong><small>/mo</small>
            </span>
          </span>
          <div class="plan__description">Recommended for indie and freelance developers</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li class="plan__feature__highlight">All Hobby plan features, plus:</li>
            <li><strong>Publish directly to app stores</strong> from your cloud dashboard</li>
            <li>Deploy <strong>10K live updates</strong> / mo</li>
            <li>Compile <strong>native app binaries</strong></li>
            <li>1 concurrency</li>
            <li>Email support</li>
          </ul>
          <a class="plan__cta btn sm" href="/signup?plan=developer&source=framework-{{id}}">Get started</a>
        </div>

        <div id="plan-growth" class="plan__card">
          <h3>Growth</h3>
          <span class="plan__price">
            <span class="plan__price__monthly">
              <sup>$</sup><strong>120</strong><small>/mo</small>
            </span>
            <span class="plan__price__annually">
              <sup>$</sup><strong>102</strong><small>/mo</small>
            </span>
          </span>
          <div class="plan__description">For lean dev teams and professional developers</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li class="plan__feature__highlight">All <strong>Launch</strong> plan features, plus:</li>
            <li><strong>Collaborate</strong> with team members and clients</li>
            <li><strong>CI/CD automation</strong> to ship continuously with mobile</li>
            <li>Deploy <strong>25K live updates</strong> / mo</li>
            <li>2+ <strong>concurrent builds</strong></li>
            <li>Email support</li>
          </ul>
          <a class="plan__cta btn sm" href="/signup?plan=teams&source=framework-{{id}}">Get started</a>
        </div>

        <div id="plan-scale" class="plan__card plan__card--dark">
          <h3>Scale</h3>
          <span class="plan__price">
            <strong>Custom</strong>
          </span>
          <div class="plan__description">Tailored to businesses building mission-critical apps</div>
          <div class="plan__feature__divider"></div>
          <ul class="plan__feature__list">
            <li class="plan__feature__highlight">All <strong>Growth</strong> plan features, plus:</li>
            <li>Scale to millions of users with <strong>custom Deploy limits</strong></li>
            <li>iOS <strong>Enterprise builds</strong></li>
            <li>Custom <strong>concurrent builds</strong></li>
            <li><strong>Role-Based</strong> access control</li>
            <li><strong>SAML Single sign-on</strong></li>
            <li><strong>Live onboarding</strong> &amp; premium Appflow product support</li>
          </ul>
          <a class="plan__cta btn sm navy"
            href="#"
            data-toggle="modal"
            data-target="#scalePlanForm">Contact Us</a>
        </div>
      </div>
    </Host>
  )}
}
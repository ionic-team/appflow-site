import { Component, h } from '@stencil/core';

import { Heading, ResponsiveContainer } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'pricing-table',
  styleUrl: 'pricing-table.scss',
  scoped: true,
})
export class PricingTable {

  render() {
    return (
    <ResponsiveContainer id="pricing-table" class="comparison">
      <Heading level={2}>Pick the plan that works best for you.</Heading>
      <div id="features" class="box">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <td>
                  <h3>Features</h3>
                </td>
                <th>
                  <div class="plan-wrap">
                    <h4>Hobby</h4>
                    <div class="price"><strong>Free</strong></div>
                    <a href="https://ionicframework.com/start#basics"
                      class="btn button micro"
                      id="btn-pricing-hobby">Start free</a>
                  </div>
                </th>
                <th>
                  <div class="plan-wrap">
                    <h4>Launch</h4>
                    <div class="price"><strong>$49</strong>/mo</div>
                    <a href="https://ionicframework.com/signup?source=framework-products&product=appflow"
                      class="btn button micro btn--primary"
                      id="btn-pricing-starter">Get started</a>
                  </div>
                </th>
                <th>
                  <div class="plan-wrap">
                    <h4>Growth</h4>
                    <div class="price" data-toggle="billing-team"><strong>$120</strong>/mo</div>
                    <a href="https://ionicframework.com/signup?source=framework-products&product=appflow"
                      class="button btn micro btn--primary"
                      id="btn-pricing-team">Get started</a>
                  </div>
                </th>
                <th>
                  <div class="plan-wrap">
                    <h4>Scale</h4>
                    <div class="price"><strong>Custom</strong></div>
                    <a
                      class="button btn micro btn--primary"
                      onClick={() => document.querySelector('site-modal').open = true}>Contact us</a>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th><strong>Appflow</strong></th>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>Push to app store</th>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>
                  Live app updates
                  <a class="anchor" href="#faq-live-updates">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td>100 <small>/ mo</small></td>
                <td>10,000 <small>/ mo</small></td>
                <td>25,000 <small>/ mo</small></td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th>Native app builds</th>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>
                  Concurrency limits
                  <a class="anchor" href="#faq-concurrency">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td></td>
                <td>1</td>
                <td>2</td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th>
                  CI/CD automation
                </th>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th><small>Automations</small></th>
                <td></td>
                <td></td>
                <td>4</td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th><small>Environments</small></th>
                <td></td>
                <td></td>
                <td>2</td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th><small>Configurations</small></th>
                <td></td>
                <td></td>
                <td>2</td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th>
                  iOS Enterprise builds
                  <a class="anchor" href="#faq-ios">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td></td>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>
                  Private git repos
                  <a class="anchor" href="#faq-git">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td></td>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>

              <tr>
                <th><strong>Premium Cloud Support</strong></th>
                <td colSpan={4}></td>
              </tr>
              <tr>
                <th>
                  Account &amp; Billing Support
                  <a class="anchor" href="#faq-account">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>
                  Premium Product Support
                  <a class="anchor" href="#faq-premium">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td></td>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>Live Onboarding</th>
                <td></td>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>

              <tr>
                <th><strong>Admin &amp; Security</strong></th>
                <td colSpan={4}></td>
              </tr>
              <tr>
                <th>
                  Seats included
                  <a class="anchor" href="#faq-seats">
                    <ion-icon class="help-circle" name="help-circle-outline"></ion-icon>
                  </a>
                </th>
                <td>1</td>
                <td>1</td>
                <td>2</td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th>Additional Seat Cost</th>
                <td></td>
                <td></td>
                <td>$99/Seat</td>
                <td>Contact Sales</td>
              </tr>
              <tr>
                <th>Seat Limit</th>
                <td></td>
                <td></td>
                <td>5</td>
                <td>Custom limit</td>
              </tr>
              <tr>
                <th>Single sign-on</th>
                <td></td>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
              <tr>
                <th>Role-based access</th>
                <td></td>
                <td></td>
                <td></td>
                <td><ion-icon name="checkmark-sharp"></ion-icon></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <td>
                  <a href="https://ionicframework.com/start#basics"
                    class="button btn sm light"
                    id="btn-pricing-starter">Start free</a>
                </td>
                <td>
                  <a href="https://ionicframework.com/signup?source=framework-products&product=appflow"
                    class="button btn sm dark"
                    id="btn-pricing-starter">Get started</a>
                </td>
                <td>
                  <a href="https://ionicframework.com/signup?source=framework-products&product=appflow"
                    class="button btn sm dark"
                    id="btn-pricing-team">Get started</a>
                </td>
                <td>
                  <a
                    onClick={() => document.querySelector('site-modal').open = true}
                    class="button btn sm dark"
                  >Contact us</a>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ResponsiveContainer>
    )
  }
}

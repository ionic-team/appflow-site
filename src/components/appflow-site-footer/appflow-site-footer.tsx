import { Component, h, State } from '@stencil/core';
import { ResponsiveContainer, Paragraph, Grid, Col } from '@ionic-internal/ionic-ds';
import { appflowLogoWithText, linkedInLogo, twitterLogo } from '../../svgs';
import { href } from 'stencil-router-v2';

@Component({
  tag: 'appflow-site-footer',
  styleUrl: 'appflow-site-footer.scss',
  scoped: true,
})
export class SiteFooter {
  @State() email: string = '';
  @State() isLoading: boolean = false;
  @State() hasSubmitted: boolean = false;
  @State() isValid: boolean = true;
  @State() inlineMessage: string = '';

  handleNewsletterSubmit(e: Event) {
    e.preventDefault();

    this.isLoading = true;
    
    const xhr = new XMLHttpRequest();
    const url = [
      'https://api.hsforms.com/submissions/v3/integration/submit',
      '3776657',
      '76e5f69f-85fd-4579-afce-a1892d48bb32'].join('/');
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const json = JSON.parse(xhr.responseText);
        this.inlineMessage = json.inlineMessage;
        this.isLoading = false;
        this.hasSubmitted = true;
        this.isValid = true;
      } else if (xhr.readyState == 4 && xhr.status == 400){
        this.inlineMessage = 'Please enter a valid email address.';
        this.isLoading = false;
        this.isValid = false;
      }
    };

    const hutkMatch = document.cookie.match && document.cookie.match(/hubspotutk=(.*?);/);
    const hutk = hutkMatch ? hutkMatch[1] : undefined;

    xhr.send(JSON.stringify({
      submittedAt: (new Date()).getTime(),
      fields: [
        {
          'name': 'email',
          'value': this.email
        },
        {
          'name': 'first_campaign_conversion',
          'value': 'Ionic Newsletter'
        }
      ],
      context: {
        hutk,
        'pageUri': window.location.href,
        'pageName': document.title
      }
    }))
  }

  handleEmailChange(ev: any) {
    this.email = ev.target.value;
    this.isValid = true;
  }

  handleInlineMessage(returnMessage: string) {
    const messageMatch = returnMessage.match && returnMessage.match(/<p>(.*?)<\/p>/);
    return messageMatch ? messageMatch[1] : undefined;
  }

  render() {
    return (
      <footer>
        <ResponsiveContainer class="footer__content">
          <Grid class="main">
            <Col cols={12} md={3}>
              {appflowLogoWithText({}, {width: 114, height: 24 })}
            </Col>
            <Col cols={6} xs={3} md={3}>
              <ul>
                <li class="title | ui-paragraph-5">Product</li>
                <li><a {...href('/why-appflow')} class="ui-paragraph-5">Why Appflow</a></li>
                {/* <li><a href="https://ionicframework.com/resources" class="ui-paragraph-5">Resources</a></li> */}
                <li><a {...href('/pricing')} class="ui-paragraph-5">Pricing</a></li>
                <li><a href="https://ionicframework.com/docs/appflow" class="ui-paragraph-5" target="_blank">Docs</a></li>
              </ul>
            </Col>
            <Col cols={6} xs={3} md={2}>
              <ul>
                <li class="title | ui-paragraph-5">Contact</li>
                {/* <li><a href="#" class="ui-paragraph-5">Contact Us</a></li>
                <li><a href="#" class="ui-paragraph-5">Support</a></li> */}
                <li><a href="https://twitter.com/useappflow" class="ui-paragraph-5">Twitter</a></li>
                {/* <li><a href="#" class="ui-paragraph-5">FAQ</a></li> */}
              </ul>
            </Col>
            <Col cols={12} xs={6} md={4} class="newsletter">
              <div class="wrapper">
                <div>
                  <Paragraph class="title" level={5}>Sign up for our newsletter and stay up-to-date</Paragraph>
                  <div>
                    <div class="form">
                      {this.hasSubmitted
                        ? <div class="form-message">
                            <ion-icon name="checkmark-circle"></ion-icon>
                            <Paragraph>{this.handleInlineMessage(this.inlineMessage)}</Paragraph>
                          </div>
                        : <form
                            onSubmit={(e) => this.handleNewsletterSubmit(e)}>
                            <input
                              name="email"
                              type="email"
                              value={this.email}
                              onInput={() => this.handleEmailChange(event)}
                              disabled={this.isLoading}
                              placeholder="Email address"
                              class={this.isValid ? '' : 'error'}
                              aria-label="Email"
                              required />
                            <button
                              class="button"
                              type="submit"
                              disabled={this.isLoading || this.hasSubmitted}>
                              Send
                            </button>
                            {!this.isValid &&
                            <Paragraph level={5} class="error-message">{this.inlineMessage}</Paragraph>
                            }
                          </form>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Grid>
          <Grid class="bottom">
            <Col class="start" cols={12} xs={6}>
              <span class="ui-paragraph-6">© {(new Date).getFullYear()} Appflow</span>
              <a class="ui-paragraph-6" {...href('/tos')}>Terms</a>
              <a class="ui-paragraph-6" {...href('/privacy-policy')}>Privacy</a>
            </Col>    
            <Col class="end" cols={12} xs={6}>
              <div class="social-links">
                <a class="social" href="https://www.linkedin.com/showcase/ionic-appflow/" rel="noopener nofollow" target="_blank">{linkedInLogo({ main: 'var(--c-indigo-50)' }, { height: 12 })}</a>
                <a class="social" href="https://twitter.com/useappflow" rel="noopener nofollow" target="_blank">{twitterLogo({ main: 'var(--c-indigo-50)' }, { height: 12 })}</a>
              </div>
              <span class="ui-paragraph-6">Part of the <a href="https://ionic.io/">Ionic</a> ecosystem</span>
            </Col>                    
          </Grid>          
        </ResponsiveContainer>
      </footer>
    );
  }

}

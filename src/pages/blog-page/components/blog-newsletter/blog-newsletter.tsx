import { Component, State, h, Host } from '@stencil/core';
import { Paragraph, Heading, Grid, Col } from '@ionic-internal/ionic-ds';


@Component({
  tag: 'blog-newsletter',
  styleUrl: 'blog-newsletter.scss',
  scoped: true
})
export class BlogNewsletter {
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

  render = () => (
    <Host>
      <Grid>
      <Col class="heading-group" cols={12} xs={6}>
        <Heading class="title" level={4}>Get our newsletter</Heading>
        <Paragraph level={4}>Never spam. Only the good stuff.</Paragraph>
      </Col>
      <Col cols={12}  xs={6}>
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
                class={{'error': this.isValid, 'ui-paragraph-4': true}}
                aria-label="Email"
                required />
              <button
                class="button"
                type="submit"
                disabled={this.isLoading || this.hasSubmitted}>
                <ion-icon name="arrow-forward-sharp"></ion-icon>
              </button>
              {!this.isValid &&
              <Paragraph level={5} class="error-message">{this.inlineMessage}</Paragraph>
              }
            </form>
          }
        </div>
      </Col>
      </Grid>
    </Host>
  )
}
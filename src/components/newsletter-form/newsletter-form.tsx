import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'newsletter-form',
  styleUrl: 'newsletter-form.scss',
  scoped: true
})
export class NewsletterForm {
  @State() emailInvalid: boolean = false;
  @State() emailSuccess: boolean = false;
  private emailInput: HTMLInputElement | undefined;
  private successMsg: string = 'Success. You will now receive the Ionic Newsletter!';
  
  handleSubmit = async (e: Event) => {
    e.preventDefault();
    const url: string = 'https://api.hsforms.com/submissions/v3/integration/submit/3776657/76e5f69f-85fd-4579-afce-a1892d48bb32'
    const cookie =  document.cookie.match(/(hubspotutk=).*?(?=;)/g);
    const fields = [
      {
        'name': 'email',
        'value': this.emailInput?.value
      },
      {
        'name': 'first_campaign_conversion',
        'value': 'Ionic Newsletter'
      }
    ]

    const context: { pageUri: string, pageName: string, hutk?: string} = {
      'pageUri': 'https://ionic.io',
      'pageName': 'Ionic.io Home'
    }
    cookie ? context.hutk = cookie[0].split('hubspotutk=')[1] : '';

    const data = {
      'submittedAt': Date.now(),
      'fields': fields,
      'context': context
    }
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer', 
      body: JSON.stringify(data) 
    });

    if (response.status == 200){
      this.emailSuccess = true;
    } else {
      this.emailInvalid = true;
    }
  }

  render() {
    return (
      <div>
        { !this.emailSuccess &&
        <form onSubmit={this.handleSubmit} class="newsletter__form">
          <input ref={e => this.emailInput = e} placeholder="Your email" />
          <button><ion-icon name="arrow-forward-outline"></ion-icon></button>
          { this.emailInvalid && <div class="error__message">invalid email address</div> }
        </form> }

        { this.emailSuccess &&
        <div class="success__message">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 42c11.598 0 21-9.402 21-21S32.598 0 21 0 0 9.402 0 21s9.402 21 21 21z" fill="#D3F3DB"/>
            <path d="M13.87 20.97a1.75 1.75 0 00-2.54 2.408l2.54-2.407zm3.588 6.33l-1.27 1.204a1.75 1.75 0 002.54 0l-1.27-1.204zM30.67 15.904a1.75 1.75 0 00-2.54-2.408l2.54 2.408zm-19.34 7.474l4.858 5.126 2.54-2.408-4.858-5.125-2.54 2.407zm7.398 5.126l11.942-12.6-2.54-2.408-11.942 12.6 2.54 2.408z" fill="#43C465"/>
          </svg>
          <p>{this.successMsg}</p>
        </div> }
      </div>
    );
  }
}

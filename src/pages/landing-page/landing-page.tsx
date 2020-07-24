import { Component, h, State } from '@stencil/core';

import { ResponsiveContainer, Grid, Col, Button, PrismicRichText, Heading } from '@ionic-internal/sites-shared';
import { ionicLogo, nationwideLogo, targetLogo, burgerKingLogo, usaaLogo, nbcLogo, microsoftLogo, amtrakLogo,
         generalElectricLogo, aflacLogo, eaLogo, bmwLogo, nhsLogo, aaaLogo, nasaLogo, mastercardLogo, homeDepotLogo,
         mailIcon, x, checkmark } from '../../svgs';
import { getPage } from '../../prismic';
import state from '../../store';

@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss',
})
export class LandingPage {
  private demoForm: HTMLFormElement;
  @State() emailSent: 'sent' | 'sending' | 'failed';

  async componentWillLoad() {
    await getPage('ionicio_homepage');
  }


  sendEmail = async (e: UIEvent) => {
    e.preventDefault();
    this.emailSent = 'sending';
    const { from, email, message } = this.demoForm;

    const data = {
      'from': from.value,
      'email': email.value,
      'message': message.value,
    }

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.status.toString().charAt(0) === '2') {
      this.emailSent = 'sent';
      this.demoForm.reset();
      return;
    } 

    response.status.toString().charAt(0) === '4' ? this.emailSent = 'failed' : '';
  }

  render() {
    const page = state.pageData;
    return (
      <main>
        <section id="landing">
          <ResponsiveContainer>
            <div class="landing__wrapper">
              <div class="landing__icon">
                {ionicLogo({ primary:'white', secondary: '#4164FF' })}
              </div>
              <Heading level={1}>Hi, we're Appflow.</Heading>
            </div>
          </ResponsiveContainer>
        </section>

        <section id="products">
          <ResponsiveContainer>
            <PrismicRichText richText={page.section1__title} />
            <Grid class="products__grid">
              {page.section1.map(f => (
              <Col class="grid__item" sm={6} cols={12}>
                <PrismicRichText richText={f.content} />
              </Col> ))}
            </Grid>
          </ResponsiveContainer>
        </section>

        <section id="who">
          <ResponsiveContainer>
          <PrismicRichText richText={page.section2__title} />
            <Grid>
              {page.section2.map(f => (
              <Col xs={6}  sm={4} cols={12}>
                <PrismicRichText richText={f.content}/>
              </Col> ))}
            </Grid>
          </ResponsiveContainer>
        </section>
        
        <section id="about">
          <ResponsiveContainer>
            <PrismicRichText richText={page.section3__title} />
            <div class="about__content">
              <div class="paragraph__group">
                {page.section3__left.map(f => (
                  <PrismicRichText richText={f.content} />
                ))}
              </div>
              <div class="paragraph__group">
                {page.section3__right.map(f => (
                  <PrismicRichText richText={f.content} />
                ))}
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        <section id="users">
          <ResponsiveContainer>
            <PrismicRichText richText={page.section4__title} />
            <Grid>
              <Col sm={6} cols={12}>
                <div>{nationwideLogo({ primary:'white' })}</div>
                <div>{targetLogo({ primary:'white' })}</div>
                <div>{burgerKingLogo({ primary:'white' })}</div>
                <div>{usaaLogo({ primary:'white' })}</div>
                <div class="spacer"></div>
              </Col>
              <Col sm={6} cols={12}>
                <div>{nbcLogo({ primary:'white' })}</div>
                <div>{microsoftLogo({ primary:'white' })}</div>
                <div>{amtrakLogo({ primary:'white' })}</div>
                <div>{generalElectricLogo({ primary:'white' })}</div>
                <div class="spacer"></div>
              </Col>
              <Col sm={6} cols={12}>
                <div>{aflacLogo({ primary:'white' })}</div>
                <div>{eaLogo({ primary:'white' })}</div>
                <div>{bmwLogo({ primary:'white' })}</div>
                <div>{nhsLogo({ primary:'white' })}</div>
                <div class="spacer"></div>
              </Col>
              <Col sm={6} cols={12}>
                <div>{aaaLogo({ primary:'white' })}</div>
                <div>{nasaLogo({ primary:'white' })}</div>
                <div>{mastercardLogo({ primary:'white' })}</div>
                <div>{homeDepotLogo({ primary:'white' })}</div>
                <div class="spacer"></div>
              </Col>
            </Grid>
          </ResponsiveContainer>
        </section>

        <section id="demo">
          <ResponsiveContainer>
            <PrismicRichText richText={page.section5__title} />
              <div class="demo__content">
                <form class="demo__form" method="POST" onSubmit={this.sendEmail} ref={e => this.demoForm = e}>
                  <div class="form__row1">
                    <Grid>
                      <Col xs={6} cols={12}>
                        <input aria-label="your name" placeholder="Your name" name="from" type="text" required/>
                      </Col>
                      <Col xs={6} cols={12}>
                        <input aria-label="your email" placeholder="Your email" name="email" type="email" required/> 
                      </Col>
                    </Grid>
                  </div>
                  <textarea aria-label="your message" name="message" placeholder="Your message" required></textarea>
                  <div class="form__submit">
                    <span class="submit__confirmation">
                      { this.emailSent === 'sent' ? checkmark({ primary: '#42ff7e' }) : ''}
                      { this.emailSent === 'failed' ? x({ primary: '#ff4f42' }) : ''}
                    </span>
                    <Button disabled={this.emailSent === 'sending'}>Send Message<ion-icon name="arrow-forward-outline"></ion-icon></Button>
                  </div>
                </form>
                <div class="demo__aside">
                  <PrismicRichText richText={page.section5__listtitle} />
                  {page.section5__list.map(li => (
                  <li><ion-icon name="arrow-forward-outline"></ion-icon>{li.text}</li>
                  ))}
                </div>
              </div>
          </ResponsiveContainer>
        </section>

        <section id="newsletter">
          <ResponsiveContainer>
            <Grid>
              <Col md={8} cols={12} class="newsletter__content">
                <div class="content__icon">
                  {mailIcon({ primary: '#7CABFF', secondary: '#BAD2FF', tertiary: '#EFF8FF' })}
                </div>
                <div>
                  <PrismicRichText richText={page.section6__title} />
                  <PrismicRichText richText={page.section6__text} />
                </div>
              </Col>
              <Col md={4} cols={12}>
                <newsletter-form></newsletter-form>
              </Col>
            </Grid>
          </ResponsiveContainer>
        </section>
      </main>
    );
  }
}
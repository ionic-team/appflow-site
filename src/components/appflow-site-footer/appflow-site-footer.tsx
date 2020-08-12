import { Component, h } from '@stencil/core';
import { ResponsiveContainer, Paragraph, Grid, Col } from '@ionic-internal/ionic-ds';
import { appflowLogoWithText, linkedInLogo, twitterLogo } from '../../svgs';

@Component({
  tag: 'appflow-site-footer',
  styleUrl: 'appflow-site-footer.scss',
  scoped: true,
})
export class SiteFooter {
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
                <li><a href="/why-appflow" class="ui-paragraph-5">Why Appflow</a></li>
                <li><a href="#" class="ui-paragraph-5">Resources</a></li>
                <li><a href="/pricing" class="ui-paragraph-5">Pricing</a></li>
                <li><a href="https://ionicframework.com/docs/appflow" class="ui-paragraph-5">Docs</a></li>
              </ul>
            </Col>
            <Col cols={6} xs={3} md={2}>
              <ul>
                <li class="title | ui-paragraph-5">Contact</li>
                <li><a href="#" class="ui-paragraph-5">Contact Us</a></li>
                <li><a href="#" class="ui-paragraph-5">Support</a></li>
                <li><a href="https://twitter.com/useappflow" class="ui-paragraph-5">Twitter</a></li>
                <li><a href="#" class="ui-paragraph-5">FAQ</a></li>
              </ul>
            </Col>
            <Col cols={12} xs={6} md={4} class="newsletter">
              <div class="wrapper">
                <div>
                  <Paragraph class="title" level={5}>Sign up for our newsletter and stay up-to-date</Paragraph>
                  <div>
                    <hubspot-form formId="76e5f69f-85fd-4579-afce-a1892d48bb32"></hubspot-form>
                    {/* <form action="">
                      <input type="text" placeholder="Email"/>
                      <button class="ui-paragraph-5">Send</button>
                    </form> */}
                  </div>
                </div>
              </div>
            </Col>
          </Grid>
          <Grid class="bottom">
            <Col class="start" cols={12} xs={6}>
              <span class="ui-paragraph-6">© {(new Date).getFullYear()} Appflow</span>
              <a class="ui-paragraph-6" href="#">Terms</a>
              <a class="ui-paragraph-6" href="#">Privacy</a>
            </Col>    
            <Col class="end" cols={12} xs={6}>
              <a href="">{linkedInLogo({ main: 'var(--c-indigo-50)' }, { height: 12 })}</a>
              <a href="">{twitterLogo({ main: 'var(--c-indigo-50)' }, { height: 12 })}</a>
              <span class="ui-paragraph-6">Part of the <a href="https://ionic.io/">Ionic</a> ecosystem</span>
            </Col>                    
          </Grid>          
        </ResponsiveContainer>
      </footer>
    );
  }

}

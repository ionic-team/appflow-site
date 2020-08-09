import { Component, h } from '@stencil/core';
import { ResponsiveContainer, Paragraph, Grid, Col } from '@ionic-internal/ionic-ds';
import { appflowLogoWithText } from '../../svgs';

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
            <Col cols={6} sm={3} md={3}>
              <ul>
                <li class="title | ui-paragraph-5">Product</li>
                <li><a href="#" class="ui-paragraph-5">Why Appflow</a></li>
                <li><a href="#" class="ui-paragraph-5">Resources</a></li>
                <li><a href="#" class="ui-paragraph-5">Pricing</a></li>
                <li><a href="#" class="ui-paragraph-5">Docs</a></li>
              </ul>
            </Col>
            <Col cols={6} sm={3} md={2}>
              <ul>
                <li class="title | ui-paragraph-5">Contact</li>
                <li><a href="#" class="ui-paragraph-5">Contact Us</a></li>
                <li><a href="#" class="ui-paragraph-5">Support</a></li>
                <li><a href="#" class="ui-paragraph-5">Twitter</a></li>
                <li><a href="#" class="ui-paragraph-5">FAQ</a></li>
              </ul>
            </Col>
            <Col cols={12} sm={6} md={4} class="newsletter">
              <Paragraph class="title" level={5}>Sign up for our newsletter and stay up-to-date</Paragraph>
              <div>
                <form action="">
                  <input type="text" placeholder="Email"/>
                  <button class="ui-paragraph-5">Send</button>
                </form>
              </div>
            </Col>
          </Grid>
          <div class="bottom">
            <div class="ui-paragraph-6">© {(new Date).getFullYear()} Appflow</div>
            <div class="ui-paragraph-6"><a href="#">Terms</a></div>
            <div class="ui-paragraph-6"><a href="#">Privacy</a></div>
            <div class="end | ui-paragraph-6">Part of the <a href="https://ionic.io/">Ionic</a> ecosystem</div>
          </div>
          
        </ResponsiveContainer>
      </footer>
    );
  }

}

import { Component, h } from '@stencil/core';
import { ResponsiveContainer, Paragraph } from '@ionic-internal/ionic-ds';
import { appflowLogoWithText } from '../../svgs';

@Component({
  tag: 'appflow-site-footer',
  styleUrl: 'appflow-site-footer.scss',
  scoped: true,
})
export class SiteFooter {
  render() {
    return (
      <footer id="footer">
        <ResponsiveContainer class="footer__content">
          <div class="main">
            {appflowLogoWithText({}, {width: 114, height: 24 })}
            <table>
              <thead>
                <tr>
                  <th scope="col" class="ui-paragraph-5">Product</th>
                  <th scope="col" class="ui-paragraph-5">Contact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><a href="#" class="ui-paragraph-5">Why Appflow</a></td>
                  <td><a href="#" class="ui-paragraph-5">Contact us</a></td>
                </tr>
                <tr>
                  <td><a href="#" class="ui-paragraph-5">Resources</a></td>
                  <td><a href="#" class="ui-paragraph-5">Support</a></td>
                </tr>
                <tr>
                  <td><a href="#" class="ui-paragraph-5">Pricing</a></td>
                  <td><a href="#" class="ui-paragraph-5">Twitter</a></td>
                </tr>
                <tr>
                  <td><a href="#" class="ui-paragraph-5">Docs</a></td>
                  <td><a href="#" class="ui-paragraph-5">FAQ</a></td>
                </tr>
              </tbody>
            </table>
            <div class="newsletter">
              <Paragraph class="title" level={5}>Sign up for our newsletter and stay up-to-date</Paragraph>
              <div>
                <form action="">
                  <input type="text" placeholder="Email"/>
                  <button class="ui-paragraph-5">Send</button>
                </form>
              </div>
            </div>
          </div>
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

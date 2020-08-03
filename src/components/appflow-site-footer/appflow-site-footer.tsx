import { Component, h } from '@stencil/core';
import { ResponsiveContainer } from '@ionic-internal/ionic-ds';
// import {twitterLogo, slackLogo, githubLogo, facebookLogo, youtubeLogo, mediumLogo, stackOverflowLogo } from '../../svgs';

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

        </ResponsiveContainer>
      </footer>
    );
  }

}

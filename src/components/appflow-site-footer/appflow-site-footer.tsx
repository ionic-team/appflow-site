import { Component, h } from '@stencil/core';
import { ResponsiveContainer } from '@ionic-internal/ionic-ds';
import {twitterLogo, slackLogo, githubLogo, facebookLogo, youtubeLogo, mediumLogo, stackOverflowLogo } from '../../svgs';

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
          <div class="content__wrapper">
            <ul class="footer__info">
              <li>&copy; {(new Date()).getFullYear()} Ionic</li>
              <li><a href="https://ionicframework.com/tos" target="_blank" rel="noopener nofollow">Terms</a></li>
              <li><a href="https://ionicframework.com/privacy" target="_blank" rel="noopener nofollow">Privacy</a></li>
            </ul>
            <ul class="footer__social">
              <li><a href="https://twitter.com/IonicFramework" target="_blank" rel="noopener nofollow">{twitterLogo({ primary: 'white' })}</a></li>
              <li><a href="https://ionicworldwide.herokuapp.com" target="_blank" rel="noopener nofollow">{slackLogo({ primary: 'white' })}</a></li>
              <li><a href="https://github.com/ionic-team" target="_blank" rel="noopener nofollow">{githubLogo({ primary: 'white' })}</a></li>
              <li><a href="https://www.facebook.com/ionicframework" target="_blank" rel="noopener nofollow">{facebookLogo({ primary: 'white' })}</a></li>
              <li><a href="https://www.youtube.com/c/Ionicframework" target="_blank" rel="noopener nofollow">{youtubeLogo({ primary: 'white' })}</a></li>
              <li><a href="https://medium.com/ionic-and-the-mobile-web" target="_blank" rel="noopener nofollow">{mediumLogo({ primary: 'white' })}</a></li>
              <li><a href="https://stackoverflow.com/questions/tagged/ionic-framework" target="_blank" rel="noopener nofollow">{stackOverflowLogo({ primary: 'white' })}</a></li>
            </ul>
          </div>
        </ResponsiveContainer>
      </footer>
    );
  }

}

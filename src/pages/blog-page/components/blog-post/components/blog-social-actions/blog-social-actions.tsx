import { Component, h, Host, Prop, State } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { twitterLogo, facebookRoundedLogo, linkedInLogo } from '../../../../../../svgs';
import Router from '../../../../../../router';


@Component({
  tag: 'blog-social-actions',
  styleUrl: 'blog-social-actions.scss',
  scoped: true
})
export class BlogSocialActions {
  private twitterUrl = [
    'http://twitter.com/intent/tweet?',
    `url=${encodeURIComponent(Router.url.toString())}`
  ];
  private facebookUrl = [
    'https://www.facebook.com/sharer/sharer.php?',
    `u=${encodeURIComponent(Router.url.toString())}`
  ];
  private linkedInUrl = [
    'https://www.linkedin.com/sharing/share-offsite',
    `?url=${encodeURIComponent(Router.url.toString())}`
  ];

  @Prop() post?: RenderedBlog;
  @Prop() column: boolean = false;
  @State() loaded: boolean = false;

  componentDidLoad() {
    requestAnimationFrame(() => {
      this.loaded = true;
    })
  }
  

  render = () => (
    <Host
      class={{
        'social-links': true,
        'column': this.column,
        'loaded': this.loaded
      }}
    >
      <a
        href={this.twitterUrl.join('')}
        target="_blank" rel="noreferrer"
      >
        {twitterLogo({ main: '#CED6E0' }, { width: 20, height: 16, class: 'twitter' })}
      </a>
      <a
        href={this.facebookUrl.join('')}
        target="_blank" rel="noreferrer"
      >
        {facebookRoundedLogo({ main: '#CED6E0' }, { width: 20, height: 20, class: 'facebook' })}
      </a>
      <a
        href={this.linkedInUrl.join('')}
        target="_blank" rel="noreferrer"
      >
        {linkedInLogo({ main: '#CED6E0' }, { width: 20, height: 20, class: 'linked-in' })}
      </a>
    </Host>
  );
}
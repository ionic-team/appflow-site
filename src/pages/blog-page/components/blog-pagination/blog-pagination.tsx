import { Component, h, Host, Prop} from '@stencil/core';

import { rssIcon } from '../../../../svgs';


@Component({
  tag: 'blog-pagination',
  styleUrl: 'blog-pagination.scss',
  scoped: true
})
export class BlogPagination {
  @Prop() linkText: [string, string] = ['Older posts', 'Newer posts'];
  @Prop() rssIcon: boolean = false;

  render = () => (
    <Host>
      <a href="#" class="link back ui-paragraph-3">
        <ion-icon name="chevron-back-outline"></ion-icon>
        {this.linkText[0]}
      </a>
      {this.rssIcon
      ? rssIcon({}, { height: 32, width: 32 }): ''}
      <a href="#" class="link forward ui-paragraph-3">
        {this.linkText[1]}
        <ion-icon name="chevron-forward-outline"></ion-icon>      
      </a>
    </Host>
  )
}
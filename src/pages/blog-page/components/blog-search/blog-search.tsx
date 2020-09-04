import { Component, h, Host } from '@stencil/core';


@Component({
  tag: 'blog-search',
  styleUrl: 'blog-search.scss',
  scoped: true
})
export class BlogSearch {
  render = () => (
    <Host>
      <ion-icon class="search" name="search-outline"></ion-icon>
      <input class="ui-paragraph-6" type="text" placeholder="Search the blog..."/>
    </Host>
  )
}
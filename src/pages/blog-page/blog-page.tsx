import { Component, Host, h, Element } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

import posts from './components/blog-post/assets/blog.json';
import state from '../../store';

 
@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss',
  scoped: true
})
export class BlogPage {
  private posts?: RenderedBlog[];

  @Element() el!: HTMLElement;
    

  componentWillLoad() {
    state.stickyHeader = false;
    this.posts = (posts as RenderedBlog[]).slice(0, 10); 
  }

  componentWillUpdate() {
    state.stickyHeader = false;   
  }

  render() {
    if (!this.posts) throw new Error('No posts received from markdown blog');

    return (
      <Host>    
        <blog-subnav breadcrumbs={[['Blog', '/blog']]}/>
        {this.posts.map(p => (
          <article>
            <blog-post slug={p.slug} preview />
          </article>
        ))}
        {/* <blog-pagination rssIcon /> */}
        <blog-newsletter />        
      </Host> )
  }
}
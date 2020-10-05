import { Component, Host, h, Element } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

import posts from '../../assets/blog.json';
import state from '../../store';
import { ResponsiveContainer } from '@ionic-internal/ionic-ds';

 
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
    if (!this.posts) console.error('No posts received from markdown blog');

    return (
      <Host>    
        <blog-subnav breadcrumbs={[['Blog', '/blog']]}/>
        <ResponsiveContainer>
          <div class="content">
            {this.posts?.map((p, i) => (
              <article>
                <blog-post slug={p.slug} preview key={i}/>
              </article>
            ))}
            {/* <blog-pagination rssIcon /> */}
            <blog-newsletter />      
          </div>  
        </ResponsiveContainer>
      </Host> )
  }
}
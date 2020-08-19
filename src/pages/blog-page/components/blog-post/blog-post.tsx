import { Component, Prop, State, h, Host } from '@stencil/core';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { BlogPost } from '../../blog-common';

import posts from '../../../../assets/blog.json';
import Helmet from '@stencil/helmet';
import state from '../../../../store';

@Component({
  tag: 'blog-post',
})
export class BlogPage {
  @Prop() slug: string;

  @State() post?: RenderedBlog;

  async componentWillLoad() {
    state.stickyHeader = false;

    const { slug } = this;

    if (slug) {
      this.slug = slug;
      this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug);
    }
  }

  render() {
    if (this.slug && this.post) {
      return (
        <Host>
          <Helmet>
            <title>{this.post.title} - Capacitor Blog - Cross-platform native runtime for web apps</title>
            <meta
              name="description"
              content={this.post.description}
            />
            <meta name="twitter:description" content={`${this.post.description} - Capacitor Blog`} />
            <meta property="og:image" content={this.post.featuredImage || 'https://capacitorjs.com/assets/img/og.png'} />
          </Helmet>
          <blog-subnav renderContent={() => [<li>Blog</li>,<div class="nav-sep">/</div>,<li>article</li>]}/>,
          <div class="blog-posts">
            <BlogPost post={this.post} />
          </div>
        </Host>
      )
    }
    return null;
  }
}
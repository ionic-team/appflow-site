import { Component, Prop, State, h, Host } from '@stencil/core';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { BlogPost } from './blog-common';

import posts from '../../assets/blog.json';
import { Heading } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';
import Helmet from '@stencil/helmet';

@Component({
  tag: 'blog-post',
  styleUrl: 'blog-page.scss',
})
export class BlogPage {
  @Prop() slug: string;

  @State() post?: RenderedBlog;

  async componentWillLoad() {
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
          <div class="blog-posts">
            <hgroup class="blog-posts__heading">
              <Heading level={3}><a {...href('/blog')}>Blog</a></Heading>
            </hgroup>
            <BlogPost post={this.post} />
          </div>
          <pre-footer />
          <newsletter-signup />
          <capacitor-site-footer />
        </Host>
      )
    }
    return null;
  }
}
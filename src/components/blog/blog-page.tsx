import { Component, State, h } from '@stencil/core';
import { Heading } from '@ionic-internal/ionic-ds';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { BlogPost } from './blog-common';

import posts from '../../assets/blog.json';


@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss'
  // Not scoped since blog content is rendered as HTML
})
export class BlogPage {
  @State() posts?: RenderedBlog[];

  async componentWillLoad() {
    this.posts = (posts as RenderedBlog[]).slice(0, 10);
  }

  render() {
    if (this.posts) {
      return [
        <AllPosts posts={this.posts} />,
        <pre-footer />,
        <newsletter-signup />,
        <capacitor-site-footer />
      ]
    }

    return null;
  }
}


const AllPosts = ({ posts }: { posts: RenderedBlog[] }) => {

  return (
    <div class="blog-posts">
      <hgroup class="blog-posts__heading">
        <Heading level={3}>Blog</Heading>
      </hgroup>
      {posts.map(p => <BlogPost post={p} single={false} />)}
    </div>
  )
}
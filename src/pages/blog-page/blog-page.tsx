import { Component, State, Host, Prop, h, Watch, Element } from '@stencil/core';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

import posts from '../../assets/blog.json';
import state from '../../store';
import { ResponsiveContainer, Heading, Paragraph, Breakpoint } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';
import Router from '../../router';
import { rssIcon } from '../../svgs';

@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss',
  scoped: true
})
export class BlogPage {
  @Element() el!: HTMLElement;
  @Prop() slug?: string;
  @State() posts?: RenderedBlog[];
  @State() post?: RenderedBlog;
  private title?: string;

  async componentWillLoad() {
    state.stickyHeader = false;
    this.posts = (posts as RenderedBlog[]).slice(0, 10); 

    this.checkSlug();
  }

  componentDidLoad() {
    this.el.classList.add()
  }

  componentWillUpdate() {
    state.stickyHeader = false;   
  }

  @Watch('slug')
  checkSlug() {
    if (this.slug) {
      this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug);
      this.title = this.post?.title;
    }  
  }

  render = () => (
    <Host class="sc-blog-page">
      <blog-subnav>
        <li slot="base">
          <a class="ui-heading-5" {...href('/blog', Router)}>Blog</a>
        </li> 
        {this.slug ? 
        <li slot="detail">
          <a class="ui-heading-5" {...href(`/blog/${this.slug}`, Router)}>{this.title}</a>
        </li> : ''}     
      </blog-subnav>
      <ResponsiveContainer id="posts" as="section">
        <div class="container-sm">
          {this.slug
          ? <DetailView post={this.post}/>
          : <ListView posts={this.posts} />}          
        </div>
      </ResponsiveContainer>        
    </Host>
  )
}

const DetailView =  ({ post }:{ post: BlogPage['post'] }) => {
  if (!post) return null;

  return [
    <Breakpoint md={true} class="sticky-wrapper">
      <blog-social-actions post={post} column class="top"/>
    </Breakpoint>,
    <blog-post post={post}/>,
    <blog-social-actions post={post} class="bottom" />,
    <PostAuthor post={post}/>,
    <disqus-comments url={`https://useappflow.com/blog/${post.slug}`} siteId="ionic"/>
  ]
}

const ListView = ({ posts }: { posts: BlogPage['posts'] }) => {
  if (!posts) return null;

  return [ 
    ...posts.map(p => <blog-post slug={p.slug} post={p} preview/>),
    <Pagination />,
    <blog-newsletter />
  ]
}

const Pagination = () => (
  <div class="pagination">
    <a href="#" class="link ui-paragraph-3">
      <ion-icon name="chevron-back-outline"></ion-icon>
      Older posts
    </a>
    {rssIcon({}, { height: 32, width: 32 })}
    <a href="#" class="link ui-paragraph-3">
      Newer posts
      <ion-icon name="chevron-forward-outline"></ion-icon>      
    </a>
  </div>
)

const PostAuthor = ({ post }: { post: RenderedBlog }) => (
  <section class="post-author">
    <Heading level={5}>{post.authorName}</Heading>
    <Paragraph level={4}>{post.authorEmail}</Paragraph>
  </section>
)
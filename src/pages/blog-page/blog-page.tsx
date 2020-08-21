import { Component, State, Host, Prop, h, FunctionalComponent } from '@stencil/core';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

import posts from '../../assets/blog.json';
import state from '../../store';
import { ResponsiveContainer, Heading, Paragraph } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';
import Router from '../../router';
import { rssIcon, twitterLogo, facebookLogo, bufferLogo } from '../../svgs';
import { JSXBase } from '@stencil/core/internal';


@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss',
  scoped: true
})
export class BlogPage {
  @Prop() slug?: string;
  @State() posts?: RenderedBlog[];
  private post: RenderedBlog;
  private title: string;

  async componentWillLoad() {
    state.stickyHeader = false;
    this.posts = (posts as RenderedBlog[]).slice(0, 10);

    if (this.slug) {
      this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug);
      this.title = this.post.title;
    }
  }

  componentDidUpdate() {
    state.stickyHeader = false;
  }

  render = () => (
    <Host>
      <blog-subnav>
        <li>
          <a class="ui-heading-5" {...href('/blog', Router)}>Blog</a>
        </li> 
        {this.slug ? 
        <li>
          <a class="ui-heading-5" {...href(`/blog/${this.slug}`, Router)}>{this.title}</a>
        </li> : ''}     
      </blog-subnav>
      <ResponsiveContainer id="posts" as="section">
        <div class="container-sm">
          {this.slug ?
          <DetailView post={this.post}/> :
          <ListView posts={this.posts} />}          
        </div>
      </ResponsiveContainer>        
    </Host>
  )
}

const DetailView =  ({ post }:{ post: BlogPage['post'] }) => [
  <SocialLinks column class="top"/>,
  <blog-post post={post}/>,
  <SocialLinks class="bottom" />,
  <PostAuthor post={post}/>,
  <disqus-comments url="https://useappflow.com/blog" siteId="ionic"/>
]

const ListView = ({ posts }: { posts: BlogPage['posts'] }) => [ 
  ...posts.map(p => <blog-post slug={p.slug} post={p} preview />),
  <Pagination />,
  <blog-newsletter />
]

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

interface SocialLinkProps extends Partial<JSXBase.HTMLAttributes> {
  column?: boolean,
  rest?: JSXBase.HTMLAttributes[]
}
const SocialLinks: FunctionalComponent<SocialLinkProps> = ({ column = false, ...rest }) => (
  <aside        
    {...{...rest,
    class: {
      [`${rest.class ? rest.class : ''}`]: true,
      'social-links': true,
      'column': column
    }}}
  >
    <a href="#">{twitterLogo({ main: '#CED6E0' }, { width: 20, height: 16 })}</a>
    <a href="#">{facebookLogo({ main: '#CED6E0' }, { width: 16, height: 16 })}</a>
    <a href="#">{bufferLogo({ main: '#CED6E0' }, { width: 18, height: 18 })}</a>
  </aside>
)

const PostAuthor = ({ post }: { post: RenderedBlog }) => (
  <section class="post-author">
    <Heading level={5}>{post.authorName}</Heading>
    <Paragraph level={4}>{post.authorEmail}</Paragraph>
  </section>
)
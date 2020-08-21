import { Component, State, Host, Prop, h, Watch, FunctionalComponent } from '@stencil/core';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

import posts from '../../assets/blog.json';
import state from '../../store';
import { ResponsiveContainer, Heading, Paragraph } from '@ionic-internal/ionic-ds';
import { href } from 'stencil-router-v2';
import Router from '../../router';
import { rssIcon, twitterLogo, facebookLogo, linkedInLogo } from '../../svgs';
import { JSXBase } from '@stencil/core/internal';


@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss',
  scoped: true
})
export class BlogPage {
  @Prop() slug: string;
  @State() posts?: RenderedBlog[];
  private post: RenderedBlog;
  private title: string;

  async componentWillLoad() {
    state.stickyHeader = false;
    this.posts = (posts as RenderedBlog[]).slice(0, 10); 

    this.checkSlug();
  }

  componentWillUpdate() {
    state.stickyHeader = false;   
  }

  @Watch('slug')
  checkSlug() {
    if (this.slug) {
      this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug);
      this.title = this.post.title;
    }  
  }

  render = () => (
    <Host class="sc-blog-page">
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
  <SocialLinks post={post} column class="top"/>,
  <blog-post post={post}/>,
  <SocialLinks post={post} class="bottom" />,
  <PostAuthor post={post}/>,
  <disqus-comments url="https://useappflow.com/blog" siteId="ionic"/>
]

const ListView = ({ posts }: { posts: BlogPage['posts'] }) => [ 
  ...posts.map((p, i) => <blog-post slug={p.slug} post={p} preview key={i}/>),
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
  post: BlogPage['post'],
  column?: boolean,
  rest?: JSXBase.HTMLAttributes[]
}
const SocialLinks: FunctionalComponent<SocialLinkProps> = ({ post, column = false, ...rest }) => {
  const twitterUrl = [
    'http://twitter.com/intent/tweet?',
    `text=${encodeURIComponent('\n\n')}&`,
    `url=${encodeURIComponent(Router.url.toString())}`
  ]
  const facebookUrl = [
    'https://www.facebook.com/sharer/sharer.php?',
    `u=${encodeURIComponent(Router.url.toString())}`
  ]
  const linkedInUrl = [
    'https://www.linkedin.com/sharing/share-offsite',
    `?url=${encodeURIComponent(Router.url.toString())}`
  ]
  return (
    <aside
      class={{
        [typeof rest.class === 'string' ? rest.class : '']: true,
        'social-links': true,
        'column': column
      }}
    >
      <a
        href={twitterUrl.join('')}
        target="_blank" rel="noopener nofollow"
      >
        {twitterLogo({ main: '#CED6E0' }, { width: 20, height: 16 })}
      </a>
      <a
        href={facebookUrl.join('')}
        target="_blank" rel="noopener nofollow"
      >
        {facebookLogo({ main: '#CED6E0' }, { width: 16, height: 16 })}
      </a>
      <a
        href={linkedInUrl.join('')}
        target="_blank" rel="noopener nofollow"
      >
        {linkedInLogo({ main: '#CED6E0' }, { width: 16, height: 16 })}
      </a>
    </aside>
  );
}

const PostAuthor = ({ post }: { post: RenderedBlog }) => (
  <section class="post-author">
    <Heading level={5}>{post.authorName}</Heading>
    <Paragraph level={4}>{post.authorEmail}</Paragraph>
  </section>
)
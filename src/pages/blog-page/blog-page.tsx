import { Component, State, Host, Prop, h, Watch, Element } from '@stencil/core';
import { ResponsiveContainer, Heading, Paragraph, Breakpoint } from '@ionic-internal/ionic-ds';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';

import posts from '../../assets/blog.json';
import state from '../../store';
import { rssIcon } from '../../svgs';
import { BlogSubnav } from './components/blog-subnav/blog-subnav';

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
  @Prop() viewMode: 'detail' | 'previews' = 'previews';
  @State() breadcrumbs: { base: BlogSubnav['breadcrumbs'], detail?: BlogSubnav['breadcrumbs'] } = {
    base: [
      ['Blog', '/blog']
    ]
  };

  async componentWillLoad() {
    state.stickyHeader = false;
    this.posts = (posts as RenderedBlog[]).slice(0, 10); 
    this.checkViewMode(this.viewMode);
  }

  componentDidLoad() {
    this.el.classList.add()
  }

  componentWillUpdate() {
    state.stickyHeader = false;   
  }

  getPost() {
    this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug)!;
    if (!this.post) throw new Error('couldnt find blog post by slug');
  }

  @Watch('viewMode')
  checkViewMode(newValue: BlogPage['viewMode']) {
    if (newValue === 'previews') return this.breadcrumbs.detail = this.breadcrumbs.base;
    
    this.getPost();
    this.breadcrumbs.detail = ([...this.breadcrumbs.base, [`${this.post!.title}`, `/blog/${this.post!.slug}`]]);
  }  

  render = () => (
    <Host class="sc-blog-page">
      {this.viewMode === 'detail'
      ? <blog-subnav socialActions breadcrumbs={this.breadcrumbs.detail}/>
      : <blog-subnav pagination breadcrumbs={this.breadcrumbs.detail}/>}       
      <ResponsiveContainer id="posts" as="section">
        <div class="container-sm">
          {this.viewMode === 'detail'
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
    <blog-pagination rssIcon />,
    <blog-newsletter />
  ]
}


const PostAuthor = ({ post }: { post: RenderedBlog }) => (
  <section class="post-author">
    <Heading level={5}>{post.authorName}</Heading>
    <Paragraph level={4}>{post.authorEmail}</Paragraph>
  </section>
)
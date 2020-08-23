import { Component, Prop, h, Host, Element } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import posts from '../../../../assets/blog.json';
import Helmet from '@stencil/helmet';
import { ThemeProvider, Heading, Paragraph, DateTime } from '@ionic-internal/ionic-ds';
import parseISO from 'date-fns/parseISO';
import { href } from 'stencil-router-v2';
import Router from '../../../../router';

@Component({
  tag: 'blog-post',
  styleUrl: 'blog-post.scss',
})
export class BlogPost {
  private articleLinks: HTMLAnchorElement[] = [];
  @Prop() slug?: string;

  @Prop() post?: RenderedBlog;
  @Prop() preview: boolean = false;
  @Element() el!: HTMLElement;

  async componentWillLoad() {
    if (this.post) return this.slug = this.post.slug;
    if (this.slug) this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug)
  }

  componentDidLoad() {
    this.articleLinks.forEach(link => {
      link.addEventListener('click', () => {
        window.scrollTo(0, window.scrollY - this.el.offsetTop + 32);
      })
    })
  }

  render() {
    if (!this.post) return null;

    const { slug, post, preview, articleLinks } = this;
    const content = preview ? post.preview : post.html;


    return (
      <Host
        class={{
          'sc-blog-post': true,
          'preview': preview
        }}
      >
        <Helmet>
          <title>{this.post.title} - Capacitor Blog - Cross-platform native runtime for web apps</title>
          <meta
            name="description"
            content={this.post.description}
          />
          <meta name="twitter:description" content={`${this.post.description} - Capacitor Blog`} />
          <meta property="og:image" content={this.post.featuredImage || 'https://capacitorjs.com/assets/img/og.png'} />
        </Helmet>

        <article class="post">
          <ThemeProvider type="editorial">
            <Heading level={1}>
              {preview 
              ? <a ref={e => e ? articleLinks.push(e) : ''} {...href(`/blog/${slug}`, Router)}>{post.title}</a>
              : post.title}                
            </Heading>
          </ThemeProvider>

          <PostAuthor authorName={post.authorName} authorUrl={post.authorUrl} dateString={post.date} />

          {post.featuredImage 
          ? <PostFeaturedImage preview={preview} post={post} />
          : <PostDefaultImage preview={preview} post={post}/>}
          
          <div
            class="post-content"
            innerHTML={content}>
          </div>

          {this.preview
          ? <a class="continue-reading ui-paragraph-2" ref={e => e ? articleLinks.push(e) : ''} {...href(`/blog/${slug}`, Router)}>
              Continue reading <span class="arrow">-&gt;</span>
            </a> : ''}
        </article>
      </Host>
    )
  }
}

const PostFeaturedImage = ({ post, preview }: { post: RenderedBlog, preview: boolean}) => (
  <div class="featured-image-wrapper">
    {preview 
    ? <a {...href(`/blog/${post.slug}`, Router)}><img class="featured-image" src={post.featuredImage} alt={post.featuredImageAlt} /></a>
    : <img class="featured-image" src={post.featuredImage} alt={post.featuredImageAlt} /> }
  </div>
);

const PostDefaultImage = ({ post, preview }: { post: RenderedBlog, preview: boolean}) => (
  <div class="default-image-wrapper">
    {preview 
    ? <a {...href(`/blog/${post.slug}`, Router)}><img class="featured-image" width="2400" height="1280" src="/assets/img/appflow-og-img.jpg" alt="Appflow logo and text on gradient background" /></a>
    : <img class="featured-image" width="2400" height="1280" src="/assets/img/appflow-og-img.jpg" alt="Appflow logo and text on gradient background" /> }
  </div>
);


const PostAuthor = ({ authorName, authorUrl, dateString }: { authorName: string, authorUrl: string, dateString: string }) => {
  const date = parseISO(dateString);

  return (
    <div class="author">
      {/* <img src={a.author_avatar.url} alt={a.author_name} /> */}
      <Paragraph>By {authorUrl ?
        <a href={authorUrl} target="_blank">{authorName}</a> :
        authorName} on <DateTime date={date} /></Paragraph>
    </div>
  );
}
import { Component, Prop, h, Host, Element, getAssetPath } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import posts from './assets/blog.json';
import Helmet from '@stencil/helmet';
import { ThemeProvider, Heading, Paragraph, DateTime } from '@ionic-internal/ionic-ds';
import parseISO from 'date-fns/parseISO';
import { href } from 'stencil-router-v2';
import Router from '../../../../router';
import Img from '../../../../components/Img/Img';
import { slugify } from '../../../../utils/slugify'

@Component({
  tag: 'blog-post',
  styleUrl: 'blog-post.scss',
  assetsDirs: ['assets']
})
export class BlogPost {
  private keepScrollLinks: HTMLAnchorElement[] = [];
  @Prop() slug?: string;

  @Prop() post?: RenderedBlog;
  @Prop() preview: boolean = false;
  @Element() el!: HTMLElement;

  async componentWillLoad() {
    console.log(this.post);
    if (this.post) return this.slug = this.post.slug;
    if (this.slug) this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug)
  }

  componentDidLoad() {
    console.log(this.post);
    this.keepScrollLinks.forEach(link => {
      link.addEventListener('click', () => {
        window.scrollTo(0, window.scrollY - this.el.offsetTop + 32);
      })
    })
  }

  render() {
    const { PostAuthor } = this;
    if (!this.post) return null;

    const { slug, post, preview, keepScrollLinks } = this;
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
            <Heading level={1} onClick={() => window.scrollTo(0,0)}>
              {preview 
              ? <a {...href(`/blog/${slug}`, Router)}>{post.title}</a>
              : post.title}                
            </Heading>
          </ThemeProvider>

          <PostAuthor post={post}/>

          <PostFeaturedImage preview={preview} post={post} />

          
          <div
            class="post-content"
            innerHTML={content}>
          </div>

          {this.preview
          ? <a class="continue-reading ui-paragraph-2" ref={e => keepScrollLinks.push(e!)} {...href(`/blog/${slug}`, Router)}>
              Continue reading <span class="arrow">-&gt;</span>
            </a> : ''}
        </article>
      </Host>
    )
  }

  PostAuthor = ({ post: { authorName, authorUrl, authorImageName, date }}: { post: RenderedBlog }) => {
    const dateString = parseISO(date);

    return (
      <div class="author">
        {authorImageName
          ? <img src={getAssetPath(`assets/img/author/${authorImageName}`)} alt={authorName} width="56" height="56"/>
          : null}
        <Paragraph>By {authorUrl ?
          <a href={authorUrl} target="_blank">{authorName}</a> :
          authorName} on <DateTime date={dateString} /></Paragraph>
      </div>
    )
  }
}

const PostFeaturedImage = ({ post, preview }: { post: RenderedBlog, preview: boolean}) => (
  <div class="featured-image-wrapper">
    {preview 
    ? <a {...href(`/blog/${post.slug}`, Router)}>
        <Img
          // fallback={PostDefaultImage}
          onClick={() => window.scrollTo(0, 0)}
          class="featured-image"
          dimensions="1600x840"
          name={post.slug}
          alt={post.slug.split('-').join(' ')}
          path={getAssetPath(`assets/img/hero/`)}
        />
      </a>
    : <Img
        // fallback={PostDefaultImage}
        onClick={() => window.scrollTo(0, 0)}
        class="featured-image"
        dimensions="1600x840"
        name={post.slug}
        alt={post.slug.split('-').join(' ')}
        path={getAssetPath(`assets/img/hero/`)}
      /> }
  </div>
);


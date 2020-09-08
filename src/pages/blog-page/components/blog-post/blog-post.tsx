import { Component, Prop, h, Host, Element, getAssetPath } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import posts from './assets/blog.json';
import Helmet from '@stencil/helmet';
import { ThemeProvider, Heading, Paragraph, DateTime } from '@ionic-internal/ionic-ds';
import parseISO from 'date-fns/parseISO';
import { href } from 'stencil-router-v2';
import Router from '../../../../router';
import Img from '../../../../components/Img/Img';

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
          <title>Appflow Blog - {this.post.title}</title>
          <meta
            name="description"
            content={this.post.description}
          />
          <meta name="twitter:description" content={`${this.post.description} - Appflow Blog`} />
          <meta property="og:image" content={getAssetPath(`assets/img/hero/${post.featuredImage}`)} />
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
    const imageParts = authorImageName?.split('.');
    if (!imageParts || !imageParts[0] || !imageParts[1]) throw new Error('Markdown Blog author image name not formatted correctly.  It should look like: max-lynch.png');

    const data = {
      name: imageParts[0],
      type: imageParts[1]
    }

    return (
      <div class="author">
        {authorImageName
          ? <Img path={getAssetPath(`assets/img/author/`)} {...data} alt={authorName} dimensions="56x56"/>
          : null}
        <Paragraph>By {authorUrl ?
          <a href={authorUrl} target="_blank">{authorName}</a> :
          authorName} on <DateTime date={dateString} /></Paragraph>
      </div>
    )
  }
}

const PostFeaturedImage = ({ post: { slug, featuredImage, featuredImageAlt}, preview}: { post: RenderedBlog, preview: boolean}) => {
  
  const imageParts = featuredImage?.split('.');
  if (!imageParts || !imageParts[0] || !imageParts[1]) throw new Error('Markdown Blog featured image name not formatted correctly.  It should look like: what-is-mobile-ci-cd.png');

  const data = {
    name: imageParts[0],
    type: imageParts[1],
    alt: featuredImageAlt
  }

  return (
    <div class="featured-image-wrapper">
      {preview 
      ? <a {...href(`/blog/${slug}`, Router)}>
          <Img
            {...data}
            class="featured-image"
            dimensions="1600x840"
            path={getAssetPath(`assets/img/hero/`)}
          />
        </a>
      : <Img
          {...data}
          class="featured-image"
          dimensions="1600x840"
          path={getAssetPath(`assets/img/hero/`)}
        /> }
    </div> )
}


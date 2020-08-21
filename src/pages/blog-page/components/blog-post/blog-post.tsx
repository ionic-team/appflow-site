import { Component, Prop, h, Host } from '@stencil/core';
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
  @Prop() slug: string;

  @Prop() post: RenderedBlog;
  @Prop() preview: boolean;

  async componentWillLoad() {
    if (this.slug) {
      this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug);
    }
  }

  handleDetailView() {

  }

  render() {
    const { slug, post, preview } = this;

    const content = preview ? post.preview : post.html;

    if (this.post) {
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
                ? <a onClick={this.handleDetailView} {...href(`/blog/${slug}`, Router)}>{post.title}</a>
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
            ? <a class="continue-reading ui-paragraph-2" onClick={this.handleDetailView} {...href(`/blog/${slug}`, Router)}>
                Continue reading <span class="arrow">-&gt;</span>
              </a> : ''}
          </article>
        </Host>
      )
    }
    return null;
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
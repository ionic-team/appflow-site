import { Component, Prop, h, Host } from '@stencil/core';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import posts from '../../../../assets/blog.json';
import Helmet from '@stencil/helmet';
import { ThemeProvider, Heading, Paragraph, DateTime } from '@ionic-internal/ionic-ds';
import parseISO from 'date-fns/parseISO';

@Component({
  tag: 'blog-post',
  styleUrl: 'blog-post.scss',
  scoped: true
})
export class BlogPost {
  @Prop() slug: string;

  @Prop() post: RenderedBlog;
  @Prop() preview: boolean;

  async componentWillLoad() {
    const { slug } = this;

    if (slug) {
      this.slug = slug;
      this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug);
      console.log(this.post);
    }
  }

  getBlogPostPath = (doc: RenderedBlog) => `/blog/${doc.slug}`;

  render() {
    const { post, preview, getBlogPostPath } = this;

    const content = preview ? post.preview : post.html;

    if (this.post) {
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

          <article class="post">
            <ThemeProvider type="editorial">
              <Heading level={1}><a href={getBlogPostPath(post)}>{post.title}</a></Heading>
            </ThemeProvider>

            <PostAuthor authorName={post.authorName} authorUrl={post.authorUrl} dateString={post.date} />

            <PostFeaturedImage post={post} />

            <div class="post-content" innerHTML={content} />

            {this.preview
            ? <a class="continue-reading" href={getBlogPostPath(post)}>
                Continue reading <span class="arrow">-&gt;</span>
              </a> : ''}
          </article>
        </Host>
      )
    }
    return null;
  }
}

const PostFeaturedImage = ({ post }: { post: RenderedBlog}) => {
  return post.featuredImage ? 
    <img class="featured-image" src={post.featuredImage} alt={post.featuredImageAlt} /> :
    <img class="featured-image" width="2400" height="1280" src="/assets/img/appflow-og-img.jpg" alt="Appflow logo and text on gradient background" />
};


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
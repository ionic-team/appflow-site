import { Component, Prop, h, Host, Element, State, getAssetPath } from '@stencil/core';
import { Heading, Paragraph, DateTime, Breakpoint, ResponsiveContainer } from '@ionic-internal/ionic-ds';
import { Components as DS } from '@ionic-internal/ionic-ds/dist/types/components'
import Helmet from '@stencil/helmet';

import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { ResourceLink } from '../../../../global/models/prismic';
import { prismicDocToResource, resourceTypeToPrismicType } from '../../../../global/utils/prismic/prismic';
import { getResourceTypeForParam, typeToResourceType   } from '../../../../global/utils/prismic/data';
import { Client } from '../../../../global/utils/prismic/prismic-configuration';

import { href } from 'stencil-router-v2';
import Router from '../../../../router';

import posts from './assets/blog.json';
import Img from 'src/components/Img/Img';
import parseISO from 'date-fns/parseISO';
import { ResourceCard } from '@ionic-internal/ionic-ds/dist/types/resource-center/resource-card/resource-card';

@Component({
  tag: 'blog-post',
  styleUrl: 'blog-post.scss',
  assetsDirs: ['assets']
})
export class BlogPost {
  private post?: RenderedBlog;
  private client = Client();

  @Prop() slug!: string;  
  @Prop() preview: boolean = false;

  @State() moreResources: DS.MoreResources = {
    resources: [],
    routing: []
  };

  @Element() el!: HTMLElement;

  componentWillLoad() {
    const { slug, getRelatedResources } = this;

    this.post = (posts as RenderedBlog[]).find(p => p.slug === slug);
    if (!this.post) throw new Error('Could not find blog post by slug.');  
      
    getRelatedResources();
  }

  getRelatedResources = async () => {   
    const { related } = this.post!; 
    if (!related) return;   


    await Promise.all(related.map(async (resource) => {
      const info = await this.getRelatedDetails(resource);
      if (!info || !info.type || !info.uid) throw new Error('Couldnt get type or uid of related resources');

      const doc = await this.client.getByUID(resourceTypeToPrismicType(info.type), info.uid, {});
      this.moreResources.resources?.push(prismicDocToResource(doc));
      (this.moreResources.routing as ResourceCard['routing'][]).push(info.routing);
    }));
  }

  getRelatedDetails = async (url: string) => {
    const matchResults = url.match(/\/resources\/(.*?)$/);   
    if (!matchResults || !matchResults[1]) throw new Error('Invalid url for markdown blog related resources');

    const relatedInfo = matchResults[1].split('\/');
    const uid = relatedInfo.pop();
    const type = relatedInfo.pop();
    if (!uid) throw new Error('Error getting uid from markdown blog related resource url')

    if (!type) {
      const type = await this.getResourceType(uid);
      const routing = { base: '/resources', includeType: false, router: Router };
      return { type, uid, routing };
    } else {
      return { type: getResourceTypeForParam(type), uid, routing: url }
    }   
  }

  async getResourceType(uid: string) {
    const { data } = await this.client.getSingle('appflow_resources', {});

    const { type } = Object.values(data).find((link: any) => link.hasOwnProperty('uid') && link.uid === uid) as ResourceLink;
    if (!type) throw new Error('Markdown Blog related resource link not found in appflow resource center')

    return typeToResourceType(type);
  }

  render() {
    if (!this.post) throw new Error('Could not find blog post by slug.');

    const { PostDetail, PostPreview, preview } = this;

    return (
      <Host
        class={{
          'sc-blog-post': true,
          'preview': preview
        }}
      >
        {preview 
        ? <PostPreview />
        : <PostDetail />}
      </Host>
    )
  }

  PostHelmet = () => (
    <Helmet>
      <title>{this.post!.title} - Capacitor Blog - Cross-platform native runtime for web apps</title>
      <meta
        name="description"
        content={this.post!.description}
      />
      <meta name="twitter:description" content={`${this.post!.description} - Capacitor Blog`} />
      <meta property="og:image" content={this.post!.featuredImage || '/assets/img/appflow-og-img.jpg'} />
    </Helmet>
  );

  PostDetail = () => {
    const { PostAuthor, PostAuthorLarge, MoreResources, PostHelmet, PostFeaturedImage, post, preview } = this;

    return (
      <ResponsiveContainer>
        <article class="post">        
            <PostHelmet />

            <blog-subnav />
            <Breakpoint md={true} class="sticky-wrapper">
              <blog-social-actions post={post} column class="top" />
            </Breakpoint>  
                
            <Heading class="ui-theme--editorial" level={1}>
              {post!.title}                
            </Heading>
            <PostAuthor post={post!}/>
            <PostFeaturedImage preview={preview} post={post!} />

            <div class="post-content" innerHTML={post!.html} />

            <blog-social-actions post={post} class="bottom" />
            <PostAuthorLarge post={post!} />
            <MoreResources />
            {/* <disqus-comments url={`https://useappflow.com/blog/${post.slug}`} siteId="ionic"/> */}
        </article>
      </ResponsiveContainer>)
  };

  PostPreview = () => {
    const { PostAuthor, PostFeaturedImage, slug, preview, post } = this;

    return (
      <article class="post">
        <Heading class="ui-theme--editorial" level={1}>
          <a {...href(`/blog/${slug}`, Router)}>{post!.title}</a>           
        </Heading>
        <PostAuthor post={post!}/>
        <PostFeaturedImage preview={preview} post={post!} />

        <div class="post-content" innerHTML={post!.preview} />

        <a class="continue-reading ui-paragraph-2" {...href(`/blog/${slug}`, Router)}>
          Continue reading <span class="arrow">-&gt;</span>
        </a>
      </article>
    )
  };
  

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

  PostAuthorLarge = ({ post: { authorName, authorUrl, authorImageName, authorDescription }}: { post: RenderedBlog }) => {
    if (!authorImageName) return null;

    return (
      <a href={authorUrl} target="_blank" class="post-author">
        <img src={getAssetPath(`assets/img/author/${authorImageName}`)} alt={authorName} width="56" height="56"/>
        <div class="post-author__info">
          <Heading level={5}>{authorName}</Heading>
          {authorDescription
            ? <Paragraph level={4}>{authorDescription}</Paragraph>
            : null}
        </div>
      </a>
    )
  }

  MoreResources = () => [
    <Heading level={4} class="more-resources__title | ui-theme--editorial">You might also like...</Heading>,
    <more-resources {...this.moreResources}/>
  ]

  PostFeaturedImage = () => {
    const { preview, post } = this;

    return (
    <div class="featured-image-wrapper">
      {preview 
      ? <a {...href(`/blog/${post!.slug}`, Router)}>
          <Img
            // fallback={PostDefaultImage}
            onClick={() => window.scrollTo(0, 0)}
            class="featured-image"
            dimensions="1600x840"
            name={post!.slug}
            alt={post!.slug.split('-').join(' ')}
            path={getAssetPath(`assets/img/hero/`)}
          />
        </a>
      : <Img
          // fallback={PostDefaultImage}
          onClick={() => window.scrollTo(0, 0)}
          class="featured-image"
          dimensions="1600x840"
          name={post!.slug}
          alt={post!.slug.split('-').join(' ')}
          path={getAssetPath(`assets/img/hero/`)}
        /> }
    </div>
  )};
}




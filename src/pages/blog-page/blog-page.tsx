import { Component, State, Host, Prop, h, Watch, Element, getAssetPath, FunctionalComponent } from '@stencil/core';
import { ResponsiveContainer, Heading, Paragraph, Breakpoint } from '@ionic-internal/ionic-ds';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { PrismicResource } from '../../global/models/prismic'

import posts from './components/blog-post/assets/blog.json';
import state from '../../store';
import { BlogSubnav } from './components/blog-subnav/blog-subnav';
import { Client } from '../../global/utils/prismic/prismic-configuration';
import { prismicDocToResource, resourceTypeToPrismicType } from '../../global/utils/prismic/prismic';
import { getResourceTypeForParam } from '../../global/utils/prismic/data';

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
  @State() relatedResources: PrismicResource[] = [];
  @Prop() viewMode: 'detail' | 'previews' = 'previews';
  @State() breadcrumbs: { base: BlogSubnav['breadcrumbs'], detail?: BlogSubnav['breadcrumbs'] } = {
    base: [
      ['Blog', '/blog']
    ]
  };

  componentWillLoad() {
    state.stickyHeader = false;
    this.posts = (posts as RenderedBlog[]).slice(0, 10); 
    this.checkViewMode(this.viewMode);
  }

  componentWillUpdate() {
    state.stickyHeader = false;   
  }

  getPost() {
    this.post = (posts as RenderedBlog[]).find(p => p.slug === this.slug)!;
    if (!this.post) console.error('couldnt find blog post by slug');
  }

  @Watch('viewMode')
  checkViewMode(newValue: BlogPage['viewMode']) {
    if (newValue === 'previews') return this.breadcrumbs.detail = this.breadcrumbs.base;
    
    this.getPost();
    this.breadcrumbs.detail = ([...this.breadcrumbs.base, [`${this.post!.title}`, `/blog/${this.post!.slug}`]]);
    this.getRelatedResources();
  }  

  async getRelatedResources() {    
    if (!this.post) return;
    
    const { related1, related2 } = this.post;

    const client = Client();

    const getTypeAndUid = (item: string) => {
      const typeMatch = item.match(/\/resources\/(.*?)\/(.*?)$/);      
      return {
        type: typeMatch ? getResourceTypeForParam(typeMatch[1]) : undefined,
        uid: typeMatch ? typeMatch[2] : undefined,
      }
    }
    
    let resources: PrismicResource[] = []

    await Promise.all([related1, related2].map(async (related) => {
      if (!related) return;

      const { type, uid } = getTypeAndUid(related);
      const prismicType = resourceTypeToPrismicType(type!);

      const doc = await client.getByUID(prismicType, uid!, {});
      resources.push(prismicDocToResource(doc));
    }));

    this.relatedResources = [...resources];
  }

  render() {
    const { DetailView, ListView } = this;
    return (
      <Host class="sc-blog-page">
        {this.viewMode === 'detail'
        ? <blog-subnav socialActions breadcrumbs={this.breadcrumbs.detail}/>
        : <blog-subnav pagination breadcrumbs={this.breadcrumbs.detail}/>}       
        <ResponsiveContainer id="posts" as="section">
          <div class="container-sm">
            {this.viewMode === 'detail'
            ? <DetailView />
            : <ListView />}          
          </div>
        </ResponsiveContainer>        
      </Host> )
  }

  PostAuthor = ({ post: { authorName, authorUrl, authorImageName, authorDescription }}: { post: RenderedBlog }) => {
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

  DetailView = (): FunctionalComponent | null => {
    const { post, PostAuthor } = this;
    if (!post) return null;
  
    return (
      <div class="detail-view">
        <Breakpoint md={true} class="sticky-wrapper">
          <blog-social-actions post={post} column class="top" />
        </Breakpoint>
        <blog-post post={post} />
        <blog-social-actions post={post} class="bottom" />
        <PostAuthor post={post} />
        {this.relatedResources.length > 0
          ? [<Heading level={4} class="more-resources__title | ui-theme--editorial">You might also like...</Heading>,
            <more-resources resources={this.relatedResources} routing={{ base: 'https://ionicframework.com/resources' }}/>]
          : null }
        {/* <disqus-comments url={`https://useappflow.com/blog/${post.slug}`} siteId="ionic"/> */}
      </div>
    )
  }

  ListView = (): FunctionalComponent | null => {
    const { posts } = this;
    if (!posts) return null;
  
    return (
      <div class="list-view">
        {posts.map(p => <blog-post slug={p.slug} post={p} preview/>)}
        {/* <blog-pagination rssIcon /> */}
        <blog-newsletter />
      </div>
    )
  }
}







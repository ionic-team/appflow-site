import { Component, State, Host, Prop, h, Watch, Element, getAssetPath} from '@stencil/core';
import { ResponsiveContainer, Heading, Paragraph, Breakpoint } from '@ionic-internal/ionic-ds';
import { RenderedBlog } from '@ionic-internal/markdown-blog/src/models';
import { PrismicResource, ResourceType } from '../../global/models/prismic'

import posts from './components/blog-post/assets/blog.json';
import state from '../../store';
import { BlogSubnav } from './components/blog-subnav/blog-subnav';
import { Client } from '../../global/utils/prismic/prismic-configuration';
import { prismicDocToResource, resourceTypeToPrismicType, getPage } from '../../global/utils/prismic/prismic';
import { getResourceTypeForParam, typeToResourceType   } from '../../global/utils/prismic/data';
import { ResourceLink } from '../../global/models/prismic';
import { Components } from '@ionic-internal/ionic-ds/dist/types/components'
import Router from '../../router'
import { RoutingProps } from '@ionic-internal/ionic-ds/dist/types/web/components/more-resources/more-resources';
 
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
  @State() moreResources: {
    resources: Components.MoreResources['resources'],
    routing?: RoutingProps[]
  } = { resources: [], routing: [] };
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
    if (!this.post?.related) return;
    
    const { related } = this.post;

    const client = Client();
    
    let resources: BlogPage['moreResources']['resources'] = []
    let routing: BlogPage['moreResources']['routing'] = []

    await Promise.all(related.map(async (related) => {
      if (!related) return;

      const info = await this.getTypeAndUid(related);
      if (!info || !info.type || !info.uid) return console.error('Couldnt get type or uid of related resources');

      const prismicType = resourceTypeToPrismicType(info.type);

      const doc = await client.getByUID(prismicType, info.uid, {});
      resources?.push(prismicDocToResource(doc));
      routing?.push(info.routing);
    }));

    this.moreResources = {
      resources,
      routing
    };
  }

  getTypeAndUid = async (item: string) => {
    const typeMatch = item.match(/\/resources\/(.*?)\/(.*?)$/);   
    if (!typeMatch){

      const routing = { base: '/resources', includeType: false, router: Router };
      const uidMatch = item.match(/\/resources\/(.*?)$/);
      
      if (!uidMatch) return console.error('Cant get Prismic resource without type.');
      return {...await this.getResourceType(uidMatch[1]), routing};
    }

    const routing = { base: 'https://ionicframework.com/resources' };

    return {
      type: typeMatch ? getResourceTypeForParam(typeMatch[1]) : null,
      uid: typeMatch ? typeMatch[2] : null,
      routing
    }
  }

  async getResourceType(uid: string) {
    await getPage('appflow_resources');

    let data: { type?: ResourceType, uid: string } = {
      uid
    }
    // get ids of all linked resources
    Object.values<ResourceLink>(state.pageData).some((link) => {
      if (link.uid === uid) {
        data = {
          uid,
          type: typeToResourceType(link.type)       
        }
        return true;
      }
    })

    return data
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

  DetailView = () => {
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
        {this.moreResources?.resources && this.moreResources?.resources.length > 0
          ? [<Heading level={4} class="more-resources__title | ui-theme--editorial">You might also like...</Heading>,
            <more-resources {...this.moreResources}/>]
          : null }
        {/* <disqus-comments url={`https://useappflow.com/blog/${post.slug}`} siteId="ionic"/> */}
      </div>
    )
  }

  ListView = () => {
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







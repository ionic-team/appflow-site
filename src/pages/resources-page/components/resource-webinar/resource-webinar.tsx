import { h, Component, Prop, Host, getAssetPath } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent, Paragraph, PrismicRichText, DateTime, PrismicResponsiveImage } from '@ionic-internal/ionic-ds';

import { PrismicResource, ResourceAuthor } from '../../../../models/prismic';
import { getAuthorsForPrismicDoc } from '../../../../utils/prismic/prismic';
// import ResourcesSubNav from './ResourceSubNav';


@Component({
  tag: 'resource-webinar',
  styleUrl: 'resource-webinar.scss',
  assetsDirs: ['assets'],
  scoped: true
})
export class ResourceWebinar {
  private hosts!: ResourceAuthor[];
  private hasHappened!: boolean;

  @Prop() prismicData!: PrismicResource;

  componentWillLoad() {
    console.log(this.prismicData);
    this.hasHappened = new Date(this.prismicData.doc.data.when) < new Date();
    this.hasHappened = false;

    this.hosts = getAuthorsForPrismicDoc(this.prismicData.doc);
    console.log(this.hosts);
  }

  render() {
    return (
      <Host
        style={{
          '--checkmark-path': `url("${getAssetPath('assets/checkmark-circle.png')}")`
        }}
        class={{
          'past': this.hasHappened,
          'future': !this.hasHappened
        }}>        
          {this.hasHappened
          ? <PastWebinar data={this.prismicData} hosts={this.hosts} />
          : <FutureWebinar data={this.prismicData} hosts={this.hosts}/>}        
      </Host>
    )
  }
};

const PastWebinar = ({ data, hosts }: { data: PrismicResource, hosts: ResourceAuthor[] }) => {
  const videoId = data.doc.data.wistia_id;

  return (
  <ResponsiveContainer>
    <ThemeProvider type="editorial">
      <section class="heading">
        <div class="meta">
          <Heading level={6} class="type">Webinar</Heading>
          <resource-meta tags={data.tags} class="tags"/>
        </div>
        <Heading level={1}>{data.title}</Heading>
        <div class="hosts">
          {hosts.map(host => (
            <div class="host">
              <PrismicResponsiveImage class="avatar" image={host.avatar} />
              <Paragraph class="description | .ui-theme--base">{host.name}{', '}
              {host.title}</Paragraph>
            </div>
          ))}
        </div>
      </section>

      <section>
        {videoId
        ? <wistia-video videoId={videoId}/>
        : null}
      </section>
      
      <section class="article">
        <PrismicRichText richText={data.doc.data.description} leading="prose"/>
      </section>      
    </ThemeProvider>    
  </ResponsiveContainer>
  )
}

const FutureWebinar = ({ data, hosts }: { data: PrismicResource, hosts: ResourceAuthor[] }) => {
  const date = data.doc.data.when;
  console.log(new Date(date));

  return (
    <ThemeProvider type="editorial">
      <section class="heading-group">
        <PrismicResponsiveImage class="landing-image" image={data.doc.data.landing_image} />
        <ResponsiveContainer>
          <div class="heading">
            <div class="meta">
              <Heading level={6} class="type">Webinar</Heading>
              <resource-meta tags={data.tags} class="tags"/>
            </div>
            <Heading level={1}>{data.title}</Heading>
            <Heading class="when" level={4}>Begins: </Heading>
          </div>
        </ResponsiveContainer>
      </section>

      <ResponsiveContainer>
        <section class="wrapper">
          <div class="article">
            <PrismicRichText richText={data.doc.data.description} leading="prose"/>
          </div>
          <div class="hosts">
            <Heading level={5}>Your speakers:</Heading>
            {hosts.map(host => (
              <resource-author-item author={host} />  
            ))}
          </div>
        </section> 
      </ResponsiveContainer>           
    </ThemeProvider>  
  )
}

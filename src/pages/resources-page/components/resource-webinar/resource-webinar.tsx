import { h, Component, Prop, Host, getAssetPath } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent, Paragraph, PrismicRichText, DateTime, PrismicResponsiveImage } from '@ionic-internal/ionic-ds';

import { PrismicResource, ResourceAuthor } from '../../../../models/prismic';
import { getAuthorsForPrismicDoc } from '../../../../utils/prismic/prismic';
import state from '../../../../store';
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
    state.hubspotGatedPassed = false;
    this.hasHappened = new Date(this.prismicData.doc.data.when) < new Date();

    this.hosts = getAuthorsForPrismicDoc(this.prismicData.doc);
  }

  render() {
    const formId = this.prismicData.doc.data.hubspot_form_id;

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
          : [<FutureWebinar data={this.prismicData} hosts={this.hosts}/>,
            <site-modal open={state.showHubspotForm} modalClose={() => (state.showHubspotForm = false)}>
              <div class="title">
                <Heading>Register for {this.prismicData.title}</Heading>
                <Paragraph>Enter your information below to join the Webinar list</Paragraph>
              </div>
              <hubspot-form
                formId={formId}
                ajax={false}
                onFormSubmitted={() => {
                  state.hubspotGatedPassed = true;
                }}
              />
            </site-modal>] }
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

      <section
        class={{
          'video': true,
          'blured': !state.hubspotGatedPassed
        }}
      >
        {!state.hubspotGatedPassed
        ? <OverlayForm data={data}/> : '' }        

        {videoId
        ? <wistia-video videoId={videoId}/> : ''}
      </section>
      
      <section class="article">
        <PrismicRichText richText={data.doc.data.description} leading="prose"/>
      </section>      
    </ThemeProvider>    
  </ResponsiveContainer>
  )
}

const FutureWebinar = ({ data, hosts }: { data: PrismicResource, hosts: ResourceAuthor[] }) => {
  const date = new Date(data.doc.data.when);
  const image = data.doc.data.landing_image;

  return (
  <ThemeProvider type="editorial">
    <section class="heading-group">
      {image.url
      ? <PrismicResponsiveImage class="landing-image" image={image} />
      : <div class="landing-image"></div> }
      <ResponsiveContainer>
        <div class="heading">
          <div class="meta">
            <Heading level={6} class="type">Webinar</Heading>
            <resource-meta tags={data.tags} class="tags"/>
          </div>
          
          <Heading level={1}>{data.title}</Heading>
          <Heading class="when" level={4}>
            Begins:{' '}
            <DateTime date={date} format={{ weekday: 'long', month: 'long', day: 'numeric' }} />
            {' @ '}
            <DateTime date={date} format={{ hour: 'numeric', timeZoneName: 'short', timeZone: 'America/Chicago' }} />
          </Heading>

          <RegisterButton />
        </div>
      </ResponsiveContainer>
    </section>

    <ResponsiveContainer>
      <section class="wrapper">
        <div class="article">
          <PrismicRichText richText={data.doc.data.description} leading="prose"/>
          <RegisterButton />
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

const RegisterButton = () => (
  <button
    class="register-button"
    onClick={() => {
      state.showHubspotForm = true;
    }}>
    Register Now
  </button>
)

const OverlayForm = ({ data }: { data: PrismicResource }) => {
  const formId = data.doc.data.hubspot_form_id;

  return (
  <ThemeProvider class="overlay-form" type="base">
    <div class="heading-group">
      <Heading level={3}>Stream {data.title}</Heading>
      <Paragraph>You're just a few clicks away from our free Webinar</Paragraph>
    </div>
    <hubspot-form
      ajax={true}
      formId={formId}
      onFormSubmitted={() => {
        state.hubspotGatedPassed = true;
      }}
    />
  </ThemeProvider> )
};
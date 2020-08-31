import { h, Component, Prop, Host } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent, Paragraph, PrismicRichText, DateTime } from '@ionic-internal/ionic-ds';

import { PrismicResource, ResourceAuthor } from '../../../../models/prismic';
import { getAuthorsForPrismicDoc } from '../../../../utils/prismic/prismic';
// import ResourcesSubNav from './ResourceSubNav';


@Component({
  tag: 'resource-webinar',
  styleUrl: 'resource-webinar.scss',
  scoped: true
})
export class ResourceWebinar {
  private authors!: ResourceAuthor[] | null;
  private happened!: boolean;
  private hasVideo!: boolean;
  @Prop() prismicData!: PrismicResource;

  componentWillLoad() {
    // this.happened = +parseISO(resource.doc.data.when) < +new Date();
    this.hasVideo = !!this.prismicData.doc.data.wistia_id;

    this.authors = getAuthorsForPrismicDoc(this.prismicData.doc);
    console.log(this.authors);
  }

  render() {
    const resource = this.prismicData;
    console.log(resource);
    return (
      <Host class="resource-webinar">
        {this.authors
        ? this.authors.map(author => {
            <resource-author author={author} />
          }) : ''}        
        <ThemeProvider type="editorial">
          <ResponsiveContainer>
            <div class="resource-webinar__content">
              <div class="resource-webinar__header">
                {/* <ResourceMeta resource={resource} /> */}
                <Heading level={1}>{resource.title}</Heading>
                {!this.happened ? <WebinarBegins resource={resource} /> : null}
                <div class="resource-webinar__authors">
                  {/* {resource.authors.map((a) => (
                    <ResourceAuthorItem author={a} key={a.name} singleLine={true} />
                  ))} */}
                </div>
              </div>

              {this.hasVideo ? (
                <div class="resource-webinar__video-wrap">
                  {/* <Video resource={resource} blurred={!state.hubspotGatedPassed} />
                  {!state.hubspotGatedPassed ? <OverlayForm resource={resource} /> : null} */}
                </div>
              ) : null}

              {!this.happened ? [<RegisterButton />, <hr />] : null}

              {/* {!this.happened && (
                <site-modal open={state.showHubspotForm} modalClose={() => (state.showHubspotForm = false)}>
                  <hgroup>
                    <Heading level={2}>Register for {resource.title}</Heading>
                    <p>Enter your information below to join the Webinar list</p>
                  </hgroup>
                  <hubspot-form
                    formId={resource.doc.data.hubspot_form_id}
                    ajax={false}
                    onFormSubmitted={() => {
                      // state.hubspotGatedPassed = true;
                    }}
                  />
                </site-modal>
              )} */}

              <article class="resource-webinar__article">
                <PrismicRichText richText={resource.doc.data.description} />
                {!this.happened ? <RegisterButton /> : null}
              </article>
            </div>
          </ResponsiveContainer>
        </ThemeProvider>
      </Host>
    )
  }
};

const RegisterButton = () => (
  <button
    class="resource-webinar__register-button"
    onClick={() => {
      // state.showHubspotForm = true;
    }}>
    Register Now
  </button>
);

const OverlayForm = ({ resource }: { resource: PrismicResource }) => (
  <ThemeProvider type="base">
    <div class="resource-webinar__form">
        <hgroup>
          <Heading level={3}>Stream {resource.title}</Heading>
          <Paragraph>You're just a few clicks away from our free Webinar</Paragraph>
        </hgroup>
        <hubspot-form
          ajax={true}
          formId={resource.doc.data.hubspot_form_id}
          onFormSubmitted={() => {
            // state.hubspotGatedPassed = true;
          }}
        />
    </div>
  </ThemeProvider>
);

const Video = ({ resource, blurred = false }: { resource: PrismicResource; blurred: boolean }) => (
  <div class="resource-webinar__video">
    {blurred ? <div class="resource-webinar__video--disabled" /> : null}
    <wistia-video videoId={resource.doc.data.wistia_id} class={blurred ? 'video--blurred' : ''} />
  </div>
);

const WebinarBegins = ({ resource }: { resource: PrismicResource }) => (
  <div class="resource-webinar__begins">
    Begins: <WebinarTime when={resource.doc.data.when} />
  </div>
);

const WebinarTime = ({ when }: { when: string }) => {
  // const date = parseISO(when);
  // const now = +new Date();

  // if (date.getTime() < now) {
  //   return <span>On Demand</span>;
  // }

  // return <DateTime date={date} />;
};

/*
const WebinarHosts = ({ hosts }: { hosts: ResourceAuthor[] }) => (
  <span>
    {hosts.length > 1 ? 'Speakers' : 'Speaker'}:{' '}
    {hosts.map((host, i) => (
      <a href={host.link} target="_blank">
        {host.name}
        {i < hosts.length - 1 ? ', ' : ''}
      </a>
    ))}
  </span>
);
*/

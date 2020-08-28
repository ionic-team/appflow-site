import { h, Component, Prop } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent, Paragraph, PrismicRichText, DateTime, PrismicResponsiveImage } from '@ionic-internal/ionic-ds';

import { PrismicResource } from '../../../../models/prismic';
import { slugify } from '../../../../utils/slugify';
// import ResourcesSubNav from './ResourceSubNav';


@Component({
  tag: 'resource-whitepaper',
  styleUrl: 'resource-whitepaper.scss',
  scoped: true
})
export class ResourceWhitepaper {
  @Prop() prismicData!: PrismicResource;

  componentWillLoad() {

  }

  render() {
    const resource = this.prismicData;
    
    return [
      // <ResourcesSubNav resourceItem={resource} />,
      <ThemeProvider type="editorial">
        <div class="resource-whitepaper">
          <div class="resource-whitepaper__cta">
            <ResponsiveContainer>
              <hgroup class="resource-whitepaper__hgroup">
                <Heading level={6}>Whitepaper</Heading>
                <Heading level={1}>{resource.title}</Heading>
                <p class="resource-whitepaper__tagline">{resource.doc.data.tagline}</p>
              </hgroup>
            </ResponsiveContainer>
          </div>
          <ResponsiveContainer>
            <Grid class="resource-whitepaper__content">
              <Col cols={12} xs={12} sm={6} md={6}>
                <PrismicResponsiveImage image={resource.doc.data.cover_image} class="resource-whitepaper__illustration" />
                <PrismicRichText richText={resource.doc.data.description} class="resource-whitepaper__description" />
              </Col>
              <Col cols={12} xs={12} sm={6} md={6}>
                <hubspot-form formId={resource.doc.data.hubspot_form_id} />
              </Col>
            </Grid>
          </ResponsiveContainer>
        </div>
      </ThemeProvider>
    ]
  }
};
import { h, Component, Element, Prop } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent, Paragraph, PrismicResponsiveImage } from '@ionic-internal/ionic-ds';

import { PrismicResource } from '../../../../models/prismic';
import { prismicResourceToToc } from 'src/utils/prismic/prismic'
import { slugify } from '../../../../utils/slugify';
// import ResourcesSubNav from './ResourceSubNav';


@Component({
  tag: 'resource-case-study',
  styleUrl: 'resource-case-study.scss',
  scoped: true
})
export class ResourceCaseStudy {
  @Element() el!: HTMLElement;
  @Prop() prismicData!: PrismicResource;

  render() {
    const resource = this.prismicData;
    
    return [
      // <ResourcesSubNav resourceItem={resource} />,
      <div class="resource-article resource-case-study">
        <ThemeProvider type="editorial">
          <ResponsiveContainer>
            <Grid>
              <Col md={3} sm={3}>
                <resource-toc titleNames={prismicResourceToToc(this.prismicData)} />
              </Col>
              <Col md={9} sm={9} xs={12} cols={12}>
                <div class="resource-article-content">
                  <div class="heading-group">
                    <Heading level={1} id={slugify(resource.title)}>
                      {resource.title}
                    </Heading>
                    <Paragraph level={2}>{resource.description}</Paragraph>
                    <PrismicResponsiveImage image={resource.doc.data.hero_image} width="800" height="420"/>
                  </div>
                  <article>
                    <PrismicContent content={resource.doc.data.body} />
                  </article>
                </div>
              </Col>
            </Grid>
          </ResponsiveContainer>
        </ThemeProvider>
      </div>,
    ]
  }
};
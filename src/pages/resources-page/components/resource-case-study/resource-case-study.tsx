import { h, Component, Prop } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent } from '@ionic-internal/ionic-ds';

import { PrismicResource } from '../../../../models/prismic';
import { slugify } from '../../../../utils/slugify';
// import ResourcesSubNav from './ResourceSubNav';


@Component({
  tag: 'resource-case-study',
  styleUrl: 'resource-case-study.scss',
  scoped: true
})
export class ResourceCaseStudy {
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
                {/* <resource-toc prismicResource={resource as PrismicResource} /> */}
              </Col>
              <Col md={9} sm={9} xs={12} cols={12}>
                <div class="resource-article-content">
                  <hgroup>
                    <Heading level={1} id={slugify(resource.title)}>
                      {resource.title}
                    </Heading>
                    <Text>{resource.description}</Text>
                    <HeroImage image={resource.heroImage} alt={resource.title} />
                    {/*
                  <img
                    src={resource.doc.data.hero_image.url}
                    srcset={`${resource.doc.data.hero_image['1x'].url} 1x, ${resource.doc.data.hero_image.url} 2x`}
                    alt={resource.doc.data.hero_image.alt}
                  />
                  */}
                  </hgroup>
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

const HeroImage = ({ image, alt }: { image: string; alt: string }) => <img loading={'lazy'} src={image} alt={alt} />;

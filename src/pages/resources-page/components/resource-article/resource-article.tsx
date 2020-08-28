import { h, Component, Host, Prop } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent } from '@ionic-internal/ionic-ds';

import { PrismicResource } from '../../../../models/prismic';
import { slugify } from '../../../../utils/slugify';

@Component({
  tag: 'resource-article',
  styleUrl: 'resource-article.scss',
  scoped: true
})
export class ResourceArticle {
  @Prop() prismicData!: PrismicResource;

  render() {
    const resource = this.prismicData;

    return (
    <Host>
      {/* <ResourcesSubNav resourceItem={resource} /> */}
      <div class="resource-article">
        <ThemeProvider type="editorial">
          <ResponsiveContainer>
            <Grid>
              <Col md={3} sm={3}>
                <resource-toc prismicResource={resource as PrismicResource} />
              </Col>
              <Col md={9} sm={9} xs={12} cols={12}>
                <div class="resource-article-content">
                  <hgroup>
                    <Heading level={1} id={slugify(resource.title)}>
                      {resource.title}
                    </Heading>
                    <Text>{resource.description}</Text>
                    {/* <ResourceAuthorItem author={resource.authors[0]} byline={true} /> */}
                    <img
                      loading={'lazy'}
                      src={resource.doc.data.hero_image.url}
                      srcset={`${resource.doc.data.hero_image['1x'].url} 1x, ${resource.doc.data.hero_image.url} 2x`}
                      alt={resource.doc.data.hero_image.alt || resource.title}
                    />
                  </hgroup>
                  <article>
                    <PrismicContent content={resource.doc.data.body} />
                  </article>
                </div>
              </Col>
            </Grid>
          </ResponsiveContainer>
        </ThemeProvider>
      </div> 
    </Host>)
  }
};

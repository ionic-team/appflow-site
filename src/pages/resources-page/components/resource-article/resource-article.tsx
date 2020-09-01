import { h, Component, Host, Prop } from '@stencil/core';

import { ThemeProvider, ResponsiveContainer, Grid, Text, Heading, Col, PrismicContent, Paragraph } from '@ionic-internal/ionic-ds';

import { PrismicResource } from '../../../../models/prismic';
import { slugify } from '../../../../utils/slugify';
import { getAuthorsForPrismicDoc } from 'src/utils/prismic/prismic';

@Component({
  tag: 'resource-article',
  styleUrl: 'resource-article.scss',
  scoped: true
})
export class ResourceArticle {
  @Prop() prismicData!: PrismicResource;

  render() {
    const authors = getAuthorsForPrismicDoc(this.prismicData.doc)
    const resource = this.prismicData;
    
    return (
    <Host>
      <div class="resource-article">
        <ThemeProvider type="editorial">
          <ResponsiveContainer>
            <Grid>
              <Col md={3} sm={3}>
                <resource-toc prismicResource={resource} />
              </Col>
              <Col md={9} sm={9} xs={12} cols={12}>
                <div class="resource-article-content">
                  <div class="heading-group">
                    <Heading class="ui-theme--editorial" level={1} id={slugify(resource.title)}>
                      {resource.title}
                    </Heading>
                    <Paragraph level={2}>{resource.description}</Paragraph>
                    {authors.map(author => (
                      <resource-author-item author={author}/>
                    ))}                    
                    {/* <ResourceAuthorItem author={resource.authors[0]} byline={true} /> */}
                    <img
                      loading={'lazy'}
                      src={resource.doc.data.hero_image.url}
                      srcset={`${resource.doc.data.hero_image['1x'].url} 1x, ${resource.doc.data.hero_image.url} 2x`}
                      alt={resource.doc.data.hero_image.alt || resource.title}
                    />
                  </div>
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

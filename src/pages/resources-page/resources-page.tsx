import { Component, Host, h, getAssetPath} from '@stencil/core';
import { ResourceLink, PrismicDoc, PrismicResource } from '../../models/prismic'

import { prismicDocToResource } from '../../utils/prismic/prismic';
import { Client } from '../../utils/prismic/prismic-configuration'
import { getPage } from '../../utils/prismic/prismic';
import { ResponsiveContainer, Col, Heading, Grid } from '@ionic-internal/ionic-ds';
import store from '../../store';

interface PrismicPreviews {
  feature: PrismicResource;
  latestAnnouncements: PrismicResource[];
  midFeatures: PrismicResource[];
  bottomFeatures: PrismicResource[];
  trenchFeatures: PrismicResource[];
  chasmFeatures: PrismicResource[];
};

@Component({
  tag: 'resources-page',
  styleUrl: 'resources-page.scss',
  assetsDirs: ['assets'],
  scoped: true
})
export class ResourcesPage {
  private prismicPreviews!: PrismicPreviews;
  
  async componentWillLoad() {
    await getPage('appflow_resources');
    //get ids of all linked resources
    const ids = Object.values<ResourceLink>(store.pageData).reduce((acc: string[], cur: ResourceLink) => {
      if (cur.link_type === 'Any' || cur.link_type === undefined) return acc;    
      return [...acc, cur.id];
    }, [] )

    const response = await Client().getByIDs(ids, {});
    const resources = response.results.reduce((acc: Array<PrismicResource>, cur: PrismicDoc) => {
      return [...acc, prismicDocToResource(cur)];
    }, [])

    this.prismicPreviews  = {
      feature: resources[0] || [],
      latestAnnouncements: resources.slice(1, 4) || [],
      midFeatures: resources.slice(4, 6) || [],
      bottomFeatures: resources.slice(6, 12) || [],
      trenchFeatures: resources.slice(12, 15) || [],
      chasmFeatures: resources.slice(15, 27) || [],
    };
  }

  render = () => (
    <Host>
      <Feature prismicData={this.prismicPreviews.feature}/>
      <Latest prismicData={this.prismicPreviews.latestAnnouncements} />
      <Mid prismicData={this.prismicPreviews.midFeatures} />
    </Host>
  )
}

const Feature = ({ prismicData }: { prismicData: PrismicResource }) => {

  return (
    <ResponsiveContainer id="feature" as="section">      
      <resource-card headingLevel={1} prismicData={prismicData} row imageHeight="100%"/>
    </ResponsiveContainer>
  );
}

const Latest = ({ prismicData }: { prismicData: PrismicResource[] }) => {
  return (
    <ResponsiveContainer id="latest" as="section">
      <Heading class="ui-theme--editorial" level={5}>Latest Resources</Heading>
      <hr class="top"/>
      <Grid>
        {prismicData.map((data) => (
        <Col cols={4}>
          <resource-card headingLevel={4} prismicData={data} description={false} imageHeight="128px"/>
        </Col> ))}
      </Grid>
      <hr class="bottom"/>
    </ResponsiveContainer>
  );
}

const Mid = ({ prismicData }: { prismicData: PrismicResource[] }) => {
  return (
    <ResponsiveContainer id="mid" as="section">
      {console.log(prismicData)}
      <Grid>
        {prismicData.map((data) => (
        <Col cols={6}>
          <resource-card prismicData={data} imageHeight="224px"/>
        </Col> ))}
      </Grid>
    </ResponsiveContainer>
  );
}
    
const Push = () => {
  return (
    <section id="push">

    </section>
  )
}

const Live = () => {

  return (
    <section id="live">

    </section>
  )
}

const Native = () => {
  return (
    <section id="native">

    </section>
  )
}

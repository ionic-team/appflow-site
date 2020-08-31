import { Component, Host, h, Prop, Watch, State } from '@stencil/core';
import { ResourceLink, PrismicDoc, PrismicResource, ResourceType } from '../../models/prismic'

import { prismicDocToResource } from '../../utils/prismic/prismic';
import { Client } from '../../utils/prismic/prismic-configuration'
import { getPage } from '../../utils/prismic/prismic';
import { ResponsiveContainer, Col, Heading, Grid } from '@ionic-internal/ionic-ds';
import state from '../../store';
import router from '../../router';
import { typeToResourceType } from 'src/utils/prismic/data';


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
  private prismicClient = Client();
  private prismicPreviews!: PrismicPreviews;
  private currentResource: {
    resource?: PrismicResource,
    type?: ResourceType
  } = {}
  private allResources!: PrismicResource[];
  private prismicId!: string;
  private havePrismicData: boolean = false;
  @Prop() prismicUid?: string;
  @State() detailView: boolean = false;
  
  @Watch('prismicUid')
  async componentWillLoad() {
    if (this.prismicUid) return this.getDetail();

    if (!this.havePrismicData) {
      await this.getAllPages()
      this.havePrismicData = true;
    }  
    console.log(this.allResources);
    
    this.detailView = false;
  }

  async getDetail() {
    if (!this.havePrismicData) {
      await this.getAllPages()
      this.havePrismicData = true;
    }   

    this.getPrismicInfo();

    this.allResources.some((resource) => {
      if (resource.doc?.id === this.prismicId) {
        this.currentResource.resource = resource;
        return true;
      }
    })

    this.detailView = true;
  }

  getPrismicInfo() {
    const match = Object.values(state.pageData).some((val: any) => {
      if (val.uid === this.prismicUid) {
        this.prismicId = val.id;
        this.currentResource.type = val.type;
        return true;
      }
    })

    if (!match) console.error('no prismic document with uid: ', this.prismicUid);
  }

  async getAllPages() {
    await getPage('appflow_resources');

    // get ids of all linked resources
    const ids = Object.values<ResourceLink>(state.pageData).reduce((acc: string[], cur: ResourceLink) => {
      if (cur.link_type === 'Any' || cur.link_type === undefined) return acc;    
      return [...acc, cur.id];
    }, [] )

    // get prismic docs by ids
    const response = await this.prismicClient.getByIDs(ids, {});
    this.allResources = response.results.map((resource) => {
      return prismicDocToResource(resource);
    });

    this.prismicPreviews  = {
      feature: this.allResources[0] || [],
      latestAnnouncements: this.allResources.slice(1, 4) || [],
      midFeatures: this.allResources.slice(4, 6) || [],
      bottomFeatures: this.allResources.slice(6, 12) || [],
      trenchFeatures: this.allResources.slice(12, 15) || [],
      chasmFeatures: this.allResources.slice(15, 27) || [],
    };
  }

  renderResource = () => {
    if (this.currentResource.type === undefined) return console.error('no resource type present on resource');
    if (this.currentResource.resource === undefined) return console.error('no resource present');
    
    switch (typeToResourceType(this.currentResource.type)) {
      case ResourceType.Article:
        return <resource-article prismicData={this.currentResource.resource} />;
      case ResourceType.CaseStudy:
        return <resource-case-study prismicData={this.currentResource.resource} />;
      case ResourceType.Webinar:
        return <resource-webinar prismicData={this.currentResource.resource} />;
      case ResourceType.CustomerInterview:
        return <resource-custom-interview prismicData={this.currentResource.resource} />;
      case ResourceType.Whitepaper:
        return <resouce-whitepaper prismicData={this.currentResource.resource} />;
    }

    return null;
  };

  render() {
    if (this.detailView) {
      return this.renderResource();
    }

    return(
      <Host>
        <Feature prismicData={this.prismicPreviews.feature}/>
        <Latest prismicData={this.prismicPreviews.latestAnnouncements} />
        <Mid prismicData={this.prismicPreviews.midFeatures} />
        <Bottom prismicData={this.prismicPreviews.bottomFeatures} />
        <Trench prismicData={this.prismicPreviews.trenchFeatures} />
        <Chasm prismicData={this.prismicPreviews.chasmFeatures} />
      </Host> )
  }
}

const Feature = ({ prismicData }: { prismicData: PrismicResource }) => {
  return (
    <ResponsiveContainer id="feature" as="section">      
      <resource-card
        row
        headingLevel={1}
        prismicData={prismicData}        
        imageHeight="100%"
        routing={{
          base: '/resources',
          router
        }}
      />
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
          <resource-card
            routing={{
              base: '/resources',
              router
            }}
            prismicData={data}
            description={false}
            imageHeight="128px"
          />
        </Col> ))}
      </Grid>
      <hr class="bottom"/>
    </ResponsiveContainer>
  );
}

const Mid = ({ prismicData }: { prismicData: PrismicResource[] }) => {
  return (
    <ResponsiveContainer id="mid" as="section">
      <Grid>
        {prismicData.map((data) => (
        <Col cols={6}>
          <resource-card
            routing={{
              base: '/resources',
              router
            }}
            headingLevel={3}
            prismicData={data}
            imageHeight="224px"
          />
        </Col> ))}
      </Grid>
    </ResponsiveContainer>
  );
}
    
const Bottom = ({ prismicData }: { prismicData: PrismicResource[] }) => {
  return (
    <ResponsiveContainer id="bottom" as="section">
      <Grid>
        {prismicData.map((data) => (
        <Col cols={4}>
          {data.type === 'Whitepaper'
          ? <WhitepaperCard />
          : <resource-card
              routing={{
                base: '/resources',
                router
              }}
              prismicData={data}
            /> } 
        </Col> ))}
      </Grid>
    </ResponsiveContainer>
  )
}

const Trench = ({ prismicData }: { prismicData: PrismicResource[] }) => {
  return (
    <ResponsiveContainer id="trench" as="section">
      <Grid>
        {prismicData.map((data) => (
        <Col cols={4}>
          {data.type === 'Whitepaper'
          ? <WhitepaperCard />
          : <resource-card
              routing={{
                base: '/resources',
                router
              }}
              prismicData={data}
            /> } 
        </Col> ))}
      </Grid>
    </ResponsiveContainer>
  )
}

const Chasm = ({ prismicData }: { prismicData: PrismicResource[] }) => {
  return (
    <ResponsiveContainer id="trench" as="section">
      <Grid>
        {prismicData.map((data) => (
        <Col cols={4}>
          {data.type === 'Whitepaper'
          ? <WhitepaperCard />
          : <resource-card
              routing={{
                base: '/resources',
                router
              }}
              prismicData={data}
            /> }          
        </Col> ))}
      </Grid>
    </ResponsiveContainer>
  )
}

const WhitepaperCard = () => (
  <div></div>
);

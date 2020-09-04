import { ResourceType, ResourceSource, Resource, LandingData } from '../../global/models/prismic';

import { slugify } from '../slugify';
import { Client } from './prismic-configuration';
import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents';
import { prismicDocToResource, resourceTypeToPrismicType, prismicTypeToResourceType } from './prismic';
import Prismic from 'prismic-javascript';

export const getResourceTypeForParam = (param: string) =>
  (({
    articles: ResourceType.Article,
    blogs: ResourceType.Blog,
    docs: ResourceType.Doc,
    'case-studies': ResourceType.CaseStudy,
    courses: ResourceType.Course,
    'customer-interviews': ResourceType.CustomerInterview,
    guides: ResourceType.Guide,
    learning: ResourceType.Learning,
    podcasts: ResourceType.Podcast,
    tutorial: ResourceType.Tutorial,
    videos: ResourceType.Video,
    webinars: ResourceType.Webinar,
    whitepapers: ResourceType.Whitepaper,
  } as { [name: string]: ResourceType })[param]);

export const typeToResourceType = (type: string) =>
  (({
    article: ResourceType.Article,
    case_study: ResourceType.CaseStudy,
    webinar: ResourceType.Webinar,
    whitepaper: ResourceType.Whitepaper,
    podcast: ResourceType.Podcast,
    video: ResourceType.Video,
  } as any)[type]);

  
export const resourceTypeToPath = (type: ResourceType) =>
  ({
    [ResourceType.Article]: 'articles',
    [ResourceType.Blog]: 'blogs',
    [ResourceType.Book]: 'books',
    [ResourceType.CaseStudy]: 'case-studies',
    [ResourceType.Course]: 'courses',
    [ResourceType.CustomerInterview]: 'customer-interviews',
    [ResourceType.Doc]: 'docs',
    [ResourceType.Guide]: 'guides',
    [ResourceType.Learning]: 'learning',
    [ResourceType.Podcast]: 'podcasts',
    [ResourceType.Tutorial]: 'tutorials',
    [ResourceType.Video]: 'videos',
    [ResourceType.Webinar]: 'webinars',
    [ResourceType.Whitepaper]: 'whitepapers',
  }[type]);

export const getResourceSourceForType = (type: ResourceType) =>
  ({
    [slugify(ResourceType.Article)]: ResourceSource.Prismic,
    [slugify(ResourceType.Blog)]: ResourceSource.Prismic,
    [slugify(ResourceType.CaseStudy)]: ResourceSource.Prismic,
    [slugify(ResourceType.Course)]: ResourceSource.Prismic,
    [slugify(ResourceType.Doc)]: ResourceSource.Prismic,
    [slugify(ResourceType.Guide)]: ResourceSource.Prismic,
    [slugify(ResourceType.Podcast)]: ResourceSource.Prismic,
    [slugify(ResourceType.Tutorial)]: ResourceSource.Prismic,
    [slugify(ResourceType.Video)]: ResourceSource.Prismic,
    [slugify(ResourceType.Webinar)]: ResourceSource.Prismic,
    [slugify(ResourceType.Whitepaper)]: ResourceSource.Prismic,
  }[slugify(type)]);

export const getResource = async (type: ResourceType, resourceId: string) => {
  let resource: Resource | null = null;

  let prismicDoc: PrismicDocument | null = null;
  const prismicClient = Client();

  const prismicType = resourceTypeToPrismicType(type);
  prismicDoc = await prismicClient.getByUID(prismicType, resourceId, {});

  if (!prismicDoc) {
    return null;
  }

  resource = prismicDocToResource(prismicDoc);

  return resource;
};

export const getLandingData = async (type?: ResourceType) => {
  const prismicClient = Client();

  const prismicType = type ? resourceTypeToPrismicType(type) : null;

  const resourcesLanding = await prismicClient.query(Prismic.Predicates.at('document.type', 'resources_landing'), {});

  const result = resourcesLanding.results[0];

  if (!result) {
    throw new Error('Landing page not found in prismic!');
  }

  const k = (key: string) => (prismicType ? `${prismicType}_${key}` : key);

  const sections = {
    hero: result.data[k('hero')],
    latest_1: result.data[k('latest_1')],
    latest_2: result.data[k('latest_2')],
    latest_3: result.data[k('latest_3')],
    mid_1: result.data[k('mid_1')],
    mid_2: result.data[k('mid_2')],
    bottom_1: result.data[k('bottom_1')],
    bottom_2: result.data[k('bottom_2')],
    bottom_3: result.data[k('bottom_3')],
    bottom_4: result.data[k('bottom_4')],
    bottom_5: result.data[k('bottom_5')],
    bottom_6: result.data[k('bottom_6')],
    trench_1: result.data[k('trench_1')],
    trench_2: result.data[k('trench_2')],
    trench_3: result.data[k('trench_3')],
    chasm_1: result.data[k('chasm_1')],
    chasm_2: result.data[k('chasm_2')],
    chasm_3: result.data[k('chasm_3')],
    chasm_4: result.data[k('chasm_4')],
    chasm_5: result.data[k('chasm_5')],
    chasm_6: result.data[k('chasm_6')],
    chasm_7: result.data[k('chasm_7')],
    chasm_8: result.data[k('chasm_8')],
    chasm_9: result.data[k('chasm_9')],
    chasm_10: result.data[k('chasm_10')],
    chasm_11: result.data[k('chasm_11')],
    chasm_12: result.data[k('chasm_12')],
  };

  let landingData: LandingData = {
    feature: null,
    latestAnnouncements: [],
    midFeatures: [],
    bottomFeatures: [],
    trenchFeatures: [],
    chasmFeatures: [],
  };

  await Promise.all(
    Object.keys(sections).map(async (s) => {
      const data = result.data[k(s)];
      if (!data || !data.type) {
        return null;
      }

      const resourceType = prismicTypeToResourceType(data.type);

      if (!resourceType) {
        console.error('Unknown resource type!', data.type);
        return null;
      }

      const resource = await getResource(resourceType, data.uid);

      if (s === 'hero') {
        landingData.feature = resource!;
      } else if (s.indexOf('latest_') >= 0) {
        landingData.latestAnnouncements[parseInt(s.split('_')[1], 10)] = resource!;
      } else if (s.indexOf('mid_') >= 0) {
        landingData.midFeatures[parseInt(s.split('_')[1], 10)] = resource!;
      } else if (s.indexOf('bottom_') >= 0) {
        landingData.bottomFeatures[parseInt(s.split('_')[1], 10)] = resource!;
      } else if (s.indexOf('trench_') >= 0) {
        landingData.trenchFeatures[parseInt(s.split('_')[1], 10)] = resource!;
      } else if (s.indexOf('chasm_') >= 0) {
        landingData.chasmFeatures[parseInt(s.split('_')[1], 10)] = resource!;
      }
    }),
  );

  return landingData;
};

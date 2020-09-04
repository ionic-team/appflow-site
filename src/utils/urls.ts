import { ResourceType, Resource, PrismicResource } from '../models/prismic';
import { resourceTypeToPath } from './prismic/data';

import PrismicDom from 'prismic-dom';
import { linkResolver } from './prismic/prismic';

export const getResourcesUrl = () => `/resources/`;
/**
 * Get the path for the given resource type. For example ResourceType.Articles
 * will be at /articles
 * @param type
 */
export const getResourceTypeUrl = (type: ResourceType) => {
  const pathType = resourceTypeToPath(type);
  return `${getResourcesUrl()}${pathType}`;
};

/**
 * Get the full path to the given resource
 * @param record
 */
export const getResourceUrl = (resource: Resource) => {
  const pr = resource as PrismicResource;

  // If the resource has an external content url, use that
  if (pr.doc.data.content_url && pr.doc.data.content_url.url) {
    return PrismicDom.Link.url(pr.doc.data.content_url, linkResolver);
    //return pr.doc.data.content_url;
  }

  switch (resource.type) {
    case ResourceType.Article:
    case ResourceType.Webinar:
    case ResourceType.CaseStudy:
    case ResourceType.CustomerInterview:
    case ResourceType.Whitepaper:
      return `${getResourceTypeUrl(resource.type)}/${resource.id}`;
    case ResourceType.Video:
      return getVideoUrl(resource);
    default:
      return `${getResourceTypeUrl(resource.type)}/${resource.id}`;
  }
};

const getVideoUrl = (resource: Resource) => {
  const pr = resource as PrismicResource;

  if (pr.doc.data.wistia_id) {
    return `https://ionicpro.wistia.com/medias/${pr.doc.data.wistia_id}`;
  } else if (pr.doc.data.youtube_id) {
    return `https://www.youtube.com/watch?v=${pr.doc.data.youtube_id}`;
  }

  return '';
};

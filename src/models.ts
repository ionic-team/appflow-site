import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents';
import ApiSearchResponse from 'prismic-javascript/d.ts/ApiSearchResponse';

export interface PrismicDocsResponse {
  docs: PrismicDocument[];
  _prismic: ApiSearchResponse;
}
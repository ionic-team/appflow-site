import Prismic from 'prismic-javascript';

export const apiEndpoint = process.env.PRISMIC_ENDPOINT || null;

// Client method to query documents from the Prismic repo

export const Client = (req: any = null) => Prismic.client(apiEndpoint!, (createClientOptions as any)(req, null));

const createClientOptions = (req: any = null, prismicAccessToken: string | null = null) => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken ? { accessToken: prismicAccessToken } : {};
  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

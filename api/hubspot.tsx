import { NowRequest, NowResponse } from '@vercel/node'

import Hubspot from 'hubspot';

export default (req: NowRequest, res: NowResponse) => {
  const hs = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY });

  console.log(hs);
}
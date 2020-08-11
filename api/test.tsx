import { NowRequest, NowResponse } from '@vercel/node'

export default (req: NowRequest, res: NowResponse) => {
  res.json({ name: 'John', email: 'john@example.com' })
}
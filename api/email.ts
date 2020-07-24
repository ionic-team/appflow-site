import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';


module.exports = async (req: NowRequest, res: NowResponse) => {
  const url = 'https://api.sendgrid.com/v3/mail/send'

  const data = {
    'personalizations': [
      {
        'to': [
          {
            'email': 'hi@ionic.io'
          }
        ],
        'subject': 'Demo/Inquiry from ' + req.body['from']
      }
    ],
    'from': {
      'email': req.body['email']
    },
    'content': [
      {
        'type': 'text/plain',
        'value': req.body['message']
      }
    ]
  }

  const response = await fetch(url,  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.SENDGRID_APIKEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  response.status.toString().charAt(0) === 2 ? res.send(200) : res.send(400);
}
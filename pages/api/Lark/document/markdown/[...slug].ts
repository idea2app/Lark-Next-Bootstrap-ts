import { safeAPI } from '../../../core';
import { lark } from '../../core';

export default safeAPI(async ({ method, query: { slug } }, response) => {
  const [type, id] = slug as string[];

  switch (method) {
    case 'GET': {
      await lark.getAccessToken();

      const markdown = await lark.downloadMarkdown(`${type}/${id}`);

      return void response
        .setHeader('Content-Type', 'text/markdown; charset=utf-8')
        .end(markdown);
    }
  }
  response.setHeader('Allow', ['GET']);
  response.status(405).end();
});

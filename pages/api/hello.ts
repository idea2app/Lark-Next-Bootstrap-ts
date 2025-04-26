// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createRouter } from 'next-ssr-middleware';

import { withSafeKoaRouter } from './core';

const router = createRouter(import.meta.url);

router.get('/', async ctx => {
  ctx.status = 401;
  ctx.body = { name: 'John Doe' };
});

export default withSafeKoaRouter(router);

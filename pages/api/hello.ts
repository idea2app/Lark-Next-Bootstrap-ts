// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Router from '@koa/router';

import { routeOf, withKoaRouter } from './core';

const router = new Router({ prefix: routeOf(import.meta.url) });

router.get('/', async ctx => {
  ctx.status = 401;
  ctx.body = { name: 'John Doe' };
});

export default withKoaRouter(router);

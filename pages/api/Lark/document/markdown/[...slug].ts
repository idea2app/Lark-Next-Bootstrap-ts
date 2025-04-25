import Router from '@koa/router';

import { withKoaRouter } from '../../../core';
import { lark } from '../../core';

const router = new Router({ prefix: '/api/Lark/document/markdown' });

router.get('/:type/:id', async context => {
  const { type, id } = context.params;

  const markdown = await lark.downloadMarkdown(`${type}/${id}`);

  context.set('Content-Type', 'text/markdown; charset=utf-8');
  context.body = markdown;
});

export default withKoaRouter(router);

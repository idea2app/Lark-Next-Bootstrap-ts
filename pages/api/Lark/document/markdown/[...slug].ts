import { createRouter } from 'next-ssr-middleware';

import { withSafeKoaRouter } from '../../../core';
import { lark } from '../../core';

const router = createRouter(import.meta.url);

router.get('/:type/:id', async context => {
  const { type, id } = context.params;

  const markdown = await lark.downloadMarkdown(`${type}/${id}`);

  context.set('Content-Type', 'text/markdown; charset=utf-8');
  context.body = markdown;
});

export default withSafeKoaRouter(router);

import Router from '@koa/router';
import { fileTypeFromStream } from 'file-type';
import MIME from 'mime';
import { Readable } from 'stream';

import { withKoaRouter } from '../../../core';
import { lark } from '../../core';

export const CACHE_HOST = process.env.NEXT_PUBLIC_CACHE_HOST!;

const router = new Router({ prefix: '/api/Lark/file' });

router.all('/:id/:name', async context => {
  const { method, url, params, query } = context;
  const { id, name } = params;

  if (query.cache) {
    const { pathname } = new URL(url!, `http://${context.headers.host}`);

    return context.redirect(new URL(pathname, CACHE_HOST) + '');
  }

  const token = await lark.getAccessToken();

  const response = await fetch(
    lark.client.baseURI + `drive/v1/medias/${id}/download`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const { ok, status, headers, body } = response;

  if (!ok) {
    context.status = status;

    return (context.body = await response.json());
  }

  const mime = headers.get('Content-Type'),
    [stream1, stream2] = body!.tee();

  const contentType =
    !mime || mime.startsWith('application/octet-stream')
      ? MIME.getType(name! + '') || (await fileTypeFromStream(stream1))?.mime
      : mime;
  context.set('Content-Type', contentType || 'application/octet-stream');
  context.set('Content-Disposition', headers.get('Content-Disposition') || '');
  context.set('Content-Length', headers.get('Content-Length') || '');

  if (method === 'GET')
    // @ts-expect-error Web type compatibility
    context.body = Readable.fromWeb(stream2);
});

export default withKoaRouter(router);

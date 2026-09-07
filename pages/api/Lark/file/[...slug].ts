import formidable from 'formidable';
import { readFile } from 'fs/promises';
import { Middleware } from 'koa';
import { UploadTargetType } from 'mobx-lark';
import { createKoaRouter, withKoaRouter } from 'next-ssr-middleware';
import { Readable } from 'stream';
import { parseJSON } from 'web-utility';

import { safeAPI, verifyJWT } from '../../../../lib/API';
import { getFileMIME } from '../../../../lib/file';
import { downloadLarkFile, lark } from '../../../../lib/Lark';
import { CACHE_HOST, LARK_API_HOST } from '../../../../models/configuration';

export const config = { api: { bodyParser: false } };

const router = createKoaRouter(import.meta.url);

const downloader: Middleware = async context => {
  const { method, url, params, query } = context;
  const { id, name } = params;

  if (query.cache) {
    const { pathname } = new URL(url!, `http://${context.headers.host}`);

    return context.redirect(new URL(pathname, CACHE_HOST) + '');
  }

  const response = await downloadLarkFile(id);

  const { ok, status, headers, body } = response;

  if (!ok) {
    context.status = status;

    return (context.body = parseJSON(await response.text()));
  }
  const mime = headers.get('Content-Type'),
    [stream1, stream2] = body!.tee();

  const contentType =
    !mime || mime.startsWith('application/octet-stream')
      ? await getFileMIME(name, stream1)
      : mime;
  context.set('Content-Type', contentType || 'application/octet-stream');
  context.set('Content-Disposition', headers.get('Content-Disposition') || '');
  context.set('Content-Length', headers.get('Content-Length') || '');

  if (method === 'GET') context.body = Readable.fromWeb(stream2);
};

const uploader: Middleware = async context => {
  const { name } = context.params;

  const form = formidable();

  const [{ parent_type, parent_node }, { file }] = await form.parse(
    context.req,
  );
  if (!parent_type || !parent_node || !file?.[0].filepath)
    return (context.status = 400);

  await lark.getAccessToken();

  const buffer = await readFile(file[0].filepath),
    type = await getFileMIME(name, Readable.from(buffer));

  const fileToken = await lark.uploadFile(
    new File([buffer], name, { type }),
    (parent_type + '') as UploadTargetType,
    parent_node + '',
  );
  context.status = 201;
  context.body = { link: LARK_API_HOST + `file/${fileToken}/${name}` };
};

router
  .head('/:id/:name', safeAPI, downloader)
  .get('/:id/:name', safeAPI, downloader)
  .put('/:name', safeAPI, verifyJWT, uploader);

export default withKoaRouter(router);

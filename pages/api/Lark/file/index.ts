import { fileTypeFromBuffer } from 'file-type';
import formidable from 'formidable';
import { readFile } from 'fs/promises';
import MIME from 'mime';
import { UploadTargetType } from 'mobx-lark';
import { createKoaRouter } from 'next-ssr-middleware';
import { parse } from 'path';

import { LARK_API_HOST } from '../../../../models/configuration';
import { withSafeKoaRouter } from '../../core';
import { lark } from '../core';

export const config = { api: { bodyParser: false } };

const router = createKoaRouter(import.meta.url);

router.post('/', async context => {
  const form = formidable();

  const [{ parent_type, parent_node }, { file }] = await form.parse(
    context.req,
  );
  if (!parent_type?.[0] || !parent_node?.[0] || !file?.[0])
    return (context.status = 400);

  const [{ filepath, originalFilename, mimetype }] = file;

  const buffer = await readFile(filepath);
  const ext =
    '.' + (await fileTypeFromBuffer(buffer))?.ext ||
    parse(originalFilename || filepath).ext;

  const name = parse(originalFilename || filepath).name + ext,
    type = MIME.getType(ext) || mimetype || 'application/octet-stream';

  const blob = new File([buffer as Buffer<ArrayBuffer>], name, { type });

  const file_token = await lark.uploadFile(
    blob,
    parent_type[0] as UploadTargetType,
    parent_node[0],
  );
  const link = `${LARK_API_HOST}file/${file_token}/${name}`;

  return (context.body = { link });
});

export default withSafeKoaRouter(router);

import formidable from 'formidable';
import { readFile } from 'fs/promises';
import { UploadTargetType } from 'mobx-lark';

import { LARK_API_HOST } from '../../../../models/Base';
import { safeAPI } from '../../core';
import { lark } from '../core';

export const config = { api: { bodyParser: false } };

export default safeAPI(async (request, response) => {
  switch (request.method) {
    case 'POST': {
      const form = formidable();

      const [{ parent_type, parent_node }, { file }] =
        await form.parse(request);

      if (!parent_type?.[0] || !parent_node?.[0] || !file?.[0])
        return void response.status(400).end();

      const [{ filepath, originalFilename, mimetype }] = file;

      const file_token = await lark.uploadFile(
        new File([await readFile(filepath)], originalFilename!, {
          type: mimetype!,
        }),
        parent_type[0] as UploadTargetType,
        parent_node[0],
      );

      return response.json({ link: `${LARK_API_HOST}file/${file_token}` });
    }
  }
  response.setHeader('Allow', ['POST']);
  response.status(405).end();
});

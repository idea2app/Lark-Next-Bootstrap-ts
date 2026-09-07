import { Context, Middleware } from 'koa';
import { marked } from 'marked';
import {
  LarkApp,
  LarkData,
  normalizeTextArray,
  TableCellText,
} from 'mobx-lark';
import { oauth2Signer } from 'next-ssr-middleware';
import { fetch } from 'undici';
import { buildURLData } from 'web-utility';

import { LarkAppMeta } from '../models/configuration';

export const lark = new LarkApp(LarkAppMeta);

export const normalizeMarkdownArray = (list: TableCellText[]) =>
  normalizeTextArray(list).map(text => marked(text) as string);

export const proxyLark = async <T extends LarkData>({
  method,
  url,
  headers: { host, authorization, ...headers },
  request,
}: Context) => {
  await lark.getAccessToken();

  const path = url!.slice(`/api/Lark/`.length),
    body = Reflect.get(request, 'body');

  // @ts-expect-error Type compatibility issue
  return lark.client.request<T>({ method, path, headers, body });
};

export const proxyLarkAll: Middleware = async context => {
  const { status, body } = await proxyLark(context);

  context.status = status;
  context.body = body;
};

export const larkOauth2 = oauth2Signer({
  signInURL: URI => new LarkApp(LarkAppMeta).getWebSignInURL(URI),
  accessToken: ({ code }) => new LarkApp(LarkAppMeta).getUserAccessToken(code),
  userProfile: accessToken => {
    const { secret, ...option } = LarkAppMeta;

    return new LarkApp({ ...option, accessToken }).getUserMeta();
  },
});

type AttachmentMeta = Record<`${'table' | 'field' | 'record'}Id`, string>;

export async function downloadLarkFile(
  id: string,
  { tableId, fieldId, recordId } = {} as AttachmentMeta,
) {
  const token = await lark.getAccessToken();

  const extra = tableId && {
    bitablePerm: { tableId, attachments: { [fieldId]: { [recordId]: [id] } } },
  };

  return fetch(
    lark.client.baseURI +
      `drive/v1/medias/${id}/download?${buildURLData({ extra })}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

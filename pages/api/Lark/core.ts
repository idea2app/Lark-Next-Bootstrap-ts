import { marked } from 'marked';
import {
  LarkApp,
  LarkData,
  normalizeTextArray,
  TableCellText,
} from 'mobx-lark';
import { oauth2Signer } from 'next-ssr-middleware';

import { safeAPI } from '../core';

export const larkAppMeta = {
  host: process.env.NEXT_PUBLIC_LARK_API_HOST,
  id: process.env.NEXT_PUBLIC_LARK_APP_ID!,
  secret: process.env.LARK_APP_SECRET!,
};
export const lark = new LarkApp(larkAppMeta);

export const normalizeMarkdownArray = (list: TableCellText[]) =>
  normalizeTextArray(list).map(text => marked(text) as string);

export const proxyLark = <T extends LarkData>(
  dataFilter?: (path: string, data: T) => T,
) =>
  safeAPI(async ({ method, url, headers, body }, response) => {
    if (!headers.authorization) await lark.getAccessToken();

    delete headers.host;

    const path = url!.slice(`/api/Lark/`.length);

    const { status, body: data } = await lark.client.request<T>({
      // @ts-expect-error Type compatibility issue
      method,
      path,
      // @ts-expect-error Type compatibility issue
      headers,
      body: body || undefined,
    });

    response.status(status);

    response.send(dataFilter?.(path, data!) || data);
  });

export const larkOauth2 = oauth2Signer({
  signInURL: URI => new LarkApp(larkAppMeta).getWebSignInURL(URI),
  accessToken: ({ code }) => new LarkApp(larkAppMeta).getUserAccessToken(code),
  userProfile: accessToken => {
    const { secret, ...option } = larkAppMeta;

    return new LarkApp({ ...option, accessToken }).getUserMeta();
  },
});

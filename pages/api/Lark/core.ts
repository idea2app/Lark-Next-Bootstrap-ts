import { Context, Middleware } from 'koa';
import { marked } from 'marked';
import {
  LarkApp,
  LarkData,
  normalizeTextArray,
  TableCellText,
} from 'mobx-lark';
import { oauth2Signer } from 'next-ssr-middleware';

export const larkAppMeta = {
  host: process.env.NEXT_PUBLIC_LARK_API_HOST,
  id: process.env.NEXT_PUBLIC_LARK_APP_ID!,
  secret: process.env.LARK_APP_SECRET!,
};
export const lark = new LarkApp(larkAppMeta);

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
  signInURL: URI => new LarkApp(larkAppMeta).getWebSignInURL(URI),
  accessToken: ({ code }) => new LarkApp(larkAppMeta).getUserAccessToken(code),
  userProfile: accessToken => {
    const { secret, ...option } = larkAppMeta;

    return new LarkApp({ ...option, accessToken }).getUserMeta();
  },
});

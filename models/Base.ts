import 'core-js/full/array/from-async';

import { HTTPClient } from 'koajax';
import MIME from 'mime';
import { githubClient, RepositoryModel } from 'mobx-github';
import { TableCellAttachment, TableCellMedia, TableCellValue } from 'mobx-lark';
import { DataObject } from 'mobx-restful';
import { buildURLData } from 'web-utility';

export const isServer = () => typeof window === 'undefined';

const VercelHost = process.env.VERCEL_URL,
  GithubToken = process.env.GITHUB_TOKEN;

const API_Host = isServer()
  ? VercelHost
    ? `https://${VercelHost}`
    : 'http://localhost:3000'
  : globalThis.location.origin;

export const LARK_API_HOST = `${API_Host}/api/Lark/`;

export const larkClient = new HTTPClient({
  baseURI: `${API_Host}/api/Lark/`,
  responseType: 'json',
});

githubClient.use(({ request }, next) => {
  if (GithubToken)
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${GithubToken}`,
    };

  return next();
});

export const repositoryStore = new RepositoryModel('idea2app');

type UploadedFile = Record<'originalname' | 'filename' | 'location', string>;
/**
 * @see {@link https://fakeapi.platzi.com/en/rest/files/}
 */
export async function upload(file: Blob) {
  const form = new FormData();
  form.append('file', file);

  const { body } = await larkClient.post<UploadedFile>(
    'https://api.escuelajs.co/api/v1/files/upload',
    form,
  );

  return body!.location;
}

export const DefaultImage = process.env.NEXT_PUBLIC_LOGO!;

export function fileURLOf(field: TableCellValue, cache = false) {
  if (!(field instanceof Array) || !field[0]) return field + '';

  const file = field[0] as TableCellMedia | TableCellAttachment;

  let URI = `/api/Lark/file/${'file_token' in file ? file.file_token : file.attachmentToken}`;

  if (cache)
    URI += '.' + MIME.getExtension('type' in file ? file.type : file.mimeType);

  return URI;
}

export const prefillForm = (data: DataObject) =>
  buildURLData(
    Object.entries(data).map(([key, value]) => [`prefill_${key}`, value]),
  );

export function wrapFile(URI?: TableCellValue) {
  return typeof URI === 'string'
    ? ([{ file_token: URI.split('/').at(-1) }] as TableCellValue)
    : undefined;
}

export function wrapRelation(ID?: TableCellValue) {
  return ID ? (Array.isArray(ID) ? ID : ([ID] as TableCellValue)) : undefined;
}

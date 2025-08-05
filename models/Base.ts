import 'core-js/full/array/from-async';

import { HTTPClient } from 'koajax';
import { githubClient, RepositoryModel } from 'mobx-github';
import { TableCellAttachment, TableCellMedia, TableCellValue } from 'mobx-lark';
import { DataObject } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { GITHUB_TOKEN, LARK_API_HOST } from './configuration';

export const larkClient = new HTTPClient({
  baseURI: LARK_API_HOST,
  responseType: 'json',
});

githubClient.use(({ request }, next) => {
  if (GITHUB_TOKEN)
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${GITHUB_TOKEN}`,
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

export function fileURLOf(field: TableCellValue, cache = false) {
  if (!(field instanceof Array) || !field[0]) return field + '';

  const file = field[0] as TableCellMedia | TableCellAttachment;

  let URI = `/api/Lark/file/${'file_token' in file ? file.file_token : file.attachmentToken}/${file.name}`;

  if (cache) URI += '?cache=1';

  return URI;
}

export const prefillForm = (data: DataObject) =>
  buildURLData(
    Object.entries(data).map(([key, value]) => [`prefill_${key}`, value]),
  );

export const wrapTime = (date?: TableCellValue) =>
  date ? +new Date(date as string) : undefined;

export const wrapURL = (link?: TableCellValue) =>
  link ? { link, text: link } : undefined;

export const wrapFile = (URIs?: TableCellValue) =>
  (Array.isArray(URIs) ? URIs : [URIs])
    .map(
      URI => typeof URI === 'string' && { file_token: URI.split('/').at(-2) },
    )
    .filter(Boolean) as TableCellValue;

export const wrapRelation = (ID?: TableCellValue) =>
  ID ? (Array.isArray(ID) ? ID : ([ID] as TableCellValue)) : undefined;

import { fileTypeFromStream } from 'file-type';
import MIME from 'mime';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

export const getFileMIME = async <T extends Uint8Array<ArrayBuffer>>(
  path: string,
  data: ReadableStream<T> | Readable,
) =>
  MIME.getType(path) ||
  (
    await fileTypeFromStream(
      data instanceof ReadableStream ? data : ReadableStream.from(data),
    )
  )?.mime ||
  'application/octet-stream';

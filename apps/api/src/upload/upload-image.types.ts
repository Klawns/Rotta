import type { Readable } from 'node:stream';

export interface UploadImageBufferFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadImageStreamFile {
  completed: Promise<void>;
  fieldName: string;
  mimetype: string;
  originalname: string;
  stream: Readable;
  cancel(error?: Error): void;
}

import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { Readable } from 'node:stream';
import { UPLOAD_IMAGE_MAX_SIZE_BYTES } from './upload-image.constants';
import { parseUploadImageRequest } from './upload-image-request.util';

function createMultipartRequest(
  parts: Array<string | Buffer>,
  boundary = '----upload-image-boundary',
) {
  const chunks = parts.map((part) =>
    typeof part === 'string' ? Buffer.from(part, 'utf8') : part,
  );
  const body = Buffer.concat([
    ...chunks,
    Buffer.from(`--${boundary}--\r\n`, 'utf8'),
  ]);
  const request = Readable.from([body]) as Request;

  request.headers = {
    'content-type': `multipart/form-data; boundary=${boundary}`,
    'content-length': String(body.length),
  };

  return { boundary, request };
}

function createFilePart(
  boundary: string,
  filename: string,
  content: string | Buffer,
  options?: {
    fieldName?: string;
    mimeType?: string;
  },
) {
  const header = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="${options?.fieldName ?? 'image'}"; filename="${filename}"\r\nContent-Type: ${options?.mimeType ?? 'image/png'}\r\n\r\n`,
    'utf8',
  );
  const footer = Buffer.from('\r\n', 'utf8');
  const body = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;

  return Buffer.concat([header, body, footer]);
}

function createFieldPart(boundary: string, name: string, value: string) {
  return `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
}

async function readStream(stream: AsyncIterable<Buffer | Uint8Array>) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function drainStream(stream: AsyncIterable<Buffer | Uint8Array>) {
  try {
    await readStream(stream);
  } catch {
    // Ignore stream teardown errors when the parser rejects after resolving.
  }
}

describe('parseUploadImageRequest', () => {
  it('accepts a single image upload stream', async () => {
    const boundary = '----upload-image-boundary-valid';
    const { request } = createMultipartRequest(
      [createFilePart(boundary, 'ride.png', 'png-content')],
      boundary,
    );

    const upload = await parseUploadImageRequest(request);
    const content = await readStream(upload.stream);

    await expect(upload.completed).resolves.toBeUndefined();
    expect(upload.fieldName).toBe('image');
    expect(upload.originalname).toBe('ride.png');
    expect(upload.mimetype).toBe('image/png');
    expect(content.toString('utf8')).toBe('png-content');
  });

  it('rejects multipart requests with extra form fields before the file', async () => {
    const boundary = '----upload-image-boundary-fields';
    const { request } = createMultipartRequest(
      [
        createFieldPart(boundary, 'unexpected', 'value'),
        createFilePart(boundary, 'ride.png', 'png-content'),
      ],
      boundary,
    );

    await expect(parseUploadImageRequest(request)).rejects.toThrow(
      new BadRequestException(
        'Campos adicionais nao sao permitidos neste endpoint.',
      ),
    );
  });

  it('rejects an invalid upload field name before returning the stream', async () => {
    const boundary = '----upload-image-boundary-field-name';
    const { request } = createMultipartRequest(
      [
        createFilePart(boundary, 'ride.png', 'png-content', {
          fieldName: 'file',
        }),
      ],
      boundary,
    );

    await expect(parseUploadImageRequest(request)).rejects.toThrow(
      new BadRequestException('Campo de upload invalido. Use o campo image.'),
    );
  });

  it('rejects a second uploaded file through the completion contract', async () => {
    const boundary = '----upload-image-boundary-files';
    const { request } = createMultipartRequest(
      [
        createFilePart(boundary, 'ride.png', 'png-content-1'),
        createFilePart(boundary, 'ride-2.png', 'png-content-2'),
      ],
      boundary,
    );

    const upload = await parseUploadImageRequest(request);
    void drainStream(upload.stream);

    await expect(upload.completed).rejects.toThrow(
      new BadRequestException(
        'Apenas um arquivo de imagem e aceito por requisicao.',
      ),
    );
  });

  it('rejects uploads that exceed the configured file size limit through the completion contract', async () => {
    const boundary = '----upload-image-boundary-size';
    const { request } = createMultipartRequest(
      [
        createFilePart(
          boundary,
          'ride.png',
          Buffer.alloc(UPLOAD_IMAGE_MAX_SIZE_BYTES + 1, 0x61),
        ),
      ],
      boundary,
    );

    const upload = await parseUploadImageRequest(request);
    void drainStream(upload.stream);

    await expect(upload.completed).rejects.toThrow(
      new BadRequestException(
        `Arquivo de imagem excede o limite de ${UPLOAD_IMAGE_MAX_SIZE_BYTES} bytes.`,
      ),
    );
  });

  it('rejects unsupported mime types before returning the stream', async () => {
    const boundary = '----upload-image-boundary-mimetype';
    const { request } = createMultipartRequest(
      [
        createFilePart(boundary, 'ride.gif', 'gif-content', {
          mimeType: 'image/gif',
        }),
      ],
      boundary,
    );

    await expect(parseUploadImageRequest(request)).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. Envie apenas imagens JPG, PNG ou WEBP.',
      ),
    );
  });
});

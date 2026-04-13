import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { UploadController } from '../src/upload/upload.controller';
import { UPLOAD_IMAGE_MAX_SIZE_BYTES } from '../src/upload/upload-image.constants';
import { UploadService } from '../src/upload/upload.service';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    class MockJwtAuthGuard implements CanActivate {
      canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'user-1' };
        return true;
      }
    }

    return MockJwtAuthGuard;
  },
}));

describe('UploadController image upload (e2e)', () => {
  let app: INestApplication<App>;
  const uploadServiceMock = {
    uploadImage: jest.fn(),
    uploadImageStream: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadServiceMock.uploadImageStream.mockImplementation(async (upload: any) => {
      for await (const _chunk of upload.stream as AsyncIterable<Buffer>) {
        // Drain the upload stream to mirror the real service behavior.
      }

      await upload.completed;

      return {
        key: 'users/user-1/rides/test.webp',
      };
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: uploadServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('accepts a valid multipart image upload and forwards the normalized file contract', async () => {
    const fileBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    const response = await request(app.getHttpServer())
      .post('/upload/image')
      .query({ folder: 'rides' })
      .attach('image', fileBuffer, {
        filename: 'ride.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(response.body).toEqual({
      key: 'users/user-1/rides/test.webp',
    });
    expect(uploadServiceMock.uploadImageStream).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldName: 'image',
        mimetype: 'image/png',
        originalname: 'ride.png',
        cancel: expect.any(Function),
        completed: expect.any(Promise),
        stream: expect.anything(),
      }),
      'user-1',
      'rides',
    );
  });

  it('rejects requests without an uploaded image before reaching the service', async () => {
    await request(app.getHttpServer()).post('/upload/image').expect(400);

    expect(uploadServiceMock.uploadImageStream).not.toHaveBeenCalled();
  });

  it('rejects files that exceed the configured upload size limit after the first stream starts', async () => {
    await request(app.getHttpServer())
      .post('/upload/image')
      .attach('image', Buffer.alloc(UPLOAD_IMAGE_MAX_SIZE_BYTES + 1, 0x61), {
        filename: 'ride.png',
        contentType: 'image/png',
      })
      .expect(400);

    expect(uploadServiceMock.uploadImageStream).toHaveBeenCalledTimes(1);
  });

  it('rejects files with unsupported content types before reaching the service', async () => {
    await request(app.getHttpServer())
      .post('/upload/image')
      .attach('image', Buffer.from('gif89a'), {
        filename: 'ride.gif',
        contentType: 'image/gif',
      })
      .expect(400);

    expect(uploadServiceMock.uploadImageStream).not.toHaveBeenCalled();
  });

  it('rejects invalid upload folders before reaching the service', async () => {
    await request(app.getHttpServer())
      .post('/upload/image')
      .query({ folder: 'invalid-folder' })
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: 'ride.png',
        contentType: 'image/png',
      })
      .expect(400);

    expect(uploadServiceMock.uploadImageStream).not.toHaveBeenCalled();
  });

  it('rejects multipart requests with extra fields before reaching the service', async () => {
    await request(app.getHttpServer())
      .post('/upload/image')
      .field('note', 'unexpected')
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: 'ride.png',
        contentType: 'image/png',
      })
      .expect(400);

    expect(uploadServiceMock.uploadImageStream).not.toHaveBeenCalled();
  });

  it('rejects multipart requests with more than one image after the first stream starts', async () => {
    await request(app.getHttpServer())
      .post('/upload/image')
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: 'ride.png',
        contentType: 'image/png',
      })
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: 'ride-2.png',
        contentType: 'image/png',
      })
      .expect(400);

    expect(uploadServiceMock.uploadImageStream).toHaveBeenCalledTimes(1);
  });
});

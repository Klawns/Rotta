import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { RequestWithUser } from '../auth/auth.types';
import {
  DEFAULT_UPLOAD_IMAGE_FOLDER,
  INVALID_UPLOAD_IMAGE_FOLDER_MESSAGE,
  UPLOAD_IMAGE_ROUTE_THROTTLE_LIMIT,
  UPLOAD_IMAGE_ROUTE_THROTTLE_TTL_MS,
  isAllowedUploadImageFolder,
  type UploadImageFolder,
} from './upload-image.constants';
import { parseUploadImageRequest } from './upload-image-request.util';
import { UploadService } from './upload.service';

function getUploadImageTracker(req: RequestWithUser) {
  const userId = typeof req.user?.id === 'string' ? req.user.id : 'anonymous';
  const ip = typeof req.ip === 'string' ? req.ip : 'unknown';
  return `upload-image:${userId}:${ip}`;
}

function resolveRequestedUploadFolder(folder?: string): UploadImageFolder {
  if (typeof folder === 'undefined') {
    return DEFAULT_UPLOAD_IMAGE_FOLDER;
  }

  if (isAllowedUploadImageFolder(folder)) {
    return folder;
  }

  throw new BadRequestException(INVALID_UPLOAD_IMAGE_FOLDER_MESSAGE);
}

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Throttle({
    default: {
      limit: UPLOAD_IMAGE_ROUTE_THROTTLE_LIMIT,
      ttl: UPLOAD_IMAGE_ROUTE_THROTTLE_TTL_MS,
      getTracker: getUploadImageTracker,
    },
  })
  async uploadImage(
    @Request() req: RequestWithUser,
    @Query('folder') folder?: string,
  ) {
    const normalizedFolder = resolveRequestedUploadFolder(folder);
    const upload = await parseUploadImageRequest(req);
    this.logger.log(`UPLOAD ENDPOINT HIT - File: ${upload.originalname}`);

    return this.uploadService.uploadImageStream(
      upload,
      req.user.id,
      normalizedFolder,
    );
  }
}

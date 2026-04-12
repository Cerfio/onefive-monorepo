import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { FeedbackService } from '../feedback.service';
import { DiscordWebhookService } from '../../discord/discord-webhook.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostHogService } from 'src/posthog/posthog.service';
import { StorageService } from 'src/storage/storage.service';
import { FileService } from 'src/file/file.service';

const ALLOWED_SCREENSHOT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class CreateFeedbackHandler {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly discordWebhookService: DiscordWebhookService,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
    private readonly storageService: StorageService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    type,
    message,
    url,
    browserInfo,
    screenshotFile,
  }: {
    transactionId: string;
    userId: string;
    type: string;
    message: string;
    url?: string;
    browserInfo?: string;
    screenshotFile?: Express.Multer.File;
  }) {
    const reporter = await this.prisma.profile.findFirst({
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!reporter) {
      throw new NotFoundException('Profile not found');
    }

    let screenshotId: string | undefined;

    if (screenshotFile) {
      screenshotId = await this.uploadScreenshot(transactionId, screenshotFile);
    }

    const feedback = await this.feedbackService.create({
      transactionId,
      data: {
        reporter: { connect: { id: reporter.id } },
        type: type as any,
        message,
        url,
        browserInfo,
        ...(screenshotId
          ? { screenshot: { connect: { id: screenshotId } } }
          : {}),
      },
    });

    const reporterName = `${reporter.firstName} ${reporter.lastName}`;

    this.discordWebhookService
      .sendFeedback({
        reporterName,
        type,
        message,
        url,
        feedbackId: feedback.id,
      })
      .catch((err) =>
        this.logger.warn('Discord feedback webhook failed', {
          transactionId,
          error: (err as Error).message,
        }),
      );

    this.posthogService.capture(userId, 'feedback_submitted', {
      feedback_type: type,
    });

    return { id: feedback.id };
  }

  private async uploadScreenshot(
    transactionId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!ALLOWED_SCREENSHOT_TYPES.includes(file.mimetype)) {
      this.logger.warn('Invalid screenshot MIME type, skipping upload', {
        transactionId,
        mimetype: file.mimetype,
      });
      return undefined;
    }
    if (file.size > MAX_SCREENSHOT_SIZE) {
      this.logger.warn('Screenshot too large, skipping upload', {
        transactionId,
        size: file.size,
      });
      return undefined;
    }

    const bucket =
      this.configService.get('R2_BUCKET_NAME') || 'onefive-storage';
    const timestamp = Date.now();
    const ext = file.mimetype.split('/')[1] || 'png';
    const fileKey = `feedback-screenshots/screenshot-${timestamp}.${ext}`;

    const uploadResult = await this.storageService.uploadFile({
      transactionId,
      data: {
        buffer: file.buffer,
        filename: fileKey,
        mimeType: file.mimetype,
        bucketName: bucket,
      },
    });

    await this.fileService.create({
      transactionId,
      data: {
        id: uploadResult.id,
        size: file.size,
        mimeType: file.mimetype,
        bucket,
      },
    });

    this.logger.info('Feedback screenshot uploaded', {
      transactionId,
      fileId: uploadResult.id,
    });

    return uploadResult.id;
  }
}

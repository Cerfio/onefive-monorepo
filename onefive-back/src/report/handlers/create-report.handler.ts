import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ReportService } from '../report.service';
import { DiscordWebhookService } from '../../discord/discord-webhook.service';
import { ReportDuplicateException } from '../report.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateReportHandler {
  constructor(
    private readonly reportService: ReportService,
    private readonly discordWebhookService: DiscordWebhookService,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    resourceType,
    resourceId,
    reason,
    message,
  }: {
    transactionId: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    reason: string;
    message?: string;
  }) {
    const reporter = await this.prisma.profile.findFirst({
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!reporter) {
      throw new NotFoundException('Profile not found');
    }

    const existing = await this.reportService.findExisting({
      transactionId,
      reporterId: reporter.id,
      resourceType,
      resourceId,
    });

    if (existing) {
      ReportDuplicateException.throw(this.logger, { transactionId, profileId: reporter.id, resourceId });
    }

    const report = await this.reportService.create({
      transactionId,
      data: {
        reporter: { connect: { id: reporter.id } },
        resourceType: resourceType as any,
        resourceId,
        reason: reason as any,
        message,
      },
    });

    const reporterName = reporter
      ? `${reporter.firstName} ${reporter.lastName}`
      : 'Inconnu';

    this.discordWebhookService
      .sendReport({
        reporterName,
        resourceType,
        resourceId,
        reason,
        message,
        reportId: report.id,
      })
      .catch((err) =>
        this.logger.warn('Discord report webhook failed', {
          transactionId,
          error: (err as Error).message,
        }),
      );

    this.posthogService.capture(userId, 'content_reported', { resource_type: resourceType, reason });

    return { id: report.id };
  }
}

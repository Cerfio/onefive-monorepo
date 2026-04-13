import * as crypto from 'crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewsletterFrequency } from './dto/update-newsletter-preferences.dto';

@Injectable()
export class NewsletterSubscriberService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string): Promise<{
    id: string;
    email: string;
    frequency: NewsletterFrequency;
    isNew: boolean;
  }> {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isSubscribed) {
        throw new ConflictException(
          'This email address is already subscribed.',
        );
      }
      // Re-subscribe: generate a fresh token and clear unsubscribedAt.
      const preferenceToken = this.generateToken();
      const updated = await this.prisma.newsletterSubscriber.update({
        where: { email },
        data: { isSubscribed: true, unsubscribedAt: null, preferenceToken },
      });
      return { id: updated.id, email: updated.email, frequency: updated.frequency, isNew: false };
    }

    const preferenceToken = this.generateToken();
    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: { email, preferenceToken },
    });
    return { id: subscriber.id, email: subscriber.email, frequency: subscriber.frequency, isNew: true };
  }

  async getByToken(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { preferenceToken: token },
      select: {
        id: true,
        email: true,
        frequency: true,
        isSubscribed: true,
        createdAt: true,
      },
    });
    if (!subscriber) {
      throw new NotFoundException('Invalid or expired preferences token.');
    }
    return subscriber;
  }

  async updatePreferences(
    token: string,
    frequency: NewsletterFrequency,
  ) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { preferenceToken: token },
      select: { id: true, isSubscribed: true },
    });
    if (!subscriber) {
      throw new NotFoundException('Invalid or expired preferences token.');
    }
    if (!subscriber.isSubscribed) {
      throw new UnprocessableEntityException(
        'Cannot update preferences for an unsubscribed address.',
      );
    }
    const updated = await this.prisma.newsletterSubscriber.update({
      where: { preferenceToken: token },
      data: { frequency },
      select: { id: true, email: true, frequency: true },
    });
    return updated;
  }

  async unsubscribe(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { preferenceToken: token },
      select: { id: true, isSubscribed: true },
    });
    if (!subscriber) {
      throw new NotFoundException('Invalid or expired unsubscribe token.');
    }
    if (!subscriber.isSubscribed) {
      return { alreadyUnsubscribed: true };
    }
    await this.prisma.newsletterSubscriber.update({
      where: { preferenceToken: token },
      data: { isSubscribed: false, unsubscribedAt: new Date() },
    });
    return { alreadyUnsubscribed: false };
  }

  async countActive(): Promise<number> {
    return this.prisma.newsletterSubscriber.count({
      where: { isSubscribed: true },
    });
  }

  async listAll(skip = 0, take = 50) {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        email: true,
        frequency: true,
        isSubscribed: true,
        createdAt: true,
        unsubscribedAt: true,
      },
    });
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

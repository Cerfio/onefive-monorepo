import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PostHog } from 'posthog-node';

@Injectable()
export class PostHogService implements OnModuleDestroy {
  private client: PostHog | null = null;

  constructor() {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (apiKey) {
      this.client = new PostHog(apiKey, {
        host: 'https://eu.i.posthog.com',
        flushAt: 20,
        flushInterval: 10000,
      });
    }
  }

  capture(
    userId: string,
    event: string,
    properties?: Record<string, unknown>,
  ): void {
    this.client?.capture({
      distinctId: userId,
      event,
      properties,
    });
  }

  identify(
    userId: string,
    properties?: Record<string, unknown>,
  ): void {
    this.client?.identify({
      distinctId: userId,
      properties,
    });
  }

  groupIdentify(
    groupType: string,
    groupKey: string,
    properties?: Record<string, unknown>,
  ): void {
    this.client?.groupIdentify({
      groupType,
      groupKey,
      properties,
    });
  }

  captureWithGroup(
    userId: string,
    event: string,
    properties?: Record<string, unknown>,
    groups?: Record<string, string>,
  ): void {
    this.client?.capture({
      distinctId: userId,
      event,
      properties,
      groups,
    });
  }

  async onModuleDestroy() {
    await this.client?.shutdown();
  }
}

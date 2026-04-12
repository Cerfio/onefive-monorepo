import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DiscordChannel,
  DISCORD_CHANNEL_ENV_MAP,
  EMBED_COLORS,
} from './discord.constants';

interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
  url?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

@Injectable()
export class DiscordWebhookService {
  private readonly logger = new Logger(DiscordWebhookService.name);

  private getWebhookUrl(channel: DiscordChannel): string | null {
    const envKey = DISCORD_CHANNEL_ENV_MAP[channel];
    const url = process.env[envKey];
    return url?.trim() || null;
  }

  async send(
    channel: DiscordChannel,
    payload: DiscordWebhookPayload,
  ): Promise<void> {
    const url = this.getWebhookUrl(channel);
    if (!url) return;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'OneFive Bot',
          ...payload,
        }),
      });

      if (!response.ok) {
        this.logger.warn(
          `Discord webhook failed: ${response.status} ${response.statusText}`,
          {
            channel,
          },
        );
      }
    } catch (error) {
      this.logger.warn(`Discord webhook error: ${(error as Error).message}`, {
        channel,
      });
    }
  }

  async sendError500({
    url,
    method,
    errorMessage,
    stack,
  }: {
    url: string;
    method: string;
    errorMessage: string;
    stack?: string;
  }): Promise<void> {
    const truncatedStack = stack ? stack.substring(0, 1000) : 'N/A';

    await this.send(DiscordChannel.OPS_ALERTS, {
      embeds: [
        {
          title: '🚨 Erreur 500',
          color: EMBED_COLORS.ERROR,
          fields: [
            { name: 'URL', value: `\`${method} ${url}\``, inline: false },
            {
              name: 'Message',
              value: errorMessage.substring(0, 1024),
              inline: false,
            },
            {
              name: 'Stack',
              value: `\`\`\`\n${truncatedStack}\n\`\`\``,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'OneFive Monitoring' },
        },
      ],
    });
  }

  async sendNewUser({
    firstName,
    lastName,
    ecosystemRoles,
    profileId,
  }: {
    firstName: string;
    lastName: string;
    ecosystemRoles: string[];
    profileId: string;
  }): Promise<void> {
    const frontendUrl = (process.env.FRONTEND_URL || 'https://onefive.app')
      .split(',')[0]
      .trim();

    await this.send(DiscordChannel.OPS_INSCRIPTIONS, {
      embeds: [
        {
          title: '🎉 Nouvelle inscription',
          color: EMBED_COLORS.SUCCESS,
          fields: [
            { name: 'Nom', value: `${firstName} ${lastName}`, inline: true },
            {
              name: 'Profil',
              value:
                ecosystemRoles.length > 0
                  ? ecosystemRoles.join(', ')
                  : 'Non défini',
              inline: true,
            },
            {
              name: 'Lien Admin',
              value: `${frontendUrl}/admin/users`,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'OneFive Acquisition' },
        },
      ],
    });
  }

  async sendReport({
    reporterName,
    resourceType,
    resourceId,
    reason,
    message,
    reportId,
  }: {
    reporterName: string;
    resourceType: string;
    resourceId: string;
    reason: string;
    message?: string;
    reportId: string;
  }): Promise<void> {
    await this.send(DiscordChannel.OPS_ALERTS, {
      embeds: [
        {
          title: '🚩 Nouveau signalement',
          color: EMBED_COLORS.REPORT,
          fields: [
            { name: 'Signalé par', value: reporterName, inline: true },
            { name: 'Type', value: resourceType, inline: true },
            { name: 'Raison', value: reason, inline: true },
            ...(message
              ? [
                  {
                    name: 'Message',
                    value: message.substring(0, 1024),
                    inline: false,
                  },
                ]
              : []),
            { name: 'Resource ID', value: `\`${resourceId}\``, inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: `Report ${reportId}` },
        },
      ],
    });
  }

  async sendFeedback({
    reporterName,
    type,
    message,
    url,
    feedbackId,
  }: {
    reporterName: string;
    type: string;
    message: string;
    url?: string;
    feedbackId: string;
  }): Promise<void> {
    const colorMap: Record<string, number> = {
      BUG: EMBED_COLORS.FEEDBACK_BUG,
      SUGGESTION: EMBED_COLORS.FEEDBACK_SUGGESTION,
      COMMENT: EMBED_COLORS.FEEDBACK_COMMENT,
      FUNCTIONAL: EMBED_COLORS.FEEDBACK_FUNCTIONAL,
    };

    const emojiMap: Record<string, string> = {
      BUG: '🐛',
      SUGGESTION: '💡',
      COMMENT: '💬',
      FUNCTIONAL: '⚙️',
    };

    await this.send(DiscordChannel.OPS_FEEDBACK, {
      embeds: [
        {
          title: `${emojiMap[type] || '📝'} Nouveau feedback — ${type}`,
          color: colorMap[type] || EMBED_COLORS.INFO,
          fields: [
            { name: 'De', value: reporterName, inline: true },
            { name: 'Type', value: type, inline: true },
            {
              name: 'Message',
              value: message.substring(0, 1024),
              inline: false,
            },
            ...(url ? [{ name: 'URL', value: url, inline: false }] : []),
          ],
          timestamp: new Date().toISOString(),
          footer: { text: `Feedback ${feedbackId}` },
        },
      ],
    });
  }
}

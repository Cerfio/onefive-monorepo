import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { CreateRepostDto } from '../dto/create-repost.dto';
import { LogService } from 'logstash-winston-3';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateRepostHandler {
  constructor(
    private readonly postService: PostService,
    private readonly prisma: PrismaService,
    private readonly notificationHelper: NotificationHelperService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  /**
   * Remonte récursivement jusqu'au post original si le repost n'a pas de contenu
   * @param postId L'ID du post à vérifier
   * @returns L'ID du post à reposter (original si repost sans contenu, actuel sinon)
   */
  private async resolveRepostTarget(postId: string): Promise<string> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        content: true,
        repostedPostId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Si ce n'est pas un repost, on repost ce post directement
    if (!post.repostedPostId) {
      return post.id;
    }

    // Si c'est un repost avec contenu, on repost ce post directement
    const hasContent = post.content && post.content.trim().length > 0;
    if (hasContent) {
      return post.id;
    }

    // Si c'est un repost sans contenu, on remonte au post original
    return this.resolveRepostTarget(post.repostedPostId);
  }

  @Log()
  async execute({
    transactionId,
    userId,
    postId,
    createRepostDto,
  }: {
    transactionId: string;
    userId: string;
    postId: string;
    createRepostDto: CreateRepostDto;
  }) {
    // Résoudre le post cible (remonter jusqu'au post original si nécessaire)
    const targetPostId = await this.resolveRepostTarget(postId);

    // Vérifier que le post cible existe
    const targetPost = await this.prisma.post.findUnique({
      where: { id: targetPostId },
      select: { id: true },
    });

    if (!targetPost) {
      throw new NotFoundException('Target post not found');
    }

    // Récupérer le profil de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Créer le repost en pointant vers le post cible résolu
    const repost = await this.postService.create({
      transactionId,
      data: {
        author: {
          connect: {
            id: profile.id,
          },
        },
        content: createRepostDto.content || '',
        medias: [],
        tags: [],
        repostedPost: {
          connect: {
            id: targetPostId,
          },
        },
      },
    });

    // Envoyer la notification
    const hasContent = !!(
      createRepostDto.content && createRepostDto.content.trim().length > 0
    );

    this.notificationHelper
      .notifyPostRepost({
        originalPostId: targetPostId,
        repostId: repost.id,
        actorProfileId: profile.id,
        actorName: `${profile.firstName} ${profile.lastName}`.trim(),
        hasContent,
      })
      .catch((error) => {
        this.logger.error('Failed to send repost notification', {
          transactionId,
          error,
        });
      });

    this.posthogService.capture(userId, 'post_reposted', { original_post_id: targetPostId });

    // Retourner les données minimales
    const createdAt =
      repost.createdAt instanceof Date
        ? repost.createdAt.toISOString()
        : new Date().toISOString();
    const updatedAt =
      repost.updatedAt instanceof Date
        ? repost.updatedAt.toISOString()
        : new Date().toISOString();

    return {
      id: repost.id,
      createdAt,
      updatedAt,
    };
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/profile/profile.service';
import { ReactionType } from '@prisma/client';

@Injectable()
export class UpdatePostCommentReactionHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    commentId,
    userId,
    reaction,
  }: {
    transactionId: string;
    commentId: string;
    userId: string;
    reaction: ReactionType;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const existing = await this.prisma.postCommentReaction.findUnique({
      where: { commentId_profileId: { commentId, profileId: profile.id } },
      select: { profileId: true },
    });

    if (!existing) throw new NotFoundException('Comment reaction not found');
    if (existing.profileId !== profile.id)
      throw new ForbiddenException('You can only update your own reactions');

    return await this.prisma.postCommentReaction.update({
      where: { commentId_profileId: { commentId, profileId: profile.id } },
      data: { reaction },
    });
  }
}

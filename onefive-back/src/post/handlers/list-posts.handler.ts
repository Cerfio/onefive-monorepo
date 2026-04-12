import { Injectable } from '@nestjs/common';
import { PostService } from '../post.service';
import { Log } from '../../common/logger/logger.decorator';
import { ListPostsDto } from '../dto/list-posts.dto';
import { Prisma } from '@prisma/client';

type PostWithReactions = Prisma.PostGetPayload<{
  include: {
    reactions: {
      select: {
        id: true;
        profileId: true;
        reaction: true;
        createdAt: true;
      };
    };
    _count: {
      select: {
        comments: { where: { parentId: null } };
        reactions: true;
        views: true;
      };
    };
  };
}>;

type PostReaction = Prisma.PostReactionGetPayload<{
  select: {
    id: true;
    profileId: true;
    reaction: true;
    createdAt: true;
  };
}>;

@Injectable()
export class ListPostsHandler {
  constructor(private readonly postService: PostService) {}

  @Log()
  async execute({
    transactionId,
    listPostsDto,
    profileId,
  }: {
    transactionId: string;
    listPostsDto: ListPostsDto;
    profileId?: string;
  }) {
    const posts = await this.postService.list({
      transactionId,
      skip: listPostsDto.skip,
      take: listPostsDto.take,
      orderBy: { [listPostsDto.orderBy]: listPostsDto.order },
      select: {
        id: true,
        profileId: true,
        content: true,
        medias: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        reactions: {
          select: {
            id: true,
            profileId: true,
            reaction: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            comments: { where: { parentId: null } },
            reactions: true,
            views: true,
          },
        },
      },
    });

    return posts.map((post: PostWithReactions) => {
      const userReaction = post.reactions?.find(
        (reaction: PostReaction) => reaction.profileId === profileId,
      );

      return {
        id: post.id,
        profileId: post.profileId,
        content: post.content,
        medias: post.medias,
        tags: post.tags,
        createdAt: post.createdAt.toISOString(),
        commentsCount: post._count?.comments || 0,
        reactionsCount: post._count?.reactions || 0,
        viewsCount: post._count?.views || 0,
        reactions:
          post.reactions?.map((reaction: PostReaction) => ({
            profileId: reaction.profileId,
            reaction: reaction.reaction,
            createdAt: reaction.createdAt.toISOString(),
          })) || [],
        userReaction: userReaction
          ? {
              id: userReaction.id,
              profileId: userReaction.profileId,
              reaction: userReaction.reaction,
            }
          : null,
      };
    });
  }
}

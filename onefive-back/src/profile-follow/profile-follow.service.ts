import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileFollowService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followedById: string, followingId: string) {
    return this.prisma.profileFollow.create({
      data: { followedById, followingId },
    });
  }

  async unfollow(followedById: string, followingId: string) {
    return this.prisma.profileFollow.delete({
      where: {
        followingId_followedById: { followingId, followedById },
      },
    });
  }

  async isFollowing(followedById: string, followingId: string) {
    const follow = await this.prisma.profileFollow.findUnique({
      where: {
        followingId_followedById: { followingId, followedById },
      },
    });
    return !!follow;
  }

  async getFollowers(profileId: string) {
    return this.prisma.profileFollow.findMany({
      where: { followingId: profileId },
      include: { followedBy: true },
    });
  }

  async getFollowing(profileId: string) {
    return this.prisma.profileFollow.findMany({
      where: { followedById: profileId },
      include: { following: true },
    });
  }

  /**
   * Batch check: retourne un Set des profileIds que followerId suit.
   * 1 requête au lieu de N.
   */
  async areFollowingBatch(
    followerId: string,
    targetIds: string[],
  ): Promise<Set<string>> {
    if (targetIds.length === 0) return new Set();
    const follows = await this.prisma.profileFollow.findMany({
      where: {
        followedById: followerId,
        followingId: { in: targetIds },
      },
      select: { followingId: true },
    });
    return new Set(follows.map((f) => f.followingId));
  }
}

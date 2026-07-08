import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpotlightFavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(profileId: string): Promise<string[]> {
    const favs = await this.prisma.spotlightFavorite.findMany({
      where: { profileId },
      select: { spotId: true },
    });
    return favs.map((f) => f.spotId);
  }

  async toggle(profileId: string, spotId: string): Promise<{ favorited: boolean }> {
    const existing = await this.prisma.spotlightFavorite.findUnique({
      where: { profileId_spotId: { profileId, spotId } },
    });
    if (existing) {
      await this.prisma.spotlightFavorite.delete({
        where: { profileId_spotId: { profileId, spotId } },
      });
      return { favorited: false };
    }
    await this.prisma.spotlightFavorite.create({ data: { profileId, spotId } });
    return { favorited: true };
  }

  /**
   * Preuve sociale réseau : pour chaque spotId, nombre de connexions ACCEPTED
   * du viewer qui l'ont mis en favori.
   */
  async socialProof(
    profileId: string,
    spotIds: string[],
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const id of spotIds) result[id] = 0;
    if (spotIds.length === 0) return result;

    const rels = await this.prisma.relationship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: profileId }, { accepterId: profileId }],
      },
      select: { requesterId: true, accepterId: true },
    });
    const connectionIds = rels.map((r) =>
      r.requesterId === profileId ? r.accepterId : r.requesterId,
    );
    if (connectionIds.length === 0) return result;

    const favs = await this.prisma.spotlightFavorite.findMany({
      where: { profileId: { in: connectionIds }, spotId: { in: spotIds } },
      select: { spotId: true },
    });
    for (const f of favs) result[f.spotId] = (result[f.spotId] || 0) + 1;
    return result;
  }
}

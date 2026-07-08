import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelationshipStatus } from '@prisma/client';

@Injectable()
export class ProfileConnectionService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(requesterId: string, accepterId: string) {
    return this.prisma.relationship.create({
      data: {
        requesterId,
        accepterId,
        status: RelationshipStatus.PENDING,
      },
    });
  }

  async acceptRequest(requesterId: string, accepterId: string) {
    return this.prisma.relationship.update({
      where: {
        requesterId_accepterId: { requesterId, accepterId },
      },
      data: { status: RelationshipStatus.ACCEPTED },
    });
  }

  async rejectRequest(requesterId: string, accepterId: string) {
    return this.prisma.relationship.update({
      where: {
        requesterId_accepterId: { requesterId, accepterId },
      },
      data: { status: RelationshipStatus.DECLINED },
    });
  }

  async deleteConnection(requesterId: string, accepterId: string) {
    return this.prisma.relationship.deleteMany({
      where: {
        OR: [
          { requesterId, accepterId },
          { requesterId: accepterId, accepterId: requesterId },
        ],
      },
    });
  }

  async getConnections(profileId: string) {
    return this.prisma.relationship.findMany({
      where: {
        status: RelationshipStatus.ACCEPTED,
        OR: [{ requesterId: profileId }, { accepterId: profileId }],
      },
      include: { requester: true, accepter: true },
    });
  }

  /**
   * Connexions communes entre le viewer et un autre profil : intersection des
   * relations ACCEPTED des deux. Renvoie les profils partagés (id, nom, avatar).
   */
  async getMutualConnections(viewerProfileId: string, otherProfileId: string) {
    if (viewerProfileId === otherProfileId) return [];

    const [viewerConns, otherConns] = await Promise.all([
      this.getConnections(viewerProfileId),
      this.getConnections(otherProfileId),
    ]);

    const otherSideOf = (self: string) => (rel: (typeof viewerConns)[number]) =>
      rel.requesterId === self ? rel.accepterId : rel.requesterId;

    const viewerConnIds = new Set(viewerConns.map(otherSideOf(viewerProfileId)));
    const mutualIds = [
      ...new Set(
        otherConns
          .map(otherSideOf(otherProfileId))
          .filter((id) => viewerConnIds.has(id)),
      ),
    ];

    if (mutualIds.length === 0) return [];

    const profiles = await this.prisma.profile.findMany({
      where: { id: { in: mutualIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: { select: { id: true } },
      },
    });

    return profiles.map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`.trim(),
      avatar: p.avatar?.id ?? null,
    }));
  }

  async getPendingRequests(profileId: string) {
    return this.prisma.relationship.findMany({
      where: { accepterId: profileId, status: RelationshipStatus.PENDING },
      include: { requester: true },
    });
  }

  async getConnectionStatus(profileId1: string, profileId2: string) {
    return this.prisma.relationship.findFirst({
      where: {
        OR: [
          { requesterId: profileId1, accepterId: profileId2 },
          { requesterId: profileId2, accepterId: profileId1 },
        ],
      },
    });
  }
}

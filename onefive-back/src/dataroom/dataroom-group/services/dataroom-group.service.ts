import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DataroomGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    transactionId,
    dataroomId,
    userId,
    name,
    hasAllAccess,
    canUpload,
    canShare,
    canManageUsers,
    canManageGroups,
  }: {
    transactionId: string;
    dataroomId: string;
    userId: string;
    name: string;
    hasAllAccess: boolean;
    canUpload: boolean;
    canShare: boolean;
    canManageUsers: boolean;
    canManageGroups: boolean;
  }) {
    const group = await this.prisma.dataroomGroup.create({
      data: {
        name,
        type: 'CUSTOM',
        dataroom: {
          connect: {
            id: dataroomId,
          },
        },
        hasAllAccess,
        canUpload,
        canShare,
        canManageUsers,
        canManageGroups,
        createdBy: userId,
      },
    });

    return group;
  }

  async get({
    transactionId,
    groupId,
    userId,
  }: {
    transactionId: string;
    groupId: string;
    userId: string;
  }) {
    const group = await this.prisma.dataroomGroup.findFirst({
      where: {
        id: groupId,
      },
      include: {
        dataroom: true,
        members: true,
        invitations: {
          include: {
            existingUserInvitation: true,
            newUserInvitation: true,
          },
        },
        permissionsCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!group) {
      return null;
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    const typeMap: Record<string, number> = {
      DEFAULT: 0,
      CUSTOM: 2,
    };

    return {
      id: group.id,
      name: group.name,
      type: typeMap[group.type] ?? 2,
      isEditable: group.type !== 'DEFAULT',
      hasAllAccess: group.hasAllAccess,
      canUpload: group.canUpload,
      canShare: group.canShare,
      canManageUsers: group.canManageUsers,
      canManageGroups: group.canManageGroups,
      permissions: group.permissionsCategory.map((p) => ({
        categoryId: p.categoryId || '',
        canView: p.canView,
        canDownload: p.canDownload,
        canComment: p.canComment,
      })),
      members: group.members.map((m) => ({
        id: m.id,
        profileId: m.profileId,
        createdAt: m.createdAt.toISOString(),
      })),
      invitations: group.invitations.map((i) => ({
        id: i.id,
        email: i.newUserInvitation?.email || '',
        name: `${i.newUserInvitation?.firstname || ''} ${i.newUserInvitation?.lastname || ''}`.trim(),
        status: i.status,
        invitedAt: i.createdAt.toISOString(),
      })),
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    };
  }

  async update({
    transactionId,
    dataroomId,
    groupId,
    userId,
    name,
  }: {
    transactionId: string;
    dataroomId: string;
    groupId: string;
    userId: string;
    name: string;
  }) {
    const group = await this.prisma.dataroomGroup.update({
      where: {
        id: groupId,
      },
      data: {
        name,
      },
    });

    return group;
  }

  async delete({
    transactionId,
    dataroomId,
    groupId,
    userId,
  }: {
    transactionId: string;
    dataroomId: string;
    groupId: string;
    userId: string;
  }) {
    await this.prisma.dataroomGroup.delete({
      where: {
        id: groupId,
      },
    });

    return { success: true };
  }
}

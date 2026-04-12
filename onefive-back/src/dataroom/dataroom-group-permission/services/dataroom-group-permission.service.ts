import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DataroomGroupPermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async update({
    transactionId,
    groupId,
    userId,
    permissions,
    dataroomId,
  }: {
    transactionId: string;
    groupId: string;
    userId: string;
    permissions: Array<{
      categoryId: string;
      canView: boolean;
      canDownload: boolean;
      canComment: boolean;
    }>;
    dataroomId: string;
  }) {
    // Supprimer les permissions existantes pour ce groupe
    await this.prisma.permissionCategory.deleteMany({
      where: {
        groupId,
      },
    });

    // Créer les nouvelles permissions
    const newPermissions = await this.prisma.permissionCategory.createMany({
      data: permissions.map((permission) => ({
        groupId,
        categoryId: permission.categoryId,
        canView: permission.canView,
        canDownload: permission.canDownload,
        canComment: permission.canComment,
        givenBy: userId,
      })),
    });

    return newPermissions;
  }
}

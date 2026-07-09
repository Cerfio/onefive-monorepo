import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(profileId: string) {
    return this.prisma.savedSearch.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true, filters: true, createdAt: true },
    });
  }

  async create(profileId: string, label: string, filters: Prisma.InputJsonValue) {
    // Dédup par label + plafond à 20 pour éviter l'accumulation.
    const existing = await this.prisma.savedSearch.findFirst({
      where: { profileId, label },
      select: { id: true },
    });
    if (existing) {
      return this.prisma.savedSearch.update({
        where: { id: existing.id },
        data: { filters },
        select: { id: true, label: true, filters: true, createdAt: true },
      });
    }
    const created = await this.prisma.savedSearch.create({
      data: { profileId, label, filters },
      select: { id: true, label: true, filters: true, createdAt: true },
    });
    const all = await this.prisma.savedSearch.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (all.length > 20) {
      await this.prisma.savedSearch.deleteMany({
        where: { id: { in: all.slice(20).map((s) => s.id) } },
      });
    }
    return created;
  }

  async remove(profileId: string, id: string): Promise<{ deleted: boolean }> {
    await this.prisma.savedSearch.deleteMany({ where: { id, profileId } });
    return { deleted: true };
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostDraftService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(profileId: string) {
    return this.prisma.postDraft.findMany({
      where: { profileId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, content: true, tags: true, updatedAt: true },
    });
  }

  async create(profileId: string, content: string, tags: string[]) {
    // Plafond à 30 brouillons par profil.
    const count = await this.prisma.postDraft.count({ where: { profileId } });
    if (count >= 30) {
      const oldest = await this.prisma.postDraft.findFirst({
        where: { profileId },
        orderBy: { updatedAt: 'asc' },
        select: { id: true },
      });
      if (oldest)
        await this.prisma.postDraft.delete({ where: { id: oldest.id } });
    }
    return this.prisma.postDraft.create({
      data: { profileId, content: content.slice(0, 3000), tags },
      select: { id: true, content: true, tags: true, updatedAt: true },
    });
  }

  async update(
    profileId: string,
    id: string,
    content: string,
    tags: string[],
  ) {
    const draft = await this.prisma.postDraft.findUnique({
      where: { id },
      select: { profileId: true },
    });
    if (!draft || draft.profileId !== profileId) {
      throw new ForbiddenException('Not your draft');
    }
    return this.prisma.postDraft.update({
      where: { id },
      data: { content: content.slice(0, 3000), tags },
      select: { id: true, content: true, tags: true, updatedAt: true },
    });
  }

  async remove(profileId: string, id: string): Promise<{ deleted: boolean }> {
    await this.prisma.postDraft.deleteMany({ where: { id, profileId } });
    return { deleted: true };
  }
}

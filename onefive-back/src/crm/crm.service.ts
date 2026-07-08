import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const CRM_STAGES = [
  'NEW',
  'CONTACTED',
  'MEETING',
  'NEGOTIATION',
  'CLOSED',
] as const;

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  async getForContact(ownerProfileId: string, contactProfileId: string) {
    const [crm, notes, reminders] = await Promise.all([
      this.prisma.contactCrm.findUnique({
        where: { ownerProfileId_contactProfileId: { ownerProfileId, contactProfileId } },
      }),
      this.prisma.contactNote.findMany({
        where: { ownerProfileId, contactProfileId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactReminder.findMany({
        where: { ownerProfileId, contactProfileId },
        orderBy: { dueAt: 'asc' },
      }),
    ]);
    return { stage: crm?.stage ?? 'NEW', notes, reminders };
  }

  async setStage(ownerProfileId: string, contactProfileId: string, stage: string) {
    const safeStage = (CRM_STAGES as readonly string[]).includes(stage) ? stage : 'NEW';
    return this.prisma.contactCrm.upsert({
      where: { ownerProfileId_contactProfileId: { ownerProfileId, contactProfileId } },
      update: { stage: safeStage },
      create: { ownerProfileId, contactProfileId, stage: safeStage },
    });
  }

  /** Garantit une entrée pipeline (stade NEW) pour que le contact y apparaisse. */
  private async ensureCrmEntry(ownerProfileId: string, contactProfileId: string) {
    await this.prisma.contactCrm.upsert({
      where: { ownerProfileId_contactProfileId: { ownerProfileId, contactProfileId } },
      update: {},
      create: { ownerProfileId, contactProfileId, stage: 'NEW' },
    });
  }

  async addNote(ownerProfileId: string, contactProfileId: string, content: string) {
    await this.ensureCrmEntry(ownerProfileId, contactProfileId);
    return this.prisma.contactNote.create({
      data: { ownerProfileId, contactProfileId, content: content.trim().slice(0, 2000) },
    });
  }

  async addReminder(
    ownerProfileId: string,
    contactProfileId: string,
    reason: string,
    dueAt: string,
  ) {
    await this.ensureCrmEntry(ownerProfileId, contactProfileId);
    return this.prisma.contactReminder.create({
      data: {
        ownerProfileId,
        contactProfileId,
        reason: reason.trim().slice(0, 300),
        dueAt: new Date(dueAt),
      },
    });
  }

  async completeReminder(ownerProfileId: string, reminderId: string) {
    await this.prisma.contactReminder.updateMany({
      where: { id: reminderId, ownerProfileId },
      data: { done: true },
    });
    return { success: true };
  }

  /** Pipeline complet de l'owner : contacts groupés par stade, profils résolus. */
  async getPipeline(ownerProfileId: string) {
    const entries = await this.prisma.contactCrm.findMany({
      where: { ownerProfileId },
      orderBy: { updatedAt: 'desc' },
    });
    const contactIds = entries.map((e) => e.contactProfileId);
    const profiles = contactIds.length
      ? await this.prisma.profile.findMany({
          where: { id: { in: contactIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            highlight: true,
            avatar: { select: { id: true } },
          },
        })
      : [];
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    return entries.map((e) => {
      const p = profileMap.get(e.contactProfileId);
      return {
        contactProfileId: e.contactProfileId,
        stage: e.stage,
        name: p ? `${p.firstName} ${p.lastName}`.trim() : 'Membre',
        highlight: p?.highlight ?? null,
        avatar: p?.avatar?.id ?? null,
      };
    });
  }
}

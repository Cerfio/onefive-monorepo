import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateSecret,
  otpauthUrl,
  verifyToken,
  generateBackupCodes,
} from './totp.util';

@Injectable()
export class TwoFactorService {
  constructor(private readonly prisma: PrismaService) {}

  private async getSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async status(userId: string) {
    const s = await this.getSettings(userId);
    return { enabled: s.twoFactorEnabled };
  }

  /**
   * Démarre l'enrôlement : génère un secret (stocké mais PAS encore activé) et
   * renvoie l'URL otpauth à scanner. L'activation se fait via enable().
   */
  async setup(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    const accountLabel = user?.email || userId;
    const secret = generateSecret();
    await this.prisma.userSettings.upsert({
      where: { userId },
      update: { twoFactorSecret: secret, twoFactorEnabled: false },
      create: { userId, twoFactorSecret: secret },
    });
    return { secret, otpauthUrl: otpauthUrl(secret, accountLabel) };
  }

  /** Active la 2FA après vérification d'un premier code. Renvoie les backup codes. */
  async enable(userId: string, code: string) {
    const s = await this.getSettings(userId);
    if (!s.twoFactorSecret) {
      throw new BadRequestException('Aucun enrôlement en cours');
    }
    if (!verifyToken(s.twoFactorSecret, code)) {
      throw new BadRequestException('Code invalide');
    }
    const backupCodes = generateBackupCodes();
    await this.prisma.userSettings.update({
      where: { userId },
      data: { twoFactorEnabled: true, twoFactorBackupCodes: backupCodes },
    });
    return { backupCodes };
  }

  async disable(userId: string) {
    await this.prisma.userSettings.update({
      where: { userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });
    return { success: true };
  }

  /**
   * Vérifie un code (TOTP ou backup) au login. Consomme le backup code utilisé.
   * Utilisé par le signin handler UNIQUEMENT si la 2FA est activée.
   */
  async verifyLoginCode(userId: string, code: string): Promise<boolean> {
    const s = await this.getSettings(userId);
    if (!s.twoFactorEnabled || !s.twoFactorSecret) return true; // pas de 2FA → OK
    if (!code) return false;

    if (verifyToken(s.twoFactorSecret, code)) return true;

    // Sinon, tenter un backup code (consommé si valide).
    const normalized = code.replace(/\s/g, '').toUpperCase();
    if (s.twoFactorBackupCodes.includes(normalized)) {
      await this.prisma.userSettings.update({
        where: { userId },
        data: {
          twoFactorBackupCodes: s.twoFactorBackupCodes.filter(
            (c) => c !== normalized,
          ),
        },
      });
      return true;
    }
    return false;
  }

  async isEnabled(userId: string): Promise<boolean> {
    const s = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { twoFactorEnabled: true },
    });
    return !!s?.twoFactorEnabled;
  }
}

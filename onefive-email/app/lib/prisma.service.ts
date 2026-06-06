import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: { url },
      },
    });
  }
  return globalForPrisma.prisma;
}

/** @deprecated Prefer getPrisma() so build does not require DATABASE_URL at import time. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrisma(), prop);
  },
});

export default prisma;

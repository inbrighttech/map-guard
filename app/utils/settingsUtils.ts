// Utility functions for loading and saving app settings via Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Loads settings for a given shop.
 */
export async function loadSettings(shop: string) {
  const record = await prisma.appSettings.findUnique({ where: { shop } });
  return record ? JSON.parse(record.settingsJson) : {};
}

/**
 * Saves settings for a given shop.
 */
export async function saveSettings(shop: string, settings: any) {
  const settingsJson = JSON.stringify(settings);
  return prisma.appSettings.upsert({
    where: { shop },
    update: { settingsJson },
    create: { shop, settingsJson },
  });
}

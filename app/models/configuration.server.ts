import prisma from "../db.server";
import { getTemplateById } from "../constants/templates";
import { validateSettingsForPlan, canCreateConfiguration } from "../utils/plan-enforcer.server";
import type { PlanTier, SearchBarSettings } from "../types/search-bar";

export async function listConfigurations(shopId: string) {
  return prisma.searchConfiguration.findMany({
    where: { shopId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConfigurationById(id: string, shopId: string) {
  return prisma.searchConfiguration.findFirst({
    where: { id, shopId },
  });
}

export async function saveConfiguration({
  id,
  shopId,
  name,
  templateId,
  settings,
  isPublished,
  tier,
}: {
  id?: string;
  shopId: string;
  name: string;
  templateId: string;
  settings: Partial<SearchBarSettings>;
  isPublished?: boolean;
  tier: PlanTier;
}) {
  // Validate against plan
  const validation = validateSettingsForPlan(tier, templateId, settings);
  if (!validation.valid || !validation.sanitizedSettings) {
    throw new Error(validation.error || "Invalid configuration for current plan tier.");
  }

  // If new configuration, check allowance
  if (!id) {
    const check = await canCreateConfiguration(shopId, tier);
    if (!check.allowed) {
      throw new Error(
        `Configuration limit reached (${check.currentCount}/${check.maxAllowed}). Upgrade your plan to create more search bars.`
      );
    }
  }

  const jsonConfig = JSON.stringify(validation.sanitizedSettings);

  if (isPublished) {
    // Unpublish other configurations for this shop first
    await prisma.searchConfiguration.updateMany({
      where: { shopId },
      data: { isPublished: false },
    });
  }

  if (id) {
    // Update existing
    return prisma.searchConfiguration.update({
      where: { id },
      data: {
        name,
        templateId,
        configuration: jsonConfig,
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });
  } else {
    // Create new
    return prisma.searchConfiguration.create({
      data: {
        shopId,
        name,
        templateId,
        planAtCreation: tier,
        configuration: jsonConfig,
        isPublished: isPublished ?? false,
      },
    });
  }
}

export async function duplicateConfiguration(id: string, shopId: string, tier: PlanTier) {
  const original = await prisma.searchConfiguration.findFirst({
    where: { id, shopId },
  });
  if (!original) throw new Error("Configuration not found.");

  const check = await canCreateConfiguration(shopId, tier);
  if (!check.allowed) {
    throw new Error(
      `Cannot duplicate: configuration limit reached (${check.currentCount}/${check.maxAllowed}). Upgrade your plan.`
    );
  }

  return prisma.searchConfiguration.create({
    data: {
      shopId,
      name: `${original.name} (Copy)`,
      templateId: original.templateId,
      planAtCreation: tier,
      configuration: original.configuration,
      isPublished: false,
    },
  });
}

export async function deleteConfiguration(id: string, shopId: string) {
  const existing = await prisma.searchConfiguration.findFirst({
    where: { id, shopId },
  });
  if (!existing) throw new Error("Configuration not found.");

  await prisma.searchConfiguration.delete({ where: { id } });

  // If deleted config was published, publish the most recent remaining one if any
  if (existing.isPublished) {
    const nextConfig = await prisma.searchConfiguration.findFirst({
      where: { shopId },
      orderBy: { updatedAt: "desc" },
    });
    if (nextConfig) {
      await prisma.searchConfiguration.update({
        where: { id: nextConfig.id },
        data: { isPublished: true },
      });
    }
  }

  return true;
}

export async function setPublishedConfiguration(id: string, shopId: string, tier: PlanTier) {
  const target = await prisma.searchConfiguration.findFirst({
    where: { id, shopId },
  });
  if (!target) throw new Error("Configuration not found.");

  // Check if target template is allowed under current plan
  const template = getTemplateById(target.templateId);
  if (template) {
    const validation = validateSettingsForPlan(
      tier,
      target.templateId,
      JSON.parse(target.configuration)
    );
    if (!validation.valid) {
      throw new Error(`Cannot publish: ${validation.error}`);
    }
  }

  // Set all to unpublished
  await prisma.searchConfiguration.updateMany({
    where: { shopId },
    data: { isPublished: false },
  });

  // Publish this one
  return prisma.searchConfiguration.update({
    where: { id },
    data: { isPublished: true },
  });
}


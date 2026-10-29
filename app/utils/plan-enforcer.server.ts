import prisma from "../db.server";
import { PLANS, TEMPLATES, getTemplateById } from "../constants/templates";
import type { PlanTier, SearchBarSettings } from "../types/search-bar";

export interface PlanValidationResult {
  valid: boolean;
  error?: string;
  sanitizedSettings?: SearchBarSettings;
}

/**
 * Retrieves the verified active plan tier for a given shop domain.
 * Defaults to "FREE" if no active paid subscription exists.
 */
export async function getShopPlan(shopDomain: string): Promise<PlanTier> {
  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!shop || !shop.subscriptions || shop.subscriptions.length === 0) {
    return "FREE";
  }

  const activeSubscription = shop.subscriptions[0];
  const plan = activeSubscription.plan.toUpperCase() as PlanTier;

  if (plan === "PRO" || plan === "ADVANCED") {
    return plan;
  }

  return "FREE";
}

/**
 * Validates whether a template and configuration settings adhere to the shop's plan rules.
 */
export function validateSettingsForPlan(
  tier: PlanTier,
  templateId: string,
  settings: Partial<SearchBarSettings>
): PlanValidationResult {
  const template = getTemplateById(templateId);
  if (!template) {
    return { valid: false, error: `Invalid template ID "${templateId}".` };
  }

  const planConfig = PLANS[tier];
  if (!planConfig) {
    return { valid: false, error: `Invalid plan tier "${tier}".` };
  }

  // 1. Template allowance check
  if (!planConfig.templatesAllowed.includes(templateId)) {
    return {
      valid: false,
      error: `Template "${template.name}" requires the ${template.tier} plan. Your current plan is ${tier}.`,
    };
  }

  const baseDefaults = template.defaultSettings;
  const merged: SearchBarSettings = { ...baseDefaults, ...settings };

  // 2. Free plan restrictions
  if (tier === "FREE") {
    // Free plan cannot customize colors
    if (
      (settings.backgroundColor && settings.backgroundColor !== baseDefaults.backgroundColor) ||
      (settings.textColor && settings.textColor !== baseDefaults.textColor) ||
      (settings.borderColor && settings.borderColor !== baseDefaults.borderColor) ||
      (settings.placeholderColor && settings.placeholderColor !== baseDefaults.placeholderColor) ||
      (settings.iconColor && settings.iconColor !== baseDefaults.iconColor) ||
      (settings.buttonBgColor && settings.buttonBgColor !== baseDefaults.buttonBgColor)
    ) {
      return {
        valid: false,
        error: "Custom color controls require a Pro or Advanced plan subscription.",
      };
    }

    // Free plan cannot customize border radius or shadows
    if (
      settings.borderRadius !== undefined &&
      settings.borderRadius !== baseDefaults.borderRadius
    ) {
      return {
        valid: false,
        error: "Border radius customization requires a Pro or Advanced plan.",
      };
    }

    // Free plan cannot use images
    if (settings.imageUrl) {
      return {
        valid: false,
        error: "Image integration is an Advanced plan exclusive feature.",
      };
    }

    // Strip any unauthorized properties for safety
    merged.backgroundColor = baseDefaults.backgroundColor;
    merged.textColor = baseDefaults.textColor;
    merged.borderColor = baseDefaults.borderColor;
    merged.placeholderColor = baseDefaults.placeholderColor;
    merged.iconColor = baseDefaults.iconColor;
    merged.borderRadius = baseDefaults.borderRadius;
    delete merged.imageUrl;
    delete merged.bgOverlayColor;
  }

  // 3. Pro plan restrictions
  if (tier === "PRO") {
    // Pro plan cannot use images, banners, or separate mobile styling
    if (settings.imageUrl || settings.bgOverlayColor) {
      return {
        valid: false,
        error: "Image uploads and background banners are only available on the Advanced plan.",
      };
    }

    delete merged.imageUrl;
    delete merged.bgOverlayColor;
    delete merged.mobileHeight;
    delete merged.mobileFontSize;
  }

  return { valid: true, sanitizedSettings: merged };
}

/**
 * Checks if the shop has reached their maximum allowed configurations.
 */
export async function canCreateConfiguration(
  shopId: string,
  tier: PlanTier
): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number }> {
  const currentCount = await prisma.searchConfiguration.count({
    where: { shopId },
  });

  const maxAllowed = PLANS[tier].maxConfigurations;

  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}

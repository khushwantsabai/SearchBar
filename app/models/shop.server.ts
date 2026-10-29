import prisma from "../db.server";
import { TEMPLATES } from "../constants/templates";
import type { PlanTier } from "../types/search-bar";

export async function getOrCreateShop(shopDomain: string) {
  let shop = await prisma.shop.findUnique({
    where: { shopDomain },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      configurations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!shop) {
    // Create new shop record
    shop = await prisma.shop.create({
      data: {
        shopDomain,
        subscriptions: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            billingInterval: "EVERY_30_DAYS",
          },
        },
      },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        configurations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Create default configuration (Template 1: Classic Search)
    const classicTemplate = TEMPLATES[0];
    await prisma.searchConfiguration.create({
      data: {
        shopId: shop.id,
        name: "My Classic Search Bar",
        templateId: classicTemplate.id,
        planAtCreation: "FREE",
        configuration: JSON.stringify(classicTemplate.defaultSettings),
        isPublished: true, // Default active
      },
    });

    // Re-fetch with created configuration
    shop = await prisma.shop.findUnique({
      where: { shopDomain },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        configurations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  const activePlan: PlanTier = (shop?.subscriptions[0]?.plan.toUpperCase() as PlanTier) || "FREE";
  const publishedConfig = shop?.configurations.find((c: any) => c.isPublished) || null;

  return {
    shop,
    activePlan,
    publishedConfig,
    configurations: shop?.configurations || [],
  };
}

export async function updateShopSubscription(
  shopDomain: string,
  plan: PlanTier,
  shopifySubscriptionId?: string,
  status: string = "ACTIVE"
) {
  const shop = await prisma.shop.findUnique({ where: { shopDomain } });
  if (!shop) throw new Error(`Shop not found: ${shopDomain}`);

  // Deactivate previous subscriptions
  await prisma.subscription.updateMany({
    where: { shopId: shop.id, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });

  // Create or activate new subscription
  return prisma.subscription.create({
    data: {
      shopId: shop.id,
      plan,
      shopifySubscriptionId,
      status,
      billingInterval: "EVERY_30_DAYS",
    },
  });
}

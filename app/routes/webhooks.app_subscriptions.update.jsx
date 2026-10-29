import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const shopRecord = await db.shop.findUnique({ where: { shopDomain: shop } });
    if (!shopRecord) return new Response();

    const appSubscription = payload?.app_subscription;
    if (appSubscription) {
      const status = appSubscription.status?.toUpperCase() || "ACTIVE";
      const shopifySubId = appSubscription.admin_graphql_api_id;

      // Update subscription in database
      const existing = await db.subscription.findFirst({
        where: { shopId: shopRecord.id, shopifySubscriptionId: shopifySubId },
      });

      if (existing) {
        await db.subscription.update({
          where: { id: existing.id },
          data: { status },
        });
      }
    }
  } catch (err) {
    console.error("Error processing app_subscriptions/update webhook:", err);
  }

  return new Response();
};


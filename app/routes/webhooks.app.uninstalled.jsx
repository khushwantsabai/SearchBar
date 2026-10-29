import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Safely record shop uninstallation without destroying merchant configuration history
  try {
    const shopRecord = await db.shop.findUnique({ where: { shopDomain: shop } });
    if (shopRecord) {
      await db.shop.update({
        where: { id: shopRecord.id },
        data: { uninstalledAt: new Date() },
      });

      await db.subscription.updateMany({
        where: { shopId: shopRecord.id, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });
    }

    if (session) {
      await db.session.deleteMany({ where: { shop } });
    }
  } catch (err) {
    console.error("Error processing uninstall webhook:", err);
  }

  return new Response();
};

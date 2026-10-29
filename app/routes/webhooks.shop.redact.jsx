import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received shop redact webhook ${topic} for ${shop}`);

  try {
    const shopRecord = await db.shop.findUnique({ where: { shopDomain: shop } });
    if (shopRecord) {
      await db.searchConfiguration.deleteMany({ where: { shopId: shopRecord.id } });
      await db.subscription.deleteMany({ where: { shopId: shopRecord.id } });
      await db.uploadedAsset.deleteMany({ where: { shopId: shopRecord.id } });
      await db.shop.delete({ where: { id: shopRecord.id } });
    }
  } catch (err) {
    console.error("Error processing shop redact:", err);
  }

  return new Response(JSON.stringify({ message: "Shop redact completed." }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};


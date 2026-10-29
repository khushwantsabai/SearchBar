import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received customer redact webhook ${topic} for ${shop}`);
  return new Response(JSON.stringify({ message: "Customer data redact completed." }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};


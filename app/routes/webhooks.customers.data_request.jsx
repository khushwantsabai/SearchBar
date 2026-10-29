import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received compliance webhook ${topic} for ${shop}`);
  // SearchBar stores no customer PII
  return new Response(JSON.stringify({ message: "No customer PII stored." }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};


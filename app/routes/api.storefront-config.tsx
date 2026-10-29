import type { LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";
import { TEMPLATES } from "../constants/templates";
import { getShopPlan } from "../utils/plan-enforcer.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shopDomain = url.searchParams.get("shop");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!shopDomain) {
    return new Response(JSON.stringify({ error: "Missing 'shop' parameter" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
    include: {
      configurations: {
        where: { isPublished: true },
        take: 1,
      },
    },
  });

  const plan = await getShopPlan(shopDomain);
  const published = shop?.configurations[0];

  if (published) {
    return new Response(
      JSON.stringify({
        templateId: published.templateId,
        settings: JSON.parse(published.configuration),
        plan,
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Fallback to default classic search
  const classic = TEMPLATES[0];
  return new Response(
    JSON.stringify({
      templateId: classic.id,
      settings: classic.defaultSettings,
      plan: "FREE",
    }),
    { status: 200, headers: corsHeaders }
  );
};

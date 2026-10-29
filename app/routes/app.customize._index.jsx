import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  const activeTemplateId = shopData.publishedConfig?.templateId || "classic-search";
  return redirect(`/app/customize/${activeTemplateId}`);
};

export default function CustomizeIndex() {
  return null;
}


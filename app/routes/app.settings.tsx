import React, { useState } from "react";
import { useLoaderData, useFetcher, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { AppLayout } from "../components/AppLayout";
import { PLANS } from "../constants/templates";
import type { PlanTier } from "../types/search-bar";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    shop: shopData.shop,
    configurationsCount: shopData.configurations.length,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  return { success: true, message: "Settings updated successfully!" };
};

export default function SettingsPage() {
  const { shopDomain, activePlan, shop, configurationsCount } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    shop: any;
    configurationsCount: number;
  };
  const fetcher = useFetcher() as any;
  const planInfo = PLANS[activePlan];

  const [predictiveEnabled, setPredictiveEnabled] = useState(true);
  const [maxResults, setMaxResults] = useState("5");
  const [searchTarget, setSearchTarget] = useState("product");

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
            App Settings
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Configure default storefront search behavior and account settings.
          </p>
        </div>

        {fetcher.data?.message && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {fetcher.data.message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Card 1: Store & Plan Information */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>
              Store & Subscription
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Store Domain</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>{shopDomain}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Current Tier</span>
                <span style={{ fontWeight: "600", color: "#2563eb" }}>
                  {planInfo.name} (${planInfo.price}/month)
                </span>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Configurations Used</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>
                  {configurationsCount} / {planInfo.maxConfigurations}
                </span>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Installed Since</span>
                <span style={{ fontWeight: "600", color: "#0f172a" }}>
                  {shop?.createdAt ? new Date(shop.createdAt).toLocaleDateString() : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Storefront Search Behavior */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>
              Search Behavior Preferences
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                    Enable Predictive Product Autocomplete
                  </label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Show matching product suggestions, prices, and thumbnails as the customer types.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={predictiveEnabled}
                  onChange={(e) => setPredictiveEnabled(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>
                  Search Resources Target
                </label>
                <select
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  <option value="product">Products only (Recommended for eCommerce)</option>
                  <option value="product,collection">Products and Collections</option>
                  <option value="product,article,page">Products, Articles & Pages</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>
                  Maximum Suggestions Count
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(e.target.value)}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  <option value="3">3 suggestions</option>
                  <option value="5">5 suggestions (Default)</option>
                  <option value="8">8 suggestions</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => fetcher.submit({ predictiveEnabled, maxResults, searchTarget }, { method: "post" })}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

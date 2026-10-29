import React from "react";
import { useLoaderData, useFetcher, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop, updateShopSubscription } from "../models/shop.server";
import { PLANS } from "../constants/templates";
import { AppLayout } from "../components/AppLayout";
import type { PlanTier } from "../types/search-bar";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  const url = new URL(request.url);
  const planParam = url.searchParams.get("plan") as PlanTier | null;
  const chargeId = url.searchParams.get("charge_id");

  // If returning from Shopify billing approval with charge_id and plan
  if (planParam && (planParam === "PRO" || planParam === "ADVANCED")) {
    await updateShopSubscription(session.shop, planParam, chargeId || undefined, "ACTIVE");
    return redirect("/app/pricing?success=plan_updated");
  }

  const successMessage = url.searchParams.get("success") === "plan_updated"
    ? "Subscription successfully activated!"
    : null;

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    successMessage,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const targetPlan = formData.get("plan") as PlanTier;

  if (targetPlan === "FREE") {
    // Downgrade to Free
    await updateShopSubscription(session.shop, "FREE", undefined, "ACTIVE");
    return { success: true, message: "Downgraded to Free Plan." };
  }

  const planInfo = PLANS[targetPlan];
  if (!planInfo) {
    return { success: false, error: "Invalid plan selected." };
  }

  const returnUrl = `${process.env.SHOPIFY_APP_URL || ""}/app/pricing?plan=${targetPlan}`;

  try {
    const response = await admin.graphql(
      `#graphql
      mutation CreateAppSubscription($name: String!, $returnUrl: URL!, $price: Decimal!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          test: true
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: { amount: $price, currencyCode: USD }
                  interval: EVERY_30_DAYS
                }
              }
            }
          ]
        ) {
          userErrors {
            field
            message
          }
          confirmationUrl
          appSubscription {
            id
            status
          }
        }
      }`,
      {
        variables: {
          name: `SearchBar ${planInfo.name} Plan`,
          returnUrl,
          price: planInfo.price,
        },
      }
    );

    const json = await response.json();
    const data = json.data?.appSubscriptionCreate;

    if (data?.userErrors && data.userErrors.length > 0) {
      return { success: false, error: data.userErrors[0].message };
    }

    if (data?.confirmationUrl) {
      return redirect(data.confirmationUrl);
    }

    // Fallback if local/test simulation without app URL
    await updateShopSubscription(session.shop, targetPlan, "mock_sub_id", "ACTIVE");
    return { success: true, message: `Updated to ${targetPlan} plan.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to initiate billing." };
  }
};

export default function PricingPage() {
  const { shopDomain, activePlan, successMessage } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    successMessage: string | null;
  };
  const fetcher = useFetcher() as any;

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
            👑 Simple, Flexible Pricing
          </h1>
          <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
            Get the perfect plan for your store. Upgrade anytime.
          </p>
        </div>

        {/* Feedback message */}
        {(successMessage || fetcher.data?.message) && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "14px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            {successMessage || fetcher.data?.message}
          </div>
        )}

        {fetcher.data?.error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "14px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            {fetcher.data.error}
          </div>
        )}

        {/* 3 Pricing Cards (Matches User Mockup Image) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "48px" }}>
          {/* 1. FREE PLAN */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: activePlan === "FREE" ? "2px solid #2563eb" : "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Free</span>
                {activePlan === "FREE" && (
                  <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "10px" }}>
                    Current Plan
                  </span>
                )}
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                $0<span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}> /month</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>1 basic template</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Standard search</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Default appearance</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>1 active configuration</span>
                </div>
              </div>
            </div>

            <div>
              {activePlan === "FREE" ? (
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    color: "#94a3b8",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "not-allowed",
                  }}
                >
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fetcher.submit({ plan: "FREE" }, { method: "post" })}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* 2. PRO PLAN */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: activePlan === "PRO" ? "2px solid #2563eb" : "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  👑 Pro
                </span>
                {activePlan === "PRO" && (
                  <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "10px" }}>
                    Current Plan
                  </span>
                )}
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                $4.99<span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}> /month</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>3 Pro templates</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Color customization</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Live preview</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Advanced styling (Pro limits)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Save up to 5 configurations</span>
                </div>
              </div>
            </div>

            <div>
              {activePlan === "PRO" ? (
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: "8px",
                    border: "1px solid #bfdbfe",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "not-allowed",
                  }}
                >
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fetcher.submit({ plan: "PRO" }, { method: "post" })}
                  disabled={fetcher.state === "submitting"}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {fetcher.state === "submitting" ? "Processing..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          </div>

          {/* 3. ADVANCED PLAN */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: activePlan === "ADVANCED" ? "2px solid #9333ea" : "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 4px 12px rgba(147, 51, 234, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  💎 Advanced
                </span>
                {activePlan === "ADVANCED" && (
                  <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "10px" }}>
                    Current Plan
                  </span>
                )}
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
                $9.99<span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}> /month</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>4 Advanced templates</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Image upload</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Image placement & cropping</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Premium customization & banners</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                  <span>Save up to 20 configurations</span>
                </div>
              </div>
            </div>

            <div>
              {activePlan === "ADVANCED" ? (
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: "8px",
                    border: "1px solid #f0abfc",
                    backgroundColor: "#fdf4ff",
                    color: "#9333ea",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "not-allowed",
                  }}
                >
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fetcher.submit({ plan: "ADVANCED" }, { method: "post" })}
                  disabled={fetcher.state === "submitting"}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {fetcher.state === "submitting" ? "Processing..." : "Upgrade to Advanced"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Comparison Table (Matches Mockup) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Feature Comparison
            </h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "center" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "600" }}>Feature</th>
                <th style={{ padding: "12px 20px", fontWeight: "600" }}>Free</th>
                <th style={{ padding: "12px 20px", fontWeight: "600" }}>Pro</th>
                <th style={{ padding: "12px 20px", fontWeight: "600" }}>Advanced</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 20px", textAlign: "left", color: "#334155" }}>Search bar templates</td>
                <td style={{ padding: "12px 20px", fontWeight: "600" }}>1</td>
                <td style={{ padding: "12px 20px", fontWeight: "600" }}>3</td>
                <td style={{ padding: "12px 20px", fontWeight: "600" }}>4</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 20px", textAlign: "left", color: "#334155" }}>Color customization</td>
                <td style={{ padding: "12px 20px", color: "#94a3b8" }}>—</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 20px", textAlign: "left", color: "#334155" }}>Image upload</td>
                <td style={{ padding: "12px 20px", color: "#94a3b8" }}>—</td>
                <td style={{ padding: "12px 20px", color: "#94a3b8" }}>—</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 20px", textAlign: "left", color: "#334155" }}>Advanced styling</td>
                <td style={{ padding: "12px 20px", color: "#94a3b8" }}>—</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
              </tr>
              <tr>
                <td style={{ padding: "12px 20px", textAlign: "left", color: "#334155" }}>Live preview</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
                <td style={{ padding: "12px 20px", color: "#16a34a", fontWeight: "700" }}>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

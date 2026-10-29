import React from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { TEMPLATES, isTemplateAllowed } from "../constants/templates";
import { SearchBarPreview } from "../components/SearchBarPreview";
import { AppLayout } from "../components/AppLayout";
import type { PlanTier } from "../types/search-bar";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    publishedTemplateId: shopData.publishedConfig?.templateId || "classic-search",
  };
};

export default function TemplatesPage() {
  const { shopDomain, activePlan, publishedTemplateId } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    publishedTemplateId: string;
  };

  const freeTemplates = TEMPLATES.filter((t) => t.tier === "FREE");
  const proTemplates = TEMPLATES.filter((t) => t.tier === "PRO");
  const advancedTemplates = TEMPLATES.filter((t) => t.tier === "ADVANCED");

  const renderTemplateSection = (
    title: string,
    subtitle: string,
    templates: typeof TEMPLATES,
    tierColor: string
  ) => (
    <div style={{ marginBottom: "36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
          {title}
        </h2>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#64748b",
            backgroundColor: "#f1f5f9",
            padding: "2px 8px",
            borderRadius: "12px",
          }}
        >
          {subtitle}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {templates.map((tpl) => {
          const isAllowed = isTemplateAllowed(activePlan, tpl.id);
          const isCurrentActive = publishedTemplateId === tpl.id;

          return (
            <div
              key={tpl.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: isCurrentActive ? "2px solid #2563eb" : "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Active Badge */}
              {isCurrentActive && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    zIndex: 10,
                  }}
                >
                  Active On Storefront
                </div>
              )}

              {/* Preview Canvas */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "28px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid #f1f5f9",
                  minHeight: "130px",
                }}
              >
                <div style={{ width: "100%", maxWidth: "340px", pointerEvents: "none" }}>
                  <SearchBarPreview
                    templateId={tpl.id}
                    settings={tpl.defaultSettings}
                    interactive={false}
                  />
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                      {tpl.number}. {tpl.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor:
                          tpl.tier === "ADVANCED" ? "#fdf4ff" : tpl.tier === "PRO" ? "#eff6ff" : "#f1f5f9",
                        color:
                          tpl.tier === "ADVANCED" ? "#9333ea" : tpl.tier === "PRO" ? "#2563eb" : "#475569",
                      }}
                    >
                      {tpl.tier}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                    {tpl.description}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ marginTop: "12px" }}>
                  {isAllowed ? (
                    <Link
                      to={`/app/customize/${tpl.id}`}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        padding: "8px 0",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: "600",
                        borderRadius: "6px",
                        textDecoration: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      Customize Template
                    </Link>
                  ) : (
                    <Link
                      to="/app/pricing"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "100%",
                        textAlign: "center",
                        padding: "8px 0",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: "600",
                        borderRadius: "6px",
                        textDecoration: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      <span>🔒</span>
                      <span>Unlock with {tpl.tier}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
            Search Bar Templates
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Choose from 8 unique templates (1 Free, 3 Pro, 4 Advanced) designed to maximize search conversion.
          </p>
        </div>

        {/* Free Plan */}
        {renderTemplateSection("Free Plan", "1 Template", freeTemplates, "#64748b")}

        {/* Pro Plan */}
        {renderTemplateSection("Pro Plan", "3 Templates", proTemplates, "#2563eb")}

        {/* Advanced Plan */}
        {renderTemplateSection("Advanced Plan", "4 Templates", advancedTemplates, "#9333ea")}
      </div>
    </AppLayout>
  );
}

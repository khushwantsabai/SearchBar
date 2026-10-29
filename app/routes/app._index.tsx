import React from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { PLANS, TEMPLATES, getTemplateById } from "../constants/templates";
import { SearchBarPreview } from "../components/SearchBarPreview";
import { AppLayout } from "../components/AppLayout";
import type { PlanTier } from "../types/search-bar";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    publishedConfig: shopData.publishedConfig
      ? {
          ...shopData.publishedConfig,
          settings: JSON.parse(shopData.publishedConfig.configuration),
        }
      : null,
    configurations: shopData.configurations.map((c: any) => ({
      ...c,
      settings: JSON.parse(c.configuration),
    })),
  };
};

export default function Dashboard() {
  const { shopDomain, activePlan, publishedConfig, configurations } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    publishedConfig: any;
    configurations: any[];
  };
  const planInfo = PLANS[activePlan];
  const activeTemplate = publishedConfig ? getTemplateById(publishedConfig.templateId) : TEMPLATES[0];

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
              Welcome to SearchBar 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Design and publish high-converting search bars for {shopDomain} without writing code.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to="/app/templates"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#1e293b",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Browse Templates
            </Link>
            <Link
              to={publishedConfig ? `/app/customize/${publishedConfig.templateId}` : "/app/customize/classic-search"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Customize Search Bar
            </Link>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "28px" }}>
          {/* Card 1: Active Subscription */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Current Plan</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  backgroundColor: activePlan === "ADVANCED" ? "#fdf4ff" : activePlan === "PRO" ? "#eff6ff" : "#f1f5f9",
                  color: activePlan === "ADVANCED" ? "#9333ea" : activePlan === "PRO" ? "#2563eb" : "#475569",
                  border: `1px solid ${activePlan === "ADVANCED" ? "#f0abfc" : activePlan === "PRO" ? "#bfdbfe" : "#cbd5e1"}`,
                }}
              >
                {activePlan}
              </span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
              ${planInfo.price}<span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>/month</span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px 0" }}>
              {planInfo.templatesAllowed.length} template{planInfo.templatesAllowed.length > 1 ? "s" : ""} unlocked
            </p>
            <Link
              to="/app/pricing"
              style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", textDecoration: "none" }}
            >
              {activePlan === "ADVANCED" ? "Manage billing →" : "Upgrade plan →"}
            </Link>
          </div>

          {/* Card 2: Storefront Publication Status */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Storefront Status</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  backgroundColor: publishedConfig ? "#f0fdf4" : "#fffbeb",
                  color: publishedConfig ? "#16a34a" : "#d97706",
                  border: `1px solid ${publishedConfig ? "#bbf7d0" : "#fef3c7"}`,
                }}
              >
                {publishedConfig ? "Active & Published" : "Draft"}
              </span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
              {publishedConfig ? publishedConfig.name : "No Search Bar Published"}
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px 0" }}>
              Template: {activeTemplate ? activeTemplate.name : "Classic Search"}
            </p>
            <Link
              to="/app/installation"
              style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", textDecoration: "none" }}
            >
              Theme editor guidance →
            </Link>
          </div>

          {/* Card 3: Saved Configurations */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Configurations</span>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                {configurations.length} / {planInfo.maxConfigurations}
              </span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
              {configurations.length} Active
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px 0" }}>
              Allowed on {planInfo.name} tier
            </p>
            <Link
              to="/app/search-bars"
              style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", textDecoration: "none" }}
            >
              Manage search bars →
            </Link>
          </div>
        </div>

        {/* Live Active Preview Banner */}
        {publishedConfig && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>
                  Active Storefront Search Bar
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  This design is currently active on your storefront theme extension.
                </p>
              </div>
              <Link
                to={`/app/customize/${publishedConfig.templateId}`}
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#2563eb",
                  textDecoration: "none",
                  backgroundColor: "#eff6ff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                }}
              >
                Edit Design
              </Link>
            </div>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "32px", border: "1px dashed #cbd5e1" }}>
              <SearchBarPreview
                templateId={publishedConfig.templateId}
                settings={publishedConfig.settings}
                interactive={true}
              />
            </div>
          </div>
        )}

        {/* Installation Checklist */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Installation & Setup Checklist
            </h2>
            <Link
              to="/app/installation"
              style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", textDecoration: "none" }}
            >
              Open installation wizard →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#16a34a", fontSize: "18px" }}>✅</span>
              <div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>1. Install SearchBar</span>
                <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "8px" }}>Connected to {shopDomain}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: publishedConfig ? "#16a34a" : "#cbd5e1", fontSize: "18px" }}>
                {publishedConfig ? "✅" : "⚪"}
              </span>
              <div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>2. Choose & Customize Template</span>
                <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "8px" }}>
                  {publishedConfig ? `Configured with ${activeTemplate?.name}` : "Pick from 8 unique templates"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#2563eb", fontSize: "18px" }}>👉</span>
              <div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>3. Add App Block in Theme Editor</span>
                <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "8px" }}>
                  Enable the SearchBar block or embed in your Shopify theme
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

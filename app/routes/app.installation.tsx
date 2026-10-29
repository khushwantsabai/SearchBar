import React from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { AppLayout } from "../components/AppLayout";
import { getTemplateById } from "../constants/templates";
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
          template: getTemplateById(shopData.publishedConfig.templateId),
        }
      : null,
  };
};

export default function InstallationPage() {
  const { shopDomain, activePlan, publishedConfig } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    publishedConfig: any;
  };
  const themeEditorUrl = `https://${shopDomain}/admin/themes/current/editor?context=apps`;

  const steps = [
    {
      number: 1,
      title: "Welcome to SearchBar",
      description: `Application is installed and connected to your store (${shopDomain}).`,
      completed: true,
    },
    {
      number: 2,
      title: "Choose a Subscription Plan",
      description: `Current Plan: ${activePlan}. Upgrade anytime to unlock more templates, colors, and image uploads.`,
      completed: true,
      action: <Link to="/app/pricing" style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}>Manage Plan &rarr;</Link>,
    },
    {
      number: 3,
      title: "Select a Search Bar Template",
      description: "Browse 8 high-converting templates crafted for Shopify storefronts.",
      completed: !!publishedConfig,
      action: <Link to="/app/templates" style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}>Browse Templates &rarr;</Link>,
    },
    {
      number: 4,
      title: "Customize & Configure",
      description: publishedConfig
        ? `Configured: ${publishedConfig.name} (${publishedConfig.template?.name})`
        : "Tune placeholder text, colors, dimensions, and buttons.",
      completed: !!publishedConfig,
      action: (
        <Link
          to={publishedConfig ? `/app/customize/${publishedConfig.templateId}` : "/app/customize/classic-search"}
          style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}
        >
          Open Editor &rarr;
        </Link>
      ),
    },
    {
      number: 5,
      title: "Publish Configuration",
      description: publishedConfig?.isPublished
        ? "Active search bar configuration is published and ready for theme injection."
        : "Set your search bar to Active in the dashboard or editor.",
      completed: !!publishedConfig?.isPublished,
    },
    {
      number: 6,
      title: "Add App Block in Shopify Theme Editor",
      description: "Open your theme editor and add the 'SearchBar - Storefront Search' block to your header, announcement bar, or homepage section.",
      completed: false,
      highlight: true,
      action: (
        <a
          href={themeEditorUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
            marginTop: "8px",
          }}
        >
          Open Theme Editor ↗
        </a>
      ),
    },
    {
      number: 7,
      title: "Save Theme & Verify Storefront Search",
      description: "Click 'Save' in the Shopify theme editor. Visit your storefront to verify search submissions and predictive product suggestions.",
      completed: false,
      action: (
        <a
          href={`https://${shopDomain}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}
        >
          View Storefront ↗
        </a>
      ),
    },
  ];

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
            Installation & Storefront Setup Guide
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Follow these 7 quick steps to launch SearchBar on your Shopify theme.
          </p>
        </div>

        {/* Steps List */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: step.highlight ? "#eff6ff" : step.completed ? "#f8fafc" : "#ffffff",
                border: step.highlight ? "1px solid #bfdbfe" : "1px solid #f1f5f9",
              }}
            >
              {/* Step indicator */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: step.completed ? "#16a34a" : step.highlight ? "#2563eb" : "#e2e8f0",
                  color: step.completed || step.highlight ? "#ffffff" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {step.completed ? "✓" : step.number}
              </div>

              {/* Step text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                    Step {step.number}: {step.title}
                  </h3>
                  {step.completed && (
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#16a34a", backgroundColor: "#f0fdf4", padding: "2px 8px", borderRadius: "10px" }}>
                      Completed
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                  {step.description}
                </p>
                {step.action}
              </div>
            </div>
          ))}
        </div>

        {/* Note Box */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            color: "#475569",
            lineHeight: "1.5",
          }}
        >
          <strong style={{ color: "#0f172a" }}>Need Help?</strong> Our Theme App Extension uses Shopify's official theme architecture. No manual code edits are made to your theme files, and you can reposition or remove the SearchBar block at any time via the Shopify Theme Editor.
        </div>
      </div>
    </AppLayout>
  );
}

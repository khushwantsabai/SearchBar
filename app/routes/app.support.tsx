import React from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { AppLayout } from "../components/AppLayout";
import type { PlanTier } from "../types/search-bar";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    supportEmail: process.env.SUPPORT_CONTACT_EMAIL || "support@example.com",
    supportUrl: process.env.SUPPORT_CONTACT_URL || null,
  };
};

export default function SupportPage() {
  const { shopDomain, activePlan, supportEmail, supportUrl } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    supportEmail: string;
    supportUrl: string | null;
  };

  const faqs = [
    {
      q: "How does SearchBar integrate with my Shopify store?",
      a: "SearchBar uses Shopify's official Theme App Extension system. You add the SearchBar block directly into your theme sections via the Shopify Theme Editor without modifying any Liquid template files manually.",
    },
    {
      q: "Does SearchBar replace Shopify's search engine?",
      a: "No. SearchBar seamlessly wraps and enhances Shopify's native search routing (/search?q=...) and Shopify's native Predictive Search API (/search/suggest.json). Your store's existing catalog, stock status, and prices are used in real-time.",
    },
    {
      q: "Why isn't my search bar showing on the storefront?",
      a: "Make sure you have: 1) Created and clicked 'Save Changes' on your desired search bar, 2) Checked 'Publish to Storefront', and 3) Added the SearchBar app block to your theme in the Shopify Theme Editor and clicked 'Save' in the theme editor.",
    },
    {
      q: "How do upgrades and billing work?",
      a: "All subscription upgrades are processed through Shopify's secure App Billing API. You will see charges directly on your monthly Shopify store invoice, with zero hidden fees.",
    },
    {
      q: "What happens if I downgrade my plan?",
      a: "When you downgrade, your existing search bar configurations remain saved in your account. However, configurations using templates or features beyond the new tier's limits cannot be published until you upgrade again.",
    },
  ];

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
            Support & Help Center
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Find answers to common questions or reach out to our team for assistance.
          </p>
        </div>

        {/* Contact Support Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #bfdbfe",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0" }}>
              Need assistance with your setup?
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Our dedicated support team is here to help you configure SearchBar for your theme.
            </p>
          </div>
          <div>
            {supportUrl ? (
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Contact Support ↗
              </a>
            ) : (
              <a
                href={`mailto:${supportEmail}?subject=Support%20Request%20for%20${shopDomain}`}
                style={{
                  display: "inline-block",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Email Support ({supportEmail})
              </a>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  padding: "18px",
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
                  {faq.q}
                </h4>
                <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: "1.5" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            color: "#64748b",
            lineHeight: "1.5",
          }}
        >
          <strong style={{ color: "#334155" }}>Data Protection & Privacy Notice:</strong> SearchBar stores only shop-level configuration settings and subscription metadata needed to render your storefront search bars. We do not store, copy, or track your end-customer personal data or checkout information.
        </div>
      </div>
    </AppLayout>
  );
}

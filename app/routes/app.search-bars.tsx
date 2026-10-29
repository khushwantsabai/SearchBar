import React from "react";
import { Link, useLoaderData, useFetcher, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { PLANS, getTemplateById } from "../constants/templates";
import { AppLayout } from "../components/AppLayout";
import type { PlanTier } from "../types/search-bar";
import {
  listConfigurations,
  duplicateConfiguration,
  deleteConfiguration,
  setPublishedConfiguration,
} from "../models/configuration.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);
  const configs = await listConfigurations(shopData.shop?.id || "");

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    shopId: shopData.shop?.id || "",
    configurations: configs.map((c: any) => ({
      ...c,
      settings: JSON.parse(c.configuration),
      template: getTemplateById(c.templateId),
    })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);
  const formData = await request.formData();

  const intent = formData.get("intent") as string;
  const configId = formData.get("configId") as string;
  const shopId = shopData.shop?.id || "";

  try {
    if (intent === "publish") {
      await setPublishedConfiguration(configId, shopId, shopData.activePlan);
      return { success: true, message: "Configuration published to storefront successfully!" };
    }
    if (intent === "duplicate") {
      await duplicateConfiguration(configId, shopId, shopData.activePlan);
      return { success: true, message: "Configuration duplicated successfully!" };
    }
    if (intent === "delete") {
      await deleteConfiguration(configId, shopId);
      return { success: true, message: "Configuration deleted." };
    }
    return { success: false, error: "Invalid action intent." };
  } catch (err: any) {
    return { success: false, error: err.message || "Action failed." };
  }
};

export default function SearchBarsPage() {
  const { shopDomain, activePlan, configurations } = useLoaderData() as {
    shopDomain: string;
    activePlan: PlanTier;
    configurations: any[];
  };
  const fetcher = useFetcher() as any;
  const planInfo = PLANS[activePlan];

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
              My Search Bars
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Manage your saved search bar configurations. ({configurations.length} of {planInfo.maxConfigurations} used on {planInfo.name} Plan)
            </p>
          </div>
          <Link
            to="/app/templates"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            + Create New Search Bar
          </Link>
        </div>

        {/* Action feedback */}
        {fetcher.data?.error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {fetcher.data.error}
          </div>
        )}
        {fetcher.data?.success && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {fetcher.data.message}
          </div>
        )}

        {/* Configurations Table */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Template</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Last Updated</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((item: any) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: item.isPublished ? "#fafcff" : "#ffffff",
                  }}
                >
                  <td style={{ padding: "14px 16px", fontWeight: "600", color: "#0f172a" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#334155" }}>
                    {item.template?.name || item.templateId}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {item.isPublished ? (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        ● Active on Storefront
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "500",
                          backgroundColor: "#f1f5f9",
                          color: "#64748b",
                          padding: "3px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        Draft
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                      {!item.isPublished && (
                        <button
                          type="button"
                          onClick={() =>
                            fetcher.submit(
                              { intent: "publish", configId: item.id },
                              { method: "post" }
                            )
                          }
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Publish
                        </button>
                      )}
                      <Link
                        to={`/app/customize/${item.templateId}`}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#f8fafc",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          fetcher.submit(
                            { intent: "duplicate", configId: item.id },
                            { method: "post" }
                          )
                        }
                        title="Duplicate"
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#ffffff",
                          color: "#64748b",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Copy
                      </button>
                      {configurations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                              fetcher.submit(
                                { intent: "delete", configId: item.id },
                                { method: "post" }
                              );
                            }
                          }}
                          title="Delete"
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#ffffff",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

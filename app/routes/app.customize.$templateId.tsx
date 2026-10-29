import React, { useState, useEffect } from "react";
import { Link, useLoaderData, useFetcher, useNavigate, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import { TEMPLATES, getTemplateById, isTemplateAllowed, PLANS } from "../constants/templates";
import { SearchBarPreview } from "../components/SearchBarPreview";
import { AppLayout } from "../components/AppLayout";
import { saveConfiguration } from "../models/configuration.server";
import type { PlanTier, SearchBarSettings } from "../types/search-bar";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  const templateId = params.templateId || "classic-search";
  const template = getTemplateById(templateId) || TEMPLATES[0];

  // Find if there is an existing configuration for this template or published
  const existingConfig = shopData.configurations.find((c: any) => c.templateId === template.id);

  return {
    shopDomain: session.shop,
    activePlan: shopData.activePlan,
    shopId: shopData.shop?.id || "",
    template,
    existingConfig: existingConfig
      ? {
          ...existingConfig,
          settings: JSON.parse(existingConfig.configuration),
        }
      : null,
    isPublished: existingConfig ? existingConfig.isPublished : false,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);
  const formData = await request.formData();

  const id = (formData.get("id") as string) || undefined;
  const templateId = (formData.get("templateId") as string) || "classic-search";
  const name = (formData.get("name") as string) || "Search Bar";
  const settingsJson = formData.get("settings") as string;
  const isPublished = formData.get("isPublished") === "true";

  try {
    const parsedSettings = JSON.parse(settingsJson);
    const saved = await saveConfiguration({
      id,
      shopId: shopData.shop?.id || "",
      name,
      templateId,
      settings: parsedSettings,
      isPublished,
      tier: shopData.activePlan,
    });

    return { success: true, message: "Configuration saved successfully!", configId: saved.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save configuration." };
  }
};

export default function CustomizeTemplatePage() {
  const { shopDomain, activePlan, shopId, template, existingConfig, isPublished: initialPublished } =
    useLoaderData() as {
      shopDomain: string;
      activePlan: PlanTier;
      shopId: string;
      template: any;
      existingConfig: any;
      isPublished: boolean;
    };
  const fetcher = useFetcher() as any;
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SearchBarSettings>(
    existingConfig ? existingConfig.settings : template.defaultSettings
  );
  const [configName, setConfigName] = useState(
    existingConfig ? existingConfig.name : `My ${template.name}`
  );
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [hasChanges, setHasChanges] = useState(false);

  const isAllowed = isTemplateAllowed(activePlan, template.id);
  const isProOrAbove = activePlan === "PRO" || activePlan === "ADVANCED";
  const isAdvanced = activePlan === "ADVANCED";

  const handleSettingChange = (key: keyof SearchBarSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setSettings(template.defaultSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    fetcher.submit(
      {
        id: existingConfig?.id || "",
        templateId: template.id,
        name: configName,
        settings: JSON.stringify(settings),
        isPublished: String(isPublished),
      },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      setHasChanges(false);
    }
  }, [fetcher.data]);

  return (
    <AppLayout activePlan={activePlan} shopDomain={shopDomain}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Customize Your Search Bar
              </h1>
              {hasChanges && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    backgroundColor: "#fef3c7",
                    color: "#b45309",
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  Unsaved changes
                </span>
              )}
            </div>
            <Link
              to="/app/templates"
              style={{
                fontSize: "13px",
                color: "#64748b",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              &larr; Back to Templates
            </Link>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#475569",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={fetcher.state === "submitting" || !isAllowed}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: isAllowed ? "#2563eb" : "#94a3b8",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
                border: "none",
                cursor: isAllowed ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {fetcher.state === "submitting" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
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

        {/* 3-Column Layout Matching User Mockup */}
        <div style={{ display: "grid", gridTemplateColumns: "310px 1fr 280px", gap: "20px", alignItems: "start" }}>
          {/* LEFT PANEL: Customization Controls */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{template.name}</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  backgroundColor:
                    template.tier === "ADVANCED" ? "#fdf4ff" : template.tier === "PRO" ? "#eff6ff" : "#f1f5f9",
                  color:
                    template.tier === "ADVANCED" ? "#9333ea" : template.tier === "PRO" ? "#2563eb" : "#475569",
                }}
              >
                {template.tier} Plan
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0" }}>
              Customize the appearance of your search bar.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Configuration Name */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Search Bar Name
                </label>
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => {
                    setConfigName(e.target.value);
                    setHasChanges(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Placeholder Text */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={settings.placeholder}
                  onChange={(e) => handleSettingChange("placeholder", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Background Color (Pro+) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Background Color</label>
                  {!isProOrAbove && <span style={{ fontSize: "10px", color: "#2563eb", fontWeight: "600" }}>🔒 Pro</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    disabled={!isProOrAbove}
                    value={settings.backgroundColor}
                    onChange={(e) => handleSettingChange("backgroundColor", e.target.value)}
                    style={{
                      width: "36px",
                      height: "36px",
                      padding: 0,
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: isProOrAbove ? "pointer" : "not-allowed",
                    }}
                  />
                  <input
                    type="text"
                    disabled={!isProOrAbove}
                    value={settings.backgroundColor}
                    onChange={(e) => handleSettingChange("backgroundColor", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      backgroundColor: isProOrAbove ? "#ffffff" : "#f1f5f9",
                    }}
                  />
                </div>
              </div>

              {/* Text Color (Pro+) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Text Color</label>
                  {!isProOrAbove && <span style={{ fontSize: "10px", color: "#2563eb", fontWeight: "600" }}>🔒 Pro</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    disabled={!isProOrAbove}
                    value={settings.textColor}
                    onChange={(e) => handleSettingChange("textColor", e.target.value)}
                    style={{
                      width: "36px",
                      height: "36px",
                      padding: 0,
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: isProOrAbove ? "pointer" : "not-allowed",
                    }}
                  />
                  <input
                    type="text"
                    disabled={!isProOrAbove}
                    value={settings.textColor}
                    onChange={(e) => handleSettingChange("textColor", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      backgroundColor: isProOrAbove ? "#ffffff" : "#f1f5f9",
                    }}
                  />
                </div>
              </div>

              {/* Border Color (Pro+) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Border Color</label>
                  {!isProOrAbove && <span style={{ fontSize: "10px", color: "#2563eb", fontWeight: "600" }}>🔒 Pro</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    disabled={!isProOrAbove}
                    value={settings.borderColor}
                    onChange={(e) => handleSettingChange("borderColor", e.target.value)}
                    style={{
                      width: "36px",
                      height: "36px",
                      padding: 0,
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: isProOrAbove ? "pointer" : "not-allowed",
                    }}
                  />
                  <input
                    type="text"
                    disabled={!isProOrAbove}
                    value={settings.borderColor}
                    onChange={(e) => handleSettingChange("borderColor", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      backgroundColor: isProOrAbove ? "#ffffff" : "#f1f5f9",
                    }}
                  />
                </div>
              </div>

              {/* Border Radius Slider (Pro+) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Border Radius</label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{settings.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  disabled={!isProOrAbove}
                  value={settings.borderRadius}
                  onChange={(e) => handleSettingChange("borderRadius", Number(e.target.value))}
                  style={{ width: "100%", cursor: isProOrAbove ? "pointer" : "not-allowed" }}
                />
              </div>

              {/* Width Slider */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Width</label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{settings.maxWidth}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={settings.maxWidth}
                  onChange={(e) => handleSettingChange("maxWidth", Number(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
              </div>

              {/* Show Search Button Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Show Search Button</label>
                <input
                  type="checkbox"
                  checked={settings.showButton}
                  onChange={(e) => handleSettingChange("showButton", e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
              </div>

              {/* Advanced Image Upload Section (Advanced Only) */}
              {template.tier === "ADVANCED" && (
                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "14px",
                    marginTop: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Image Controls</span>
                    {!isAdvanced && <span style={{ fontSize: "10px", color: "#9333ea", fontWeight: "700" }}>🔒 Advanced</span>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                        Image URL
                      </label>
                      <input
                        type="text"
                        disabled={!isAdvanced}
                        value={settings.imageUrl || ""}
                        placeholder="https://..."
                        onChange={(e) => handleSettingChange("imageUrl", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {template.id !== "banner-search" && (
                      <div>
                        <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                          Placement
                        </label>
                        <select
                          disabled={!isAdvanced}
                          value={settings.imagePlacement || "left"}
                          onChange={(e) => handleSettingChange("imagePlacement", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12px",
                          }}
                        >
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Publish Storefront Toggle */}
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                    Publish to Storefront
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Make this search bar active on your theme
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => {
                    setIsPublished(e.target.checked);
                    setHasChanges(true);
                  }}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {/* CENTER PANEL: Live Interactive Preview */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              minHeight: "560px",
            }}
          >
            {/* Viewport Tabs */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "28px",
              }}
            >
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: viewport === "desktop" ? "#eff6ff" : "#f1f5f9",
                  color: viewport === "desktop" ? "#2563eb" : "#64748b",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: viewport === "mobile" ? "#eff6ff" : "#f1f5f9",
                  color: viewport === "mobile" ? "#2563eb" : "#64748b",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Mobile
              </button>
            </div>

            {/* Canvas Area */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                border: "1px dashed #cbd5e1",
                padding: "40px 20px",
              }}
            >
              <SearchBarPreview
                templateId={template.id}
                settings={settings}
                viewport={viewport}
                interactive={true}
              />
            </div>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "14px" }}>
              💡 Live preview: Click or type in the search bar above to see predictive suggestions!
            </p>
          </div>

          {/* RIGHT PANEL: Template Info & Upsell */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Mini Preview */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                  pointerEvents: "none",
                }}
              >
                <SearchBarPreview templateId={template.id} settings={template.defaultSettings} interactive={false} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  {template.name}
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#2563eb",
                    backgroundColor: "#eff6ff",
                    padding: "2px 6px",
                    borderRadius: "6px",
                  }}
                >
                  {template.tier} Plan
                </span>
              </div>

              {/* Feature Checklist with Checkmarks */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                {template.features.map((feat: string, idx: number) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell Card (Matches Mockup) */}
            {activePlan !== "ADVANCED" && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #bfdbfe",
                  padding: "18px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>👑</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                    Want more features?
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px 0", lineHeight: "1.4" }}>
                  Upgrade to Advanced for image upload, 4 premium templates, split layouts, and custom banner backgrounds.
                </p>
                <Link
                  to="/app/pricing"
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
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import React, { useState } from "react";
import type { SearchBarSettings } from "../types/search-bar";

interface SearchBarPreviewProps {
  templateId: string;
  settings: SearchBarSettings;
  viewport?: "desktop" | "mobile";
  interactive?: boolean;
}

export function SearchBarPreview({
  templateId,
  settings,
  viewport = "desktop",
  interactive = true,
}: SearchBarPreviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Sample products matching the user mockup
  const sampleProducts = [
    {
      title: "Running Shoes",
      price: "$89.00",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80",
    },
    {
      title: "Backpack",
      price: "$59.00",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&auto=format&fit=crop&q=80",
    },
    {
      title: "Winter Jacket",
      price: "$129.00",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120&auto=format&fit=crop&q=80",
    },
  ];

  const isMobile = viewport === "mobile";
  const effectiveHeight = isMobile && settings.mobileHeight ? settings.mobileHeight : settings.height;
  const effectiveFontSize = isMobile && settings.mobileFontSize ? settings.mobileFontSize : settings.fontSize;
  const effectiveBorderRadius = isMobile && settings.mobileBorderRadius ? settings.mobileBorderRadius : settings.borderRadius;

  const filteredProducts = searchTerm
    ? sampleProducts.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : sampleProducts;

  // Render Inner Content for each Template
  const renderTemplateContent = () => {
    switch (templateId) {
      // 1. CLASSIC SEARCH
      case "classic-search":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              padding: "0 14px",
              boxSizing: "border-box",
              boxShadow: settings.boxShadow,
            }}
          >
            <input
              type="text"
              placeholder={settings.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: settings.textColor,
                fontSize: `${effectiveFontSize}px`,
                outline: "none",
                padding: "4px 8px 4px 0",
              }}
            />
            {settings.showIcon && (
              <svg
                style={{ width: "18px", height: "18px", color: settings.iconColor, flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        );

      // 2. MODERN ROUNDED
      case "modern-rounded":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              padding: "4px 6px 4px 18px",
              boxSizing: "border-box",
              boxShadow: settings.boxShadow,
            }}
          >
            <input
              type="text"
              placeholder={settings.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: settings.textColor,
                fontSize: `${effectiveFontSize}px`,
                outline: "none",
              }}
            />
            {settings.showButton && (
              <button
                type="button"
                style={{
                  width: `${effectiveHeight - 10}px`,
                  height: `${effectiveHeight - 10}px`,
                  borderRadius: "50%",
                  backgroundColor: settings.buttonBgColor,
                  color: settings.buttonTextColor,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "transform 0.1s ease",
                }}
              >
                <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
        );

      // 3. MINIMAL OUTLINE
      case "minimal-outline":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              padding: "0 12px",
              boxSizing: "border-box",
            }}
          >
            {settings.showIcon && settings.iconPosition === "left" && (
              <svg
                style={{ width: "16px", height: "16px", color: settings.iconColor, marginRight: "8px", flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <input
              type="text"
              placeholder={settings.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: settings.textColor,
                fontSize: `${effectiveFontSize}px`,
                fontWeight: settings.fontWeight,
                outline: "none",
              }}
            />
            {settings.showIcon && settings.iconPosition === "right" && (
              <svg
                style={{ width: "16px", height: "16px", color: settings.iconColor, flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        );

      // 4. BOLD SEARCH BUTTON
      case "bold-search-button":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              padding: "3px 3px 3px 14px",
              boxSizing: "border-box",
              boxShadow: settings.boxShadow,
            }}
          >
            {settings.showIcon && (
              <svg
                style={{ width: "18px", height: "18px", color: settings.iconColor, marginRight: "10px", flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <input
              type="text"
              placeholder={settings.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: settings.textColor,
                fontSize: `${effectiveFontSize}px`,
                outline: "none",
              }}
            />
            {settings.showButton && (
              <button
                type="button"
                style={{
                  height: "100%",
                  padding: "0 18px",
                  borderRadius: `${settings.buttonBorderRadius}px`,
                  backgroundColor: settings.buttonBgColor,
                  color: settings.buttonTextColor,
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <span>{settings.buttonText}</span>
              </button>
            )}
          </div>
        );

      // 5. IMAGE ACCENT SEARCH (Advanced)
      case "image-accent-search":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              padding: "4px 12px",
              boxSizing: "border-box",
              boxShadow: settings.boxShadow,
              gap: "10px",
            }}
          >
            {settings.imagePlacement !== "right" && settings.imageUrl && (
              <img
                src={settings.imageUrl}
                alt="Accent"
                style={{
                  width: `${settings.imageWidth || 40}px`,
                  height: `${settings.imageHeight || 40}px`,
                  borderRadius: `${settings.imageBorderRadius || 8}px`,
                  objectFit: settings.imageFit || "cover",
                  flexShrink: 0,
                }}
              />
            )}
            <input
              type="text"
              placeholder={settings.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: settings.textColor,
                fontSize: `${effectiveFontSize}px`,
                outline: "none",
              }}
            />
            {settings.imagePlacement === "right" && settings.imageUrl && (
              <img
                src={settings.imageUrl}
                alt="Accent"
                style={{
                  width: `${settings.imageWidth || 40}px`,
                  height: `${settings.imageHeight || 40}px`,
                  borderRadius: `${settings.imageBorderRadius || 8}px`,
                  objectFit: settings.imageFit || "cover",
                  flexShrink: 0,
                }}
              />
            )}
            {settings.showIcon && (
              <svg
                style={{ width: "18px", height: "18px", color: settings.iconColor, flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        );

      // 6. BANNER SEARCH (Advanced)
      case "banner-search":
        return (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "170px",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              boxSizing: "border-box",
              backgroundImage: `url(${settings.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.bgOverlayColor || "rgba(15, 23, 42, 0.45)",
                zIndex: 1,
              }}
            />
            {/* Centered Search Bar */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                width: "90%",
                maxWidth: "540px",
                height: `${effectiveHeight}px`,
                backgroundColor: settings.backgroundColor,
                borderRadius: `${effectiveBorderRadius}px`,
                padding: "4px 8px 4px 18px",
                boxSizing: "border-box",
                boxShadow: settings.boxShadow,
              }}
            >
              <input
                type="text"
                placeholder={settings.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  color: settings.textColor,
                  fontSize: `${effectiveFontSize}px`,
                  outline: "none",
                }}
              />
              {settings.showButton && (
                <button
                  type="button"
                  style={{
                    height: "38px",
                    padding: "0 18px",
                    borderRadius: `${settings.buttonBorderRadius}px`,
                    backgroundColor: settings.buttonBgColor,
                    color: settings.buttonTextColor,
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {settings.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      // 7. PREMIUM SPLIT SEARCH (Advanced)
      case "premium-split-search":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              overflow: "hidden",
              boxShadow: settings.boxShadow,
            }}
          >
            {settings.imagePlacement !== "right" && settings.imageUrl && (
              <div
                style={{
                  width: `${settings.imageWidth || 60}px`,
                  backgroundImage: `url(${settings.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 14px" }}>
              <input
                type="text"
                placeholder={settings.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  color: settings.textColor,
                  fontSize: `${effectiveFontSize}px`,
                  outline: "none",
                }}
              />
            </div>
            {settings.showButton && (
              <button
                type="button"
                style={{
                  margin: "4px",
                  padding: "0 16px",
                  borderRadius: `${settings.buttonBorderRadius}px`,
                  backgroundColor: settings.buttonBgColor,
                  color: settings.buttonTextColor,
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {settings.buttonText}
              </button>
            )}
          </div>
        );

      // 8. FEATURED SEARCH (Advanced)
      case "featured-search":
      default:
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: `${effectiveHeight}px`,
              backgroundColor: settings.backgroundColor,
              border: `${settings.borderWidth}px solid ${settings.borderColor}`,
              borderRadius: `${effectiveBorderRadius}px`,
              padding: "4px 8px 4px 16px",
              boxSizing: "border-box",
              boxShadow: settings.boxShadow,
              gap: "8px",
            }}
          >
            {settings.showIcon && (
              <svg
                style={{ width: "18px", height: "18px", color: settings.iconColor, flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <input
              type="text"
              placeholder={settings.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: settings.textColor,
                fontSize: `${effectiveFontSize}px`,
                outline: "none",
              }}
            />
            {settings.imageUrl && (
              <img
                src={settings.imageUrl}
                alt="Badge"
                style={{
                  width: `${settings.imageWidth || 40}px`,
                  height: `${settings.imageHeight || 40}px`,
                  borderRadius: `${settings.imageBorderRadius || 8}px`,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            {settings.showButton && (
              <button
                type="button"
                style={{
                  height: "38px",
                  padding: "0 16px",
                  borderRadius: `${settings.buttonBorderRadius}px`,
                  backgroundColor: settings.buttonBgColor,
                  color: settings.buttonTextColor,
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {settings.buttonText}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: isMobile ? "360px" : "100%",
          maxWidth: isMobile ? "360px" : `${settings.maxWidth}${settings.widthUnit}`,
          position: "relative",
          transition: "all 0.2s ease",
        }}
      >
        {renderTemplateContent()}

        {/* Live Predictive Search Dropdown (Matches user mockup) */}
        {interactive && (isOpen || searchTerm.length > 0) && (
          <div
            style={{
              position: "absolute",
              top: templateId === "banner-search" ? "auto" : "calc(100% + 8px)",
              bottom: templateId === "banner-search" ? "10px" : "auto",
              left: 0,
              right: 0,
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              zIndex: 50,
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            <div style={{ padding: "8px 0" }}>
              {filteredProducts.map((product, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      objectFit: "cover",
                      backgroundColor: "#f1f5f9",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                      {product.title}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {product.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fcfcfc",
              }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Close
              </button>
              <a
                href="#all-results"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#2563eb",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View all results &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


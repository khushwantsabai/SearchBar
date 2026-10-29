import React from "react";
import { Link, useLocation } from "react-router";
import type { PlanTier } from "../types/search-bar";
import { PLANS } from "../constants/templates";

interface AppLayoutProps {
  children: React.ReactNode;
  activePlan: PlanTier;
  shopDomain?: string;
}

export function AppLayout({ children, activePlan, shopDomain }: AppLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      label: "Dashboard",
      path: "/app",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Templates",
      path: "/app/templates",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Customize",
      path: "/app/customize",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      label: "My Search Bars",
      path: "/app/search-bars",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Installation",
      path: "/app/installation",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: "Pricing & Billing",
      path: "/app/pricing",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      label: "Settings",
      path: "/app/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Support",
      path: "/app/support",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const planInfo = PLANS[activePlan];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div>
          {/* Logo */}
          <Link
            to="/app"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#0f172a",
              marginBottom: "28px",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-0.02em", color: "#0f172a" }}>SearchBar</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map((item) => {
              const isActive =
                item.path === "/app"
                  ? currentPath === "/app"
                  : currentPath.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? "#2563eb" : "#475569",
                    backgroundColor: isActive ? "#eff6ff" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ color: isActive ? "#2563eb" : "#64748b", display: "flex", alignItems: "center" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Plan Status Pill / Card */}
        <div
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: "10px",
            padding: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
              {planInfo.name} Plan {activePlan !== "FREE" ? "⭐" : ""}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
              ${planInfo.price}/mo
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 10px 0" }}>
            {activePlan === "FREE"
              ? "1 template • Standard styling"
              : activePlan === "PRO"
              ? "4 templates • Colors & styling"
              : "All 8 templates • Image uploads"}
          </p>
          <Link
            to="/app/pricing"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              padding: "7px 0",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: "600",
              borderRadius: "6px",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            {activePlan === "ADVANCED" ? "Manage Plan" : "Upgrade"}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto", minWidth: 0, boxSizing: "border-box" }}>
        {children}
      </main>
    </div>
  );
}


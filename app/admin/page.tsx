"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteContent, CategoriesMap } from "@/lib/content-manager";

export default function AdminDashboardPage() {
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [categories, setCategories] = useState<CategoriesMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.siteContent) setSiteContent(data.siteContent);
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "var(--adm-text-muted)" }}>Loading dashboard data...</div>;
  }

  const categoryList = categories ? Object.values(categories) : [];

  return (
    <div>
      {/* Top Welcome / Status Card */}
      <div
        className="admin-card"
        style={{
          background: "linear-gradient(135deg, #182335 0%, #111824 100%)",
          borderColor: "rgba(197, 168, 128, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <span className="admin-badge admin-badge-gold" style={{ marginBottom: "12px" }}>
            Real Estate CMS Active
          </span>
          <h2 style={{ fontSize: "22px", margin: "0 0 10px", color: "#ffffff" }}>
            Welcome to PROPVISTA Admin Console
          </h2>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
            All website content is dynamically stored in clean local JSON files. Any changes you make here are instantly reflected across the live frontend without rebuilding.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin/hero" className="admin-btn admin-btn-primary">
              <span>✨ Edit Homepage Hero</span>
            </Link>
            <Link href="/admin/media" className="admin-btn admin-btn-secondary">
              <span>📁 Upload New Images</span>
            </Link>
            <Link href="/admin/settings" className="admin-btn admin-btn-secondary">
              <span>🔑 Change Password</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stat Tiles */}
      <div className="admin-grid-4" style={{ marginBottom: "28px" }}>
        <div className="admin-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--adm-text-dim)", textTransform: "uppercase" }}>
            Total Categories
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#ffffff", marginTop: "6px" }}>
            {categoryList.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            Active landing sections
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--adm-text-dim)", textTransform: "uppercase" }}>
            Homepage Starting Price
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--adm-accent)", marginTop: "6px" }}>
            {siteContent?.hero.priceBadge || "N/A"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            Displayed on main hero
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--adm-text-dim)", textTransform: "uppercase" }}>
            Selection Dock Cards
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#ffffff", marginTop: "6px" }}>
            {siteContent?.selectionCards.length || 0} Cards
          </div>
          <div style={{ fontSize: "12px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            Interactive bottom dock
          </div>
        </div>

        <div className="admin-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--adm-text-dim)", textTransform: "uppercase" }}>
            Storage Type
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--adm-green)", marginTop: "6px" }}>
            Local JSON
          </div>
          <div style={{ fontSize: "12px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            `data/*.json`
          </div>
        </div>
      </div>

      {/* Category Editor Cards Section */}
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h3 className="admin-card__title">Real Estate Category Portfolios</h3>
            <p className="admin-card__desc">
              Manage hero taglines, starting prices, why-invest items, and gallery photos for each portfolio.
            </p>
          </div>
          <Link href="/admin/selection" className="admin-btn admin-btn-secondary" style={{ fontSize: "12.5px" }}>
            Edit Dock Cards Order
          </Link>
        </div>

        <div className="admin-grid-2">
          {categoryList.map((cat) => (
            <div key={cat.slug} className="admin-selection-card">
              <img
                src={cat.hero.visual || "/assets/bythesea-card-cover.avif"}
                alt={cat.name}
                className="admin-selection-card__img"
              />
              <div className="admin-selection-card__body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 className="admin-selection-card__title">{cat.name}</h4>
                    <span className="admin-badge admin-badge-gold" style={{ fontSize: "10px", marginBottom: "8px" }}>
                      {cat.hero.priceBadge}
                    </span>
                  </div>
                  <Link
                    href={`/admin/categories/${cat.slug}`}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                  >
                    Edit Portfolio
                  </Link>
                </div>
                <p className="admin-selection-card__desc" style={{ marginTop: "8px" }}>
                  {cat.hero.tagline}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--adm-card-border)",
                    fontSize: "12px",
                    color: "var(--adm-text-dim)",
                  }}
                >
                  <span>🖼️ {cat.gallery?.slides?.length || 0} Gallery Slides</span>
                  <span>💡 {cat.whyInvestItems?.length || 0} Why Invest Cards</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { CategoriesMap } from "@/lib/content-manager";

export default function AdminCategoriesListPage() {
  const [categories, setCategories] = useState<CategoriesMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !categories) {
    return <div style={{ color: "var(--adm-text-muted)" }}>Loading categories...</div>;
  }

  const categoryList = Object.values(categories);

  return (
    <div>
      <div className="admin-page-header">
        <h2 style={{ fontSize: "20px", margin: "0 0 6px", color: "#ffffff" }}>Category Portfolios</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--adm-text-muted)" }}>
          Select any real estate portfolio below to customize its Hero tagline, starting price, Why Invest cards, and project gallery slides.
        </p>
      </div>

      <div className="admin-grid-2">
        {categoryList.map((cat) => (
          <div key={cat.slug} className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: cat.theme.bg || "#1F2B5E",
                    border: "1px solid var(--adm-accent)",
                  }}
                />
                <h3 className="admin-card__title">{cat.name}</h3>
              </div>
              <span className="admin-badge admin-badge-gold">{cat.hero.priceBadge}</span>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <img
                src={cat.hero.visual}
                alt={cat.name}
                style={{
                  width: "130px",
                  height: "90px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "1px solid var(--adm-card-border)",
                }}
              />
              <div>
                <p style={{ fontSize: "13px", color: "var(--adm-text-muted)", margin: "0 0 10px", lineHeight: "1.5" }}>
                  {cat.hero.tagline}
                </p>
                <div style={{ fontSize: "12px", color: "var(--adm-text-dim)" }}>
                  Slug: <code style={{ color: "var(--adm-accent)" }}>/{cat.slug}</code>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "14px",
                borderTop: "1px solid var(--adm-card-border)",
              }}
            >
              <span style={{ fontSize: "12.5px", color: "var(--adm-text-dim)" }}>
                {cat.gallery?.slides?.length || 0} Slides • {cat.whyInvestItems?.length || 0} Why Invest Cards
              </span>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  href={`/${cat.slug}`}
                  target="_blank"
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Preview ↗
                </Link>
                <Link
                  href={`/admin/categories/${cat.slug}`}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                >
                  Edit Page Content
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

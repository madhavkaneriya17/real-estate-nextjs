"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "@/lib/content-manager";
import ImageUploader from "../components/ImageUploader";

export default function AdminHeroPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setContent(data.content);
      })
      .catch((err) => console.error("Error loading content:", err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleHeroChange = (field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      hero: {
        ...content.hero,
        [field]: value,
      },
    });
  };

  const handleMarqueeChange = (index: number, value: string) => {
    if (!content) return;
    const newItems = [...content.hero.marqueeItems];
    newItems[index] = value;
    setContent({
      ...content,
      hero: {
        ...content.hero,
        marqueeItems: newItems,
      },
    });
  };

  const addMarqueeItem = () => {
    if (!content) return;
    setContent({
      ...content,
      hero: {
        ...content.hero,
        marqueeItems: [...content.hero.marqueeItems, "Elevating Life"],
      },
    });
  };

  const removeMarqueeItem = (index: number) => {
    if (!content) return;
    const newItems = content.hero.marqueeItems.filter((_, i) => i !== index);
    setContent({
      ...content,
      hero: {
        ...content.hero,
        marqueeItems: newItems,
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleHeroChange("heroImage", data.url);
        showToast("Image uploaded and set as Hero visual!");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      showToast(msg, "error");
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      showToast("Homepage Hero updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return <div style={{ color: "var(--adm-text-muted)" }}>Loading Hero content...</div>;
  }

  return (
    <div>
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: "20px", margin: "0 0 6px", color: "#ffffff" }}>Homepage Hero Section</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--adm-text-muted)" }}>
            Customize the main visual, tagline, starting price badge, and moving background marquee text.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
          <span>💾</span>
          <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="admin-grid-2">
        {/* Left Column: Form Fields */}
        <div>
          <div className="admin-card">
            <h3 className="admin-card__title">Tagline & Pricing</h3>
            <p className="admin-card__desc">Central hero message seen upon first entrance.</p>

            <div className="admin-form-group">
              <label className="admin-label">Hero Headline / Tagline</label>
              <textarea
                className="admin-textarea"
                value={content.hero.tagline}
                onChange={(e) => handleHeroChange("tagline", e.target.value)}
                placeholder="e.g. Invest in Exceptional Real Estate..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Price Badge Text</label>
              <input
                type="text"
                className="admin-input"
                value={content.hero.priceBadge}
                onChange={(e) => handleHeroChange("priceBadge", e.target.value)}
                placeholder="e.g. STARTING FROM 100,000€"
              />
            </div>
          </div>

          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 className="admin-card__title">Background Marquee Items</h3>
              <button onClick={addMarqueeItem} className="admin-btn admin-btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                + Add Text
              </button>
            </div>
            <p className="admin-card__desc">Continuous rotating text behind the central hero image.</p>

            {content.hero.marqueeItems.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  className="admin-input"
                  value={item}
                  onChange={(e) => handleMarqueeChange(index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeMarqueeItem(index)}
                  className="admin-btn admin-btn-danger"
                  style={{ padding: "8px 12px" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Media & Preview */}
        <div>
          <div className="admin-card">
            <h3 className="admin-card__title">Hero Center Visual</h3>
            <p className="admin-card__desc">Main property visual displayed in the center of the homepage.</p>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  width: "100%",
                  height: "240px",
                  borderRadius: "var(--adm-radius-sm)",
                  overflow: "hidden",
                  border: "1px solid var(--adm-card-border)",
                  marginBottom: "14px",
                  background: "#000",
                }}
              >
                <img
                  src={content.hero.heroImage}
                  alt="Hero Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Image Path / URL</label>
                <input
                  type="text"
                  className="admin-input"
                  value={content.hero.heroImage}
                  onChange={(e) => handleHeroChange("heroImage", e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Upload New Hero Visual</label>
                <ImageUploader
                  label="Upload Hero Visual"
                  hint="Drag & drop or click to browse (WebP, AVIF, PNG, JPG)"
                  onUploadSuccess={(url) => {
                    handleHeroChange("heroImage", url);
                    showToast("New Hero visual uploaded successfully!");
                  }}
                  onError={(err) => showToast(err, "error")}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Image Alt Description</label>
                <input
                  type="text"
                  className="admin-input"
                  value={content.hero.heroImageAlt || ""}
                  onChange={(e) => handleHeroChange("heroImageAlt", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Underneath Hero: Our Selection Cards Section Preview */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <div className="admin-card__header">
          <div>
            <h3 className="admin-card__title">Underneath Hero: Our Selection Cards</h3>
            <p className="admin-card__desc">
              When visitors click "Our Selection", these 4 destination cards are displayed.
            </p>
          </div>
          <Link href="/admin/selection" className="admin-btn admin-btn-primary" style={{ fontSize: "13px" }}>
            ✏️ Edit All Selection Cards →
          </Link>
        </div>

        <div className="admin-grid-4">
          {content.selectionCards.map((card) => (
            <div
              key={card.id}
              style={{
                background: "var(--adm-input-bg)",
                border: "1px solid var(--adm-card-border)",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "90px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <img
                  src={card.cover}
                  alt={card.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <strong style={{ fontSize: "14px", color: "#fff" }}>{card.title}</strong>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--adm-text-muted)", lineHeight: "1.4" }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import type { SiteContent, SelectionCard } from "@/lib/content-manager";
import ImageUploader from "../components/ImageUploader";

export default function AdminSelectionPage() {
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

  const handleCardChange = (index: number, field: keyof SelectionCard, value: string) => {
    if (!content) return;
    const newCards = [...content.selectionCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setContent({ ...content, selectionCards: newCards });
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

      const rawText = await res.text();
      let data: { error?: string } | null = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Save failed (${res.status}): ${rawText.slice(0, 100)}`);
      }

      showToast("Selection cards saved successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return <div style={{ color: "var(--adm-text-muted)" }}>Loading Selection Cards...</div>;
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
          <h2 style={{ fontSize: "20px", margin: "0 0 6px", color: "#ffffff" }}>Our Selection Cards</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--adm-text-muted)" }}>
            Edit the 4 cards that appear in the &quot;Our Selection&quot; interactive drawer and category switchers.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
          <span>💾</span>
          <span>{saving ? "Saving Changes..." : "Save Selection Cards"}</span>
        </button>
      </div>

      <div className="admin-grid-2">
        {content.selectionCards.map((card, idx) => (
          <div key={card.id || idx} className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                <span>Card {idx + 1}:</span>
                <span style={{ color: "var(--adm-accent)" }}>{card.title}</span>
              </h3>
              <span className="admin-badge admin-badge-gold">{card.id}</span>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--adm-card-border)",
                  flexShrink: 0,
                  background: "#000",
                }}
              >
                <img
                  src={card.cover}
                  alt={card.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div className="admin-form-group" style={{ marginBottom: "10px" }}>
                  <label className="admin-label">Card Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={card.title}
                    onChange={(e) => handleCardChange(idx, "title", e.target.value)}
                  />
                </div>

                <div className="admin-form-group" style={{ marginBottom: "10px" }}>
                  <label className="admin-label">Target Page Route</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={card.path}
                    onChange={(e) => handleCardChange(idx, "path", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Short Description</label>
              <textarea
                className="admin-textarea"
                style={{ minHeight: "60px" }}
                value={card.desc}
                onChange={(e) => handleCardChange(idx, "desc", e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Cover Image Path</label>
              <input
                type="text"
                className="admin-input"
                value={card.cover}
                onChange={(e) => handleCardChange(idx, "cover", e.target.value)}
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Upload New Cover Image</label>
              <ImageUploader
                label="Browse & Upload Cover"
                hint="Auto-sets card cover"
                compact={false}
                onUploadSuccess={(url) => {
                  handleCardChange(idx, "cover", url);
                  showToast("Card cover image updated!");
                }}
                onError={(err) => showToast(err, "error")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

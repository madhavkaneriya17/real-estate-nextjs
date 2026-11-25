"use client";

import React, { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content-manager";

export default function AdminContactPage() {
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

  const handleGeneralChange = (field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      general: {
        ...content.general,
        [field]: value,
      },
    });
  };

  const handleContactChange = (field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      general: {
        ...content.general,
        contact: {
          ...content.general.contact,
          [field]: value,
        },
      },
    });
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

      showToast("Contact & Global details updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return <div style={{ color: "var(--adm-text-muted)" }}>Loading Contact details...</div>;
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
          <h2 style={{ fontSize: "20px", margin: "0 0 6px", color: "#ffffff" }}>Contact & Brand Settings</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--adm-text-muted)" }}>
            Update agency contact channels (Email, Phone, WhatsApp) and branding logos.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary">
          <span>💾</span>
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      <div className="admin-grid-2">
        {/* Contact Channels */}
        <div className="admin-card">
          <h3 className="admin-card__title">Agency Contact Details</h3>
          <p className="admin-card__desc">Displayed on /contact page and footer links.</p>

          <div className="admin-form-group">
            <label className="admin-label">Official Office Email</label>
            <input
              type="email"
              className="admin-input"
              value={content.general.contact.email}
              onChange={(e) => handleContactChange("email", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Official Phone Number</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.contact.phone}
              onChange={(e) => handleContactChange("phone", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">WhatsApp Number (with country code)</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.contact.whatsapp}
              onChange={(e) => handleContactChange("whatsapp", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Office Destination Locations</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.contact.address}
              onChange={(e) => handleContactChange("address", e.target.value)}
            />
          </div>
        </div>

        {/* Global Brand Settings */}
        <div className="admin-card">
          <h3 className="admin-card__title">Brand & Copyright</h3>
          <p className="admin-card__desc">Sitewide brand identification values.</p>

          <div className="admin-form-group">
            <label className="admin-label">Brand Name</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.siteName}
              onChange={(e) => handleGeneralChange("siteName", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Footer Copyright Text</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.copyright}
              onChange={(e) => handleGeneralChange("copyright", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Dark Navy Logo Path</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.logoUrl}
              onChange={(e) => handleGeneralChange("logoUrl", e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">White Transparent Logo Path</label>
            <input
              type="text"
              className="admin-input"
              value={content.general.whiteLogoUrl}
              onChange={(e) => handleGeneralChange("whiteLogoUrl", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

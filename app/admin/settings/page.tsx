"use client";

import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }

    if (newPassword.length < 4) {
      showToast("New password must be at least 4 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      showToast("Admin password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating password";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 style={{ fontSize: "20px", margin: "0 0 6px", color: "#ffffff" }}>Security & Settings</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--adm-text-muted)" }}>
            Change administrative password and manage system access credentials.
          </p>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Left Column: Password Update Form */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <h3 className="admin-card__title">
                <span>🔑 Change Admin Password</span>
              </h3>
              <p className="admin-card__desc">
                Set a new password for future access to the PROPVISTA admin panel.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="admin-form-group">
              <label className="admin-label">Current Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="Enter current password (default: admin123)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">New Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Confirm New Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary"
              >
                <span>💾</span>
                <span>{loading ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security Information */}
        <div>
          <div className="admin-card">
            <h3 className="admin-card__title">
              <span>🛡️ Security Information</span>
            </h3>
            <p className="admin-card__desc">How administrative authentication is protected.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--adm-input-bg)",
                  border: "1px solid var(--adm-card-border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                  Storage Location
                </div>
                <div style={{ color: "var(--adm-text-muted)" }}>
                  Password is saved securely in local configuration <code>data/admin-config.json</code>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--adm-input-bg)",
                  border: "1px solid var(--adm-card-border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                  Cookie Security
                </div>
                <div style={{ color: "var(--adm-text-muted)" }}>
                  Sessions are maintained via HTTP-only sameSite cookies expiring after 7 days.
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(197, 168, 128, 0.08)",
                  border: "1px solid rgba(197, 168, 128, 0.2)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--adm-accent)", marginBottom: "4px" }}>
                  💡 Pro-tip
                </div>
                <div style={{ color: "var(--adm-text-muted)" }}>
                  Keep your password memorable or note it down safely. If forgotten, you can always inspect or reset it in <code>data/admin-config.json</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

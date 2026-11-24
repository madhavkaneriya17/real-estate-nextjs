"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // If server returns HTML (e.g. 502/404 during Netlify deploy)
      }

      if (!res.ok) {
        throw new Error(
          data?.error || `Authentication failed (${res.status}): Please check credentials.`
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <div className="admin-sidebar__logo">P</div>
        <h1 className="admin-login-title">PROPVISTA Admin</h1>
        <p className="admin-login-subtitle">
          Enter administrative password to manage real estate contents
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group" style={{ textAlign: "left" }}>
            <label className="admin-label" htmlFor="password">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              className="admin-input"
              placeholder="admin123 or Madhav@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: "100%", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "var(--adm-text-dim)",
          }}
        >
          Default PIN/Password: <strong style={{ color: "var(--adm-accent)" }}>admin123</strong> or <strong style={{ color: "var(--adm-accent)" }}>Madhav@123</strong>
        </p>
      </div>
    </div>
  );
}

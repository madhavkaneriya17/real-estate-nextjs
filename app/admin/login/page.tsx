"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password flow state: "login" | "email" | "otp" | "reset"
  const [mode, setMode] = useState<"login" | "email" | "otp" | "reset">("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const rawText = await res.text();
      let data: { error?: string } | null = null;
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send OTP");
      setSuccessMsg(data.message || "OTP sent to your email!");
      setMode("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid OTP");
      setMode("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to reset password");
      setSuccessMsg(data.message || "Password reset successfully! Please sign in.");
      setMode("login");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "email" | "otp" | "reset") => {
    setError(null);
    setSuccessMsg(null);
    setMode(newMode);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <div className="admin-sidebar__logo">P</div>
        <h1 className="admin-login-title">PROPVISTA Admin</h1>
        <p className="admin-login-subtitle">
          {mode === "login" && "Enter administrative password to manage real estate contents"}
          {mode === "email" && "Enter your admin email to receive a 6-digit reset OTP"}
          {mode === "otp" && `Enter the 6-digit OTP sent to ${email}`}
          {mode === "reset" && "Create a new password for your admin account"}
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

        {successMsg && (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#86efac",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {successMsg}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="admin-label" htmlFor="password" style={{ marginBottom: 0 }}>
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("email")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--adm-accent)",
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
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
        )}

        {mode === "email" && (
          <form onSubmit={handleSendOtp}>
            <div className="admin-form-group" style={{ textAlign: "left" }}>
              <label className="admin-label" htmlFor="reset-email">
                Admin Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                className="admin-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending OTP..." : "Send 6-Digit OTP"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                width: "100%",
                marginTop: "12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--adm-text-dim)",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {mode === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <div className="admin-form-group" style={{ textAlign: "left" }}>
              <label className="admin-label" htmlFor="reset-otp">
                6-Digit OTP Code
              </label>
              <input
                id="reset-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="admin-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                style={{ letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ width: "100%", marginTop: "10px" }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("email")}
              style={{
                width: "100%",
                marginTop: "12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--adm-text-dim)",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Resend / Change Email
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div className="admin-form-group" style={{ textAlign: "left" }}>
              <label className="admin-label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="admin-input"
                placeholder="Minimum 4 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="admin-form-group" style={{ textAlign: "left" }}>
              <label className="admin-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="admin-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ width: "100%", marginTop: "10px" }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save New Password"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                width: "100%",
                marginTop: "12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--adm-text-dim)",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        )}

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

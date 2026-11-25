"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [isAuthed, setIsAuthed] = useState<boolean | null>(() => (isLoginPage ? true : null));

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setIsAuthed(true);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (isLoginPage) {
    return <div className="admin-root">{children}</div>;
  }

  if (isAuthed === null) {
    return (
      <div
        className="admin-root"
        style={{
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "var(--adm-text-muted)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(197, 168, 128, 0.2)",
              borderTopColor: "var(--adm-accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Loading Admin Dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/hero", label: "Homepage Content", icon: "🏠" },
    { href: "/admin/categories", label: "Category Pages (4)", icon: "🏛️" },
    { href: "/admin/selection", label: "Selection Cards", icon: "🗂️" },
    { href: "/admin/contact", label: "Contact & WhatsApp", icon: "📞" },
    { href: "/admin/media", label: "Media Library", icon: "🖼️" },
    { href: "/admin/settings", label: "Admin Password", icon: "🔑" },
  ];

  return (
    <div className="admin-root">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">P</div>
          <div className="admin-sidebar__brand-text">
            <h2>PROPVISTA</h2>
            <span>Content Manager</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <div className="admin-sidebar__section-label">General Management</div>
          {navLinks.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="admin-sidebar__section-label" style={{ marginTop: "16px" }}>
            Direct Category Links
          </div>
          <Link
            href="/admin/categories/coastal-haven"
            className={`admin-nav-item ${pathname.includes("coastal-haven") ? "active" : ""}`}
            style={{ fontSize: "12.5px" }}
          >
            <span>🌊</span>
            <span>Coastal Haven</span>
          </Link>
          <Link
            href="/admin/categories/serene-greens"
            className={`admin-nav-item ${pathname.includes("serene-greens") ? "active" : ""}`}
            style={{ fontSize: "12.5px" }}
          >
            <span>🌲</span>
            <span>Serene Greens</span>
          </Link>
          <Link
            href="/admin/categories/urban-luxe"
            className={`admin-nav-item ${pathname.includes("urban-luxe") ? "active" : ""}`}
            style={{ fontSize: "12.5px" }}
          >
            <span>🏙️</span>
            <span>Urban Luxe</span>
          </Link>
          <Link
            href="/admin/categories/limited-edition"
            className={`admin-nav-item ${pathname.includes("limited-edition") ? "active" : ""}`}
            style={{ fontSize: "12.5px" }}
          >
            <span>💎</span>
            <span>Limited Edition</span>
          </Link>
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" target="_blank" className="admin-btn-live" style={{ justifyContent: "center" }}>
            <span>↗</span>
            <span>View Live Site</span>
          </Link>
          <button onClick={handleLogout} className="admin-btn-logout">
            <span>🔒</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar__title">
            {pathname === "/admin"
              ? "Dashboard Overview"
              : pathname.replace("/admin/", "").replace("-", " ").toUpperCase()}
          </h1>

          <div className="admin-topbar__actions">
            <span className="admin-badge admin-badge-green">● Local JSON Synced</span>
            <Link href="/" target="_blank" className="admin-btn-live">
              <span>View Website</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        <main className="admin-content-body">{children}</main>
      </div>
    </div>
  );
}

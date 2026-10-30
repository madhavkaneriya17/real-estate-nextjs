"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import NavigationMenu from "@/components/NavigationMenu";

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".site-header",
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        "main > *",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="viewport-root"
      style={{
        minHeight: "100vh",
        backgroundColor: "#161317",
        color: "#ffffff",
        position: "relative",
      }}
    >
      {/* === Site Header START === */}
      <header
        className="site-header"
        style={{
          padding: "2rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          className="nav-link"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "0.875rem",
            letterSpacing: "0.08em",
          }}
        >
          Home
        </Link>
        <div className="site-logo">
          <Link href="/" aria-label="Realevate Homepage">
            <img
              src="/assets/realevate-white-logo.svg"
              alt="REALEVATE"
              style={{ height: "28px" }}
            />
          </Link>
        </div>
        <Link
          href="/about"
          className="nav-link"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "0.875rem",
            letterSpacing: "0.08em",
          }}
        >
          About
        </Link>
      </header>
      {/* === Site Header END === */}

      {/* === Contact Connect Section START === */}
      <main
        style={{
          maxWidth: "800px",
          margin: "5rem auto",
          padding: "0 2rem",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8a96b4",
            display: "block",
            marginBottom: "1.5rem",
          }}
        >
          Get in Touch
        </span>
        <h1
          style={{
            fontFamily: "var(--display-font, serif)",
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            fontWeight: 300,
            lineHeight: 1.15,
            marginBottom: "2rem",
          }}
        >
          Let&apos;s Connect
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.8,
            color: "#c5cbdb",
            marginBottom: "3.5rem",
          }}
        >
          Our boutique real estate advisors are ready to guide your investment or
          home purchase across Cyprus, Montenegro, and Georgia.
        </p>

        {/* === Contact Channels Action Buttons START === */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "4rem",
          }}
        >
          <a
            href="https://wa.me/972546020690"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem 2.2rem",
              backgroundColor: "#25D366",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
          >
            Chat on WhatsApp
          </a>

          <a
            href="mailto:info@realevate.agency"
            style={{
              padding: "1rem 2.2rem",
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.25)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
          >
            Send Email
          </a>
        </div>
        {/* === Contact Channels Action Buttons END === */}
      </main>
      {/* === Contact Connect Section END === */}

      {/* === Navigation Menu START === */}
      <NavigationMenu theme="light" panelBg="#2D1C2D" />
      {/* === Navigation Menu END === */}
    </div>
  );
}

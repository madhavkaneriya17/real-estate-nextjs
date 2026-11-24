"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useInteractions } from "../lib/interactions";
import gsap from "gsap";
import NavigationMenu from "@/components/NavigationMenu";
import { animatePriceBadgeBorder } from "@/lib/category-transitions";
import { useSiteContent } from "@/lib/use-site-content";

export default function Home() {
  const { content } = useSiteContent();
  const {
    isSelectionOpen,
    setIsSelectionOpen,
    isMenuOpen,
    setIsMenuOpen,
  } = useInteractions();

  const handleCardClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetPath: string
  ) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("expand_from_dock", "true");
    }
  };

  const heroVisualRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let played = false;
    let ctx: gsap.Context | null = null;

    const playIntro = () => {
      if (played) return;
      played = true;

      ctx = gsap.context(() => {
        gsap.fromTo(
          ".marquee-track",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out", delay: 0.25 }
        );
        gsap.fromTo(
          heroContentRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.35 }
        );
        const badge = heroContentRef.current?.querySelector(".hero-price-badge");
        if (badge) {
          animatePriceBadgeBorder(badge, { delay: 0.5 });
        }
      });
    };

    window.addEventListener("site-preloader-exit", playIntro);
    const timer = setTimeout(playIntro, 3500);

    return () => {
      window.removeEventListener("site-preloader-exit", playIntro);
      clearTimeout(timer);
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (isSelectionOpen) {
      gsap.fromTo(
        ".selection-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.1,
          overwrite: "auto",
        }
      );
    }
  }, [isSelectionOpen]);

  return (
    <div className="viewport-root">
      {/* === Selection Overlay Section START === */}
      <section
        className={`selection-container ${isSelectionOpen ? "visible" : ""}`}
        aria-label="Our selection"
      >
        <div className="selection-cards-grid">
          {content.selectionCards.map((card) => (
            <Link
              key={card.id}
              href={`${card.path}?from=dock`}
              className="selection-card"
              data-category={card.id}
              onClick={(e) => handleCardClick(e, card.path)}
            >
              <div className="selection-card__panel">
                <img
                  className="selection-card__symbol"
                  src={card.symbol || "/assets/small_logo.png"}
                  alt=""
                  aria-hidden="true"
                />
                <span className="selection-card__title">{card.title}</span>
                <span className="selection-card__desc">{card.desc}</span>
              </div>
              <div className="selection-card__cover">
                <img
                  src={card.cover}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* === Selection Overlay Section END === */}

      {/* === Hero Stage Section START === */}
      <main
        className={`hero-stage ${isSelectionOpen ? "is-docked" : ""}`}
        onClick={() => {
          if (isSelectionOpen) setIsSelectionOpen(false);
        }}
        aria-label="Hero Homepage"
      >
        <div className="hero-grid">
          {/* === Site Header START === */}
          <header className="site-header">
            <Link href="/about" className="nav-link">
              About
            </Link>

            <div className="site-logo">
              <Link href="/" aria-label="PROPVISTA Homepage">
                <img
                  src={content.general.logoUrl || "/assets/main-logo-blue.svg"}
                  alt={content.general.siteName || "PROPVISTA"}
                />
              </Link>
            </div>

            <Link href="/contact" className="nav-link">
              Contact
            </Link>
          </header>
          {/* === Site Header END === */}

          {/* === Hero Body START === */}
          <div className="hero-body">
            {/* === Marquee Background Track START === */}
            <div className="marquee-container" aria-hidden="true">
              <div className="marquee-track">
                {content.hero.marqueeItems.map((item, idx) => (
                  <span key={idx} className="marquee-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {/* === Marquee Background Track END === */}

            {/* === Hero Center Visual START === */}
            <div ref={heroVisualRef} className="hero-visual-wrapper">
              <img
                src={content.hero.heroImage || "/assets/hero-load-visual.avif"}
                alt={content.hero.heroImageAlt || "Balcony overlooking coastal Montenegro"}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            {/* === Hero Center Visual END === */}

            {/* === Hero Content START === */}
            <div ref={heroContentRef} className="hero-content-unclickable" aria-hidden="true">
              <h1 className="hero-tagline">{content.hero.tagline}</h1>
              <div className="hero-price-badge">{content.hero.priceBadge}</div>
            </div>
            {/* === Hero Content END === */}
          </div>
          {/* === Hero Body END === */}
        </div>
      </main>
      {/* === Hero Stage Section END === */}

      {/* === Site Footer Bar START === */}
      <footer className="site-footer">
        <span className="footer-copyright">{content.general.copyright || "Realevate® 2026"}</span>

        <div
          className="footer-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="our-selection-btn"
            onClick={() => setIsSelectionOpen(!isSelectionOpen)}
            aria-label="Toggle Our Selection"
          >
            <span>{isSelectionOpen ? "Close Selection" : "Our Selection"}</span>
            <svg
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
            >
              <rect width="4" height="4" fill="currentColor" />
              <rect x="9" width="4" height="4" fill="currentColor" />
              <rect y="9" width="4" height="4" fill="currentColor" />
              <rect x="9" y="9" width="4" height="4" fill="currentColor" />
            </svg>
          </button>

          <button
            type="button"
            className="menu-toggle-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              width="23"
              height="12"
              viewBox="0 0 23 12"
              fill="none"
              aria-hidden="true"
            >
              <rect width="23" height="3" fill="currentColor" />
              <rect className="menu-btn-line-bottom" y="9" width="10" height="3" fill="currentColor" />
            </svg>
          </button>
        </div>
      </footer>
      {/* === Site Footer Bar END === */}

      {/* === Navigation Menu Drawer START === */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        showFloatingButton={false}
        panelBg="#1F2B5E"
        textColor="#FFFFFF"
        backdropBg="rgba(142, 154, 185, 0.5)"
      />
      {/* === Navigation Menu Drawer END === */}
    </div>
  );
}
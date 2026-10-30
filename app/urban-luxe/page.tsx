"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./urban-luxe.css";
import CategoryGallery, {
  URBAN_LUXE_GALLERY_SLIDES,
} from "@/components/CategoryGallery";
import WhyInvestSection from "@/components/WhyInvestSection";
import NavigationMenu from "@/components/NavigationMenu";
import {
  initHeroParallax,
  initBackgroundParallax,
  initSelectionCardsReveal,
  initNextCategoryScrollRedirect,
} from "./urban-luxe-scripts";
import { useInteractions } from "@/lib/interactions";

export default function UrbanLuxePage() {
  const router = useRouter();
  const {
    isSelectionOpen,
    setIsSelectionOpen,
    isDockActive,
    isOpeningFromDock,
    dockScrollY,
    pageHeight,
    toggleSelection,
    closeSelection,
    isMenuOpen,
    setIsMenuOpen,
  } = useInteractions({ enableWheelDock: false });

  const handleSelectionCardClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetPath: string
  ) => {
    if (targetPath === "/urban-luxe") {
      e.preventDefault();
      closeSelection();
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("expand_from_dock", "true");
    }
  };

  const [isZoomed, setIsZoomed] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLElement>(null);


  useEffect(() => {
    const cleanup = initHeroParallax({
      heroTrackRef,
      visualRef,
      headerRef,
      marqueeRef,
      contentRef,
      scrollHintRef,
      containerRef,
      setIsZoomed,
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (!isDockActive) {
      requestAnimationFrame(() => {
        if (typeof window !== "undefined") {
          import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
            ScrollTrigger.refresh();
          });
        }
      });
    }
  }, [isDockActive]);

  useEffect(() => {
    const cleanup = initBackgroundParallax(containerRef.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (isOpeningFromDock) return;
    initSelectionCardsReveal(isSelectionOpen);
  }, [isSelectionOpen, isOpeningFromDock]);

  useEffect(() => {
    const cleanup = initNextCategoryScrollRedirect({
      sectionSelector: ".move-next-category",
      indicatorSelector: ".next-category-scroll-indicator",
      targetUrl: "/limited-edition",
      onRedirect: () => {
        router.push("/limited-edition");
      },
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [router]);

  useEffect(() => {
    const checkCtaNear = () => {
      const ctaEl = ctaRef.current || document.querySelector<HTMLElement>(".cta-main");
      if (!ctaEl) return;
      const rect = ctaEl.getBoundingClientRect();
      const isNear = rect.top <= window.innerHeight + 100;
      setIsCtaVisible((prev) => (prev !== isNear ? isNear : prev));
    };

    window.addEventListener("scroll", checkCtaNear, { passive: true });
    window.addEventListener("resize", checkCtaNear, { passive: true });
    checkCtaNear();

    let observer: IntersectionObserver | null = null;
    const ctaEl = ctaRef.current || document.querySelector<HTMLElement>(".cta-main");
    if (ctaEl && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const isNear = entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 100;
          setIsCtaVisible((prev) => (prev !== isNear ? isNear : prev));
        },
        {
          rootMargin: "0px 0px 100px 0px",
        }
      );
      observer.observe(ctaEl);
    }

    return () => {
      window.removeEventListener("scroll", checkCtaNear);
      window.removeEventListener("resize", checkCtaNear);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="about-viewport-root urban-luxe-page"
      style={{
        ["--about-bg" as string]: "#2D1C2D",
        ["--about-text" as string]: "#FFFFFF",
        ["--category-color" as string]: "#2D1C2D",
        ["--category-color-muted" as string]: "#6B5A6B",
        ["--gallery-bg" as string]: "#FFFFFF",
        ["--gallery-text" as string]: "#2D1C2D",
        ["--gallery-subtext" as string]: "#6B5A6B",
        ...(isDockActive ? { minHeight: `${pageHeight}px` } : {}),
      }}
    >
      {/* === Selection Overlay START === */}
      <section
        className={`selection-container ${isSelectionOpen || isOpeningFromDock ? "visible" : ""}`}
        aria-label="Our selection"
      >
        <div className="selection-cards-grid">
          <Link
            href="/coastal-haven?from=dock"
            className="selection-card"
            data-category="coastal-haven"
            onClick={(e) => handleSelectionCardClick(e, "/coastal-haven")}
          >
            <div className="selection-card__panel">
              <img
                className="selection-card__symbol"
                src="/assets/small_logo.png"
                alt=""
                aria-hidden="true"
              />
              <span className="selection-card__title">Coastal Haven</span>
              <span className="selection-card__desc">
                Coastal, Marina &amp; Seafront properties
              </span>
            </div>
            <div className="selection-card__cover">
              <img
                src="/assets/bythesea-card-cover.avif"
                alt="Coastal Haven"
                loading="lazy"
              />
            </div>
          </Link>

          <Link
            href="/serene-greens?from=dock"
            className="selection-card"
            data-category="serene-greens"
            onClick={(e) => handleSelectionCardClick(e, "/serene-greens")}
          >
            <div className="selection-card__panel">
              <img
                className="selection-card__symbol"
                src="/assets/small_logo.png"
                alt=""
                aria-hidden="true"
              />
              <span className="selection-card__title">Serene Greens</span>
              <span className="selection-card__desc">
                Gulf Resorts, parks &amp; Forest Oasis
              </span>
            </div>
            <div className="selection-card__cover">
              <img
                src="/assets/evergreen-card-cover.avif"
                alt="Serene Greens"
                loading="lazy"
              />
            </div>
          </Link>

          <Link
            href="/urban-luxe?from=dock"
            className="selection-card"
            data-category="urban-luxe"
            onClick={(e) => handleSelectionCardClick(e, "/urban-luxe")}
          >
            <div className="selection-card__panel">
              <img
                className="selection-card__symbol"
                src="/assets/small_logo.png"
                alt=""
                aria-hidden="true"
              />
              <span className="selection-card__title">Urban Luxe</span>
              <span className="selection-card__desc">
                City center &amp; Old city vibes and lifestyle
              </span>
            </div>
            <div className="selection-card__cover">
              <img
                src="/assets/urban-living-card-cover.avif"
                alt="Urban Luxe"
                loading="lazy"
              />
            </div>
          </Link>

          <Link
            href="/limited-edition?from=dock"
            className="selection-card"
            data-category="limited-edition"
            onClick={(e) => handleSelectionCardClick(e, "/limited-edition")}
          >
            <div className="selection-card__panel">
              <img
                className="selection-card__symbol"
                src="/assets/small_logo.png"
                alt=""
                aria-hidden="true"
              />
              <span className="selection-card__title">Limited Edition</span>
              <span className="selection-card__desc">
                One of a kind &amp; Unique concept Properties
              </span>
            </div>
            <div className="selection-card__cover">
              <img
                src="/assets/rare-gems-card-cover.avif"
                alt="Limited Edition"
                loading="lazy"
              />
            </div>
          </Link>
        </div>
      </section>
      {/* === Selection Overlay END === */}

      {/* === Main Page Stage START === */}
      <main
        className={`about-page-wrapper ${isZoomed ? "is-zoomed" : ""} ${isDockActive ? "is-dock-active" : ""} ${isSelectionOpen || isOpeningFromDock ? "is-docked" : ""}`}
        style={
          {
            "--about-bg": "#2D1C2D",
            "--about-text": "#FFFFFF",
          } as React.CSSProperties
        }
        onClick={() => {
          if (isSelectionOpen || isOpeningFromDock) closeSelection();
        }}
      >
        <div
          className="about-page-scroll-content"
          style={
            isDockActive
              ? {
                transform: `translateY(-${dockScrollY}px)`,
              }
              : undefined
          }
        >
          {/* === Hero Section (GSAP ScrollTrigger Track) START === */}
          <div ref={heroTrackRef} className="about-hero-track">
            <div className="hero-sticky-stage">
              {/* === Header START === */}
              <header ref={headerRef} className="about-header">
                <Link href="/about" className="about-nav-link">
                  About
                </Link>

                <div className="about-logo">
                  <Link href="/" aria-label="Homepage">
                    <img
                      src="/assets/main-logo.svg"
                      alt="PROPVISTA"
                    />
                  </Link>
                </div>

                <Link href="/contact" className="about-nav-link">
                  Contact
                </Link>
              </header>
              {/* === Header END === */}

              {/* === Hero Marquee START === */}
              <div
                ref={marqueeRef}
                className="about-marquee-container"
                aria-hidden="true"
              >
                <div className="about-marquee-track">
                  <span className="about-marquee-item">Urban Luxe</span>
                  <span className="about-marquee-item">Urban Luxe</span>
                  <span className="about-marquee-item">Urban Luxe</span>
                  <span className="about-marquee-item">Urban Luxe</span>
                  <span className="about-marquee-item">Urban Luxe</span>
                  <span className="about-marquee-item">Urban Luxe</span>
                </div>
              </div>
              {/* === Hero Marquee END === */}

              {/* === Hero Center Visual START === */}
              <div ref={visualRef} className="about-visual-wrapper">
                <img
                  src="/assets/urban-living-card-cover.avif"
                  alt="Urban Luxe"
                  fetchPriority="high"
                  decoding="sync"
                />
              </div>
              {/* === Hero Center Visual END === */}

              {/* === Hero Content START === */}
              <div ref={contentRef} className="about-content">
                <h1 className="about-tagline">
                  Apartments &amp; Hotel residences near the city center, downtown and touristic areas
                </h1>
                <div className="about-price-badge">STARTING FROM 350,000€</div>
              </div>
              {/* === Hero Content END === */}
            </div>
          </div>
          {/* === Hero Section (GSAP ScrollTrigger Track) END === */}

          {/* === Category Gallery Section START === */}
          <CategoryGallery
            label="Urban Luxe"
            slides={URBAN_LUXE_GALLERY_SLIDES}
            title={
              <>
                Invest Where
                <br />
                City Living, Culture
                <br />
                &amp; Growth Meet
              </>
            }
            description="Live steps from shopping, fine dining, business hubs, and cultural attractions, combining everyday convenience with the comfort of modern city living."
          />
          {/* === Category Gallery Section END === */}

          {/* === Page Blog / Quote Section START === */}
          <section className="page-blog" aria-hidden="true">
            <div className="marq-wrapper">
              <div className="marq-track">
                <span className="marq-text">Urban Luxe</span>
                <span className="marq-text">Urban Luxe</span>
                <span className="marq-text">Urban Luxe</span>
                <span className="marq-text">Urban Luxe</span>
              </div>
              <div className="marq-track" aria-hidden="true">
                <span className="marq-text">Urban Luxe</span>
                <span className="marq-text">Urban Luxe</span>
                <span className="marq-text">Urban Luxe</span>
                <span className="marq-text">Urban Luxe</span>
              </div>
            </div>

            <div className="page-blog-bottom">
              <figure className="blog-img">
                <img src="/assets/selection/urbanliving/square-urban-living.avif" alt="Urban Luxe" />
              </figure>

              <h2>
                “Vibrant centers are places where people can live, work, shop, dine, play, rest, and learn.”
              </h2>

              <div className="blog-bottom-line">
                <p className="blog-bottom-line-1">Urban Land Institute</p>
                <p className="blog-bottom-line-2">/ Making Downtowns What They Used to Be / 2015 </p>
              </div>
            </div>
          </section>
          {/* === Page Blog / Quote Section END === */}

          {/* === Background Parallax Section (1) START === */}
          <section className="background-image-parallax category-parallax">
            <div className="background-image-parallax-inner category-parallax__viewport">
              <img src="/assets/selection/urbanliving/urban-living-second-intro.avif" alt="Urban destination" />
            </div>
          </section>
          {/* === Background Parallax Section (1) END === */}

          {/* === Why Invest Section START === */}
          <WhyInvestSection />
          {/* === Why Invest Section END === */}

          {/* === Background Parallax Section (2) START === */}
          <section className="background-image-parallax category-parallax">
            <div className="background-image-parallax-inner category-parallax__viewport">
              <img src="/assets/selection/urbanliving/urban-living-third-intro_converted.avif" alt="Urban destination" />
            </div>
          </section>
          {/* === Background Parallax Section (2) END === */}

          {/* === CTA Section START === */}
          <section ref={ctaRef} className="cta-main">
            <div className="cta-inner">
              <span className="cta-street-line"></span>
              <h2>
                <div className="cta-text">Start Your Urban </div>
                <div className="cta-text">Living Life</div>
              </h2>
              <h4 className="cta-link">
                <a href="#">Speak With Us
                  <img src="https://realevate.agency/assets/arrow.svg" alt="" />
                </a>
              </h4>
            </div>
          </section>
          {/* === CTA Section END === */}

          {/* === Next Category Section START === */}
          <section className="move-next-category">
            <div
              className="next-category-scroll-indicator"
              role="button"
              tabIndex={0}
              aria-label="Scroll to next category"
            >
              <svg className="next-category-scroll-svg" viewBox="0 0 100 100">
                <circle className="next-category-scroll-track" cx="50" cy="50" r="46" />
                <circle className="next-category-scroll-bar" cx="50" cy="50" r="46" />
              </svg>
              <span className="next-category-scroll-label">Scroll</span>
            </div>

            <Link href="/limited-edition" className="move-next-category-link">
              <div className="move-next-category-image">
                <div className="move-next-category-image-wrapper">
                  <img
                    src="/assets/selection/raregems/limited-edition-hero-cover-4k.jpg"
                    alt="Limited Edition"
                  />
                  <div className="move-next-category-overlay" />
                </div>
              </div>

              <div className="move-next-category-content">
                <span className="move-next-category-badge">Next</span>
                <h2 className="move-next-category-title">Limited Edition</h2>
                <p className="move-next-category-subtitle">
                  One of a kind &amp; Unique concept Properties
                </p>
              </div>
            </Link>
          </section>
          {/* === Next Category Section END === */}
        </div>
      </main>
      {/* === Main Page Stage END === */}

      {/* === Fixed Footer Actions START === */}
      <footer className="about-fixed-footer">
        <span
          ref={scrollHintRef}
          className="about-scroll-hint"
          style={{ opacity: isSelectionOpen ? 0 : undefined }}
        >
          (Scroll)
        </span>

        <div className={`about-footer-actions ${isSelectionOpen || isDockActive || isCtaVisible ? "is-hidden" : ""}`}>
          <button
            type="button"
            className={`about-selection-btn ${isZoomed || isSelectionOpen ? "is-zoomed" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSelection();
            }}
            aria-label="Toggle Our Selection"
          >
            <span>{isSelectionOpen ? "Close Selection" : "Our Selection"}</span>
            <svg viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <rect width="4" height="4" fill="currentColor" />
              <rect x="9" width="4" height="4" fill="currentColor" />
              <rect y="9" width="4" height="4" fill="currentColor" />
              <rect x="9" y="9" width="4" height="4" fill="currentColor" />
            </svg>
          </button>

          <button
            type="button"
            className={`about-menu-toggle-btn ${isZoomed || isSelectionOpen ? "is-zoomed" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(true);
            }}
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
              <rect className="menu-btn-line-top" width="23" height="3" fill="currentColor" />
              <rect className="menu-btn-line-bottom" y="9" width="10" height="3" fill="currentColor" />
            </svg>
          </button>
        </div>
      </footer>
      {/* === Fixed Footer Actions END === */}

      {/* === Navigation Menu Drawer START === */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        showFloatingButton={false}
        panelBg="#2D1C2D"
      />
      {/* === Navigation Menu Drawer END === */}
    </div>
  );
}

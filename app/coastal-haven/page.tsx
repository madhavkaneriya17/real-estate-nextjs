"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./coastal-haven.css";
import CategoryGallery, {
  COASTAL_HAVEN_GALLERY_SLIDES,
} from "@/components/CategoryGallery";
import WhyInvestSection, {
  WhyInvestItem,
  WhyInvestQuote,
} from "@/components/WhyInvestSection";
import NavigationMenu from "@/components/NavigationMenu";
import {
  initHeroParallax,
  initBackgroundParallax,
  initSelectionCardsReveal,
  initNextCategoryScrollRedirect,
} from "./coastal-haven-scripts";
import { useInteractions } from "@/lib/interactions";

// =========================================================================
// WHY INVEST SECTION: ASSETS & CONTENT (Page-Specific for Coastal Haven)
// =========================================================================
const WHY_INVEST_ITEMS: WhyInvestItem[] = [
  {
    imageSrc: "/assets/selection/bythesea/coastal-luxury-pool-view.jpg",
    imageAlt: "Frontline Scarcity waterfront villa pool overlooking the bay",
    title: (
      <>
        Frontline
        <br />
        Scarcity
      </>
    ),
    text: "Frontline coastal land is naturally strictly finite. With global demand at an all-time peak, prime beachfront assets command unprecedented resilience and uninterrupted long-term capital preservation.",
    reverse: false,
  },
  {
    imageSrc: "/assets/women-montenegro.avif",
    imageAlt: "Proven Price Premiums for luxury coastal residences",
    title: (
      <>
        Unmatched
        <br />
        Premiums
      </>
    ),
    text: "Global luxury indices show waterfront homes consistently command price premiums of 40% to 76% over comparable inland properties, dramatically outperforming standard market cycles.",
    reverse: true,
  },
  {
    imageSrc: "/assets/selection/bythesea/luxury-hotel-resort-4k.jpg",
    imageAlt: "Lucrative year-round rental yields in coastal destination",
    title: (
      <>
        Lucrative
        <br />
        Yields
      </>
    ),
    text: "Prime coastal destinations attract year-round international tourism and high-net-worth seasonal tenants, delivering double-digit net rental yields and premium occupancy rates.",
    reverse: false,
  },
  {
    imageSrc: "/assets/selection/bythesea/mediterranean-yachts-cove-4k.jpg",
    imageAlt: "Exclusive marina and yachting lifestyle",
    title: (
      <>
        Marina
        <br />
        Prestige
      </>
    ),
    text: "Direct access to superyacht berths, private beach clubs, and waterfront promenades creates an irreplaceable lifestyle that continuously attracts the world's most affluent investors.",
    reverse: true,
  },
  {
    imageSrc: "/assets/selection/bythesea/luxury-coastal-villa-view-4k.jpg",
    imageAlt: "Enduring liquidity and frontline sea view villa",
    title: (
      <>
        Enduring
        <br />
        Liquidity
      </>
    ),
    text: "Prime seaside properties consistently trade with the highest liquidity in luxury real estate, ensuring a seamless, high-confidence exit strategy for discerning investors.",
    reverse: false,
  },
];

const WHY_INVEST_QUOTE: WhyInvestQuote = {
  text: "Frontline waterfront real estate remains the gold standard of tangible wealth. Geographic scarcity guarantees value retention, while global lifestyle appeal delivers peerless liquidity in any market environment.",
  name: "Financial Times Wealth & Property",
  source: "/ International Waterfront Investments / 2025 Edition",
};

export default function CoastalHavenPage() {
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
    if (targetPath === "/coastal-haven") {
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
      targetUrl: "/serene-greens",
      onRedirect: () => {
        router.push("/serene-greens");
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
      className="about-viewport-root coastal-haven-page"
      style={{
        ["--about-bg" as string]: "#222A4C",
        ["--about-text" as string]: "#FFFFFF",
        ["--category-color" as string]: "#222A4C",
        ["--category-color-muted" as string]: "#5D668D",
        ["--gallery-bg" as string]: "#FFFFFF",
        ["--gallery-text" as string]: "#222A4C",
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
            "--about-bg": "#1F2B5E",
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
                  <span className="about-marquee-item">Coastal Haven</span>
                  <span className="about-marquee-item">Waterfront Residences</span>
                  <span className="about-marquee-item">Coastal Haven</span>
                  <span className="about-marquee-item">Private Marina Living</span>
                </div>
              </div>
              {/* === Hero Marquee END === */}

              {/* === Hero Center Visual START === */}
              <div ref={visualRef} className="about-visual-wrapper">
                <img
                  src="/assets/selection/bythesea/coastal-hero-cover.jpg"
                  alt="Coastal Haven Luxury Waterfront Residences"
                  fetchPriority="high"
                  decoding="sync"
                />
              </div>
              {/* === Hero Center Visual END === */}

              {/* === Hero Content START === */}
              <div ref={contentRef} className="about-content">
                <h1 className="about-tagline">
                  Prime Seafront Apartments &amp; Private Villas with Direct Access to Sun-Drenched Beaches and World-Class Marinas
                </h1>
                <div className="about-price-badge">STARTING FROM 280,000€</div>
              </div>
              {/* === Hero Content END === */}
            </div>
          </div>
          {/* === Hero Section (GSAP ScrollTrigger Track) END === */}

          {/* === Category Gallery Section START === */}
          <CategoryGallery
            label="Coastal Haven"
            slides={COASTAL_HAVEN_GALLERY_SLIDES}
            title={
              <>
                Invest Where
                <br />
                Coastal Serenity, Luxury
                <br />
                &amp; High Capital Yields Meet
              </>
            }
            description="Steps from turquoise shorelines, private yacht berths, and Michelin-starred seaside dining, combining the ultimate Mediterranean lifestyle with finite frontline capital appreciation."
          />
          {/* === Category Gallery Section END === */}

          {/* === Page Blog / Quote Section START === */}
          <section className="page-blog" aria-hidden="true">
            <div className="marq-wrapper">
              <div className="marq-track">
                <span className="marq-text">Coastal Haven</span>
                <span className="marq-text">Waterfront Prestige</span>
                <span className="marq-text">Coastal Haven</span>
                <span className="marq-text">Oceanfront Living</span>
              </div>
              <div className="marq-track" aria-hidden="true">
                <span className="marq-text">Coastal Haven</span>
                <span className="marq-text">Waterfront Prestige</span>
                <span className="marq-text">Coastal Haven</span>
                <span className="marq-text">Oceanfront Living</span>
              </div>
            </div>

            <div className="page-blog-bottom">
              <figure className="blog-img">
                <img src="/assets/selection/bythesea/coastal-ocean-waves.jpg" alt="Coastal Haven Waterfront Living" />
              </figure>

              <h2>
                “Finite coastlines and boundless international prestige make waterfront real estate the world's most resilient wealth preservation asset.”
              </h2>

              <div className="blog-bottom-line">
                <p className="blog-bottom-line-1">Savills Global Luxury Real Estate Research</p>
                <p className="blog-bottom-line-2">/ World Waterfront Index / 2025 Edition</p>
              </div>
            </div>
          </section>
          {/* === Page Blog / Quote Section END === */}

          {/* === Background Parallax Section (1) START === */}
          <section className="background-image-parallax category-parallax">
            <div className="background-image-parallax-inner category-parallax__viewport">
              <img src="/assets/selection/bythesea/coastal-parallax-one.jpg" alt="Panoramic Mediterranean shoreline and beachfront residences" />
            </div>
          </section>
          {/* === Background Parallax Section (1) END === */}

          {/* === Why Invest Section START === */}
          <WhyInvestSection
            items={WHY_INVEST_ITEMS}
            quote={WHY_INVEST_QUOTE}
          />
          {/* === Why Invest Section END === */}

          {/* === Background Parallax Section (2) START === */}
          <section className="background-image-parallax category-parallax">
            <div className="background-image-parallax-inner category-parallax__viewport">
              <img src="/assets/selection/bythesea/amalfi-coast-panoramic-4k.jpg" alt="Sun-drenched coastal cliffs and azure waters" />
            </div>
          </section>
          {/* === Background Parallax Section (2) END === */}

          {/* === CTA Section START === */}
          <section ref={ctaRef} className="cta-main">
            <div className="cta-inner">
              <span className="cta-street-line"></span>
              <h2>
                <div className="cta-text">Claim Your Sanctuary</div>
                <div className="cta-text">In Coastal Haven</div>
              </h2>
              <h4 className="cta-link">
                <a href="/contact">Inquire About Coastal Haven
                  <img src="/assets/arrow.svg" alt="" />
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

            <Link href="/serene-greens" className="move-next-category-link">
              <div className="move-next-category-image">
                <div className="move-next-category-image-wrapper">
                  <img
                    src="/assets/evergreen-card-cover.avif"
                    alt="Serene Greens"
                  />
                  <div className="move-next-category-overlay" />
                </div>
              </div>

              <div className="move-next-category-content">
                <span className="move-next-category-badge">Next</span>
                <h2 className="move-next-category-title">Serene Greens</h2>
                <p className="move-next-category-subtitle">
                  Gulf Resorts, parks &amp; Forest Oasis
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
        panelBg="#1F2B5E"
      />
      {/* === Navigation Menu Drawer END === */}
    </div>
  );
}

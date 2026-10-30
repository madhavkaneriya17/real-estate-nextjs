"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NavigationMenu from "@/components/NavigationMenu";
import { initWhyInvestParallax } from "@/components/WhyInvestSection/why-invest-parallax";
import { useInteractions } from "@/lib/interactions";
import {
  initNextCategoryScrollRedirect,
  initBackgroundParallax,
} from "@/app/urban-luxe/urban-luxe-scripts";
import "./about.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoStageRef = useRef<HTMLDivElement>(null);
  const videoAnchorRef = useRef<HTMLDivElement>(null);
  const videoVisualRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const scrollHintRef = useRef<HTMLSpanElement>(null);

  const {
    isSelectionOpen,
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("expand_from_dock", "true");
    }
  };

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(false);

  useEffect(() => {
    const cleanup = initNextCategoryScrollRedirect({
      sectionSelector: ".move-next-category",
      indicatorSelector: ".next-category-scroll-indicator",
      targetUrl: "/coastal-haven",
      onRedirect: () => {
        router.push("/coastal-haven");
      },
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [router]);

  useEffect(() => {
    if (isOpeningFromDock) return;
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
  }, [isSelectionOpen, isOpeningFromDock]);

  useEffect(() => {
    if (!isDockActive) {
      requestAnimationFrame(() => {
        if (typeof window !== "undefined") {
          ScrollTrigger.refresh();
        }
      });
    }
  }, [isDockActive]);

  // Scroll detection for isZoomed
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsZoomed(scrollY > 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // CTA proximity detection to hide footer dock
  useEffect(() => {
    const checkCtaNear = () => {
      const ctaEl = ctaRef.current || document.querySelector<HTMLElement>(".about-cta-section");
      if (!ctaEl) return;
      const rect = ctaEl.getBoundingClientRect();
      const isNear = rect.top <= window.innerHeight + 100;
      setIsCtaVisible((prev) => (prev !== isNear ? isNear : prev));
    };

    window.addEventListener("scroll", checkCtaNear, { passive: true });
    window.addEventListener("resize", checkCtaNear, { passive: true });
    checkCtaNear();

    return () => {
      window.removeEventListener("scroll", checkCtaNear);
      window.removeEventListener("resize", checkCtaNear);
    };
  }, []);

  // Background Parallax using standard engine
  useEffect(() => {
    const cleanup = initBackgroundParallax(containerRef.current || undefined);
    const cleanupValues = initWhyInvestParallax(containerRef.current || undefined);
    return () => {
      if (cleanup) cleanup();
      if (cleanupValues) cleanupValues();
    };
  }, []);

  // Scroll Expand Video Animation
  useEffect(() => {
    const stageEl = videoStageRef.current;
    const anchorEl = videoAnchorRef.current;
    const visualEl = videoVisualRef.current;
    if (!stageEl || !anchorEl || !visualEl) return;

    let isExpanded = false;

    const cleanupActiveStyles = () => {
      visualEl.classList.remove("about-video-visual--active");
      gsap.set(visualEl, {
        clearProps:
          "position,top,left,right,bottom,width,height,margin,zIndex,aspectRatio,maxWidth,maxHeight,overflow,clipPath,borderRadius,boxShadow",
      });
      isExpanded = false;
    };

    const applyProgress = (progress: number) => {
      const Z = Math.max(0, Math.min(1, progress));

      if (Z <= 0) {
        if (visualEl.classList.contains("about-video-visual--active")) {
          cleanupActiveStyles();
        }
        return;
      }

      const vw = window.visualViewport?.width || window.innerWidth;
      const vh = window.visualViewport?.height || window.innerHeight;
      const stageRect = stageEl.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();

      // Static start metrics in viewport coordinates at start: "bottom bottom"
      // At start, anchor bottom touches viewport bottom, so top is:
      const startViewportTop = vh - anchorRect.height;
      const startViewportLeft = anchorRect.left;
      const startWidth = anchorRect.width;
      const startHeight = anchorRect.height;

      const Q = Z;
      const Ne = 1 - (1 - Q) * (1 - Q); // Ease-out quadratic

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      let targetTop: number;
      if (Z >= 1) {
        // Pinned to the bottom of stageEl so it scrolls away naturally with stageEl
        targetTop = stageEl.offsetHeight - vh;
      } else {
        // Relative to stageEl: desired viewport top - stageRect.top
        targetTop = lerp(startViewportTop, 0, Ne) - stageRect.top;
      }

      const targetLeft = lerp(startViewportLeft, 0, Ne) - stageRect.left;
      const targetWidth = lerp(startWidth, vw, Q);
      const targetHeight = lerp(startHeight, vh, Q);
      const targetRadius = lerp(4, 0, Q);

      gsap.set(visualEl, {
        position: "absolute",
        top: targetTop,
        left: targetLeft,
        width: targetWidth,
        height: targetHeight,
        borderRadius: `${targetRadius}px`,
        margin: 0,
        zIndex: 50,
        aspectRatio: "unset",
        maxWidth: "none",
        maxHeight: "none",
        overflow: "hidden",
        boxShadow: "none",
      });

      if (!isExpanded) {
        visualEl.classList.add("about-video-visual--active");
        isExpanded = true;
      }
    };

    const st = ScrollTrigger.create({
      id: "about-video-scroll-expand",
      trigger: anchorEl,
      start: "bottom bottom",
      endTrigger: stageEl,
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        applyProgress(self.progress);
      },
      onUpdate: (self) => {
        applyProgress(self.progress);
      },
    });

    return () => {
      st.kill();
      cleanupActiveStyles();
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setIsVideoPlaying(false);
    } else {
      video.play().then(() => {
        setIsVideoPlaying(true);
      }).catch((err) => {
        console.warn("Video playback error:", err);
      });
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      ref={containerRef}
      className="about-viewport-root"
      style={{
        backgroundColor: "#0E152E",
        ...(isDockActive ? { minHeight: `${pageHeight}px` } : {}),
      }}
    >
      {/* === Selection Overlay Section START === */}
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
                decoding="async"
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
                decoding="async"
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
                decoding="async"
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
                src="/assets/selection/raregems/rare-gem-cover_converted.avif"
                alt="Limited Edition"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Link>
        </div>
      </section>
      {/* === Selection Overlay Section END === */}

      {/* === Main Page Stage START === */}
      <main
        className={`about-page-wrapper ${isDockActive ? "is-dock-active" : ""} ${isSelectionOpen || isOpeningFromDock ? "is-docked" : ""}`}
        onClick={() => {
          if (isSelectionOpen) closeSelection();
        }}
        aria-label="About Page Stage"
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
          {/* === SECTION 1: HERO START === */}
          <section className="about-hero" aria-label="About Hero">
            <div className="about-hero__media" aria-hidden="true">
              <img
                src="/assets/hero-load-visual.avif"
                alt="Realevate About Hero"
                fetchPriority="high"
              />
              <span className="about-hero__scroll-overlay" />
            </div>

            {/* Top Navigation */}
            <nav className="about-hero__nav" aria-label="Primary navigation">
              <div className="about-hero__nav-left">
                <Link href="/about" className="about-nav-link is-current">
                  About
                </Link>
              </div>

              <div className="about-hero__logo">
                <Link href="/" aria-label="PROPVISTA Homepage">
                  <img src="/assets/main-logo.svg" alt="PROPVISTA" />
                </Link>
              </div>

              <div className="about-hero__nav-right">
                <Link href="/contact" className="about-nav-link">
                  Contact
                </Link>
              </div>
            </nav>

            {/* Center Marquee */}
            <div className="about-hero__center" aria-hidden="true">
              <div className="about-marquee-track">
                <span className="about-marquee-text">About Us</span>
                <span className="about-marquee-text">About Us</span>
                <span className="about-marquee-text">About Us</span>
                <span className="about-marquee-text">About Us</span>
              </div>
            </div>
          </section>
          {/* === SECTION 1: HERO END === */}

      {/* === SECTION 2: INTRO & VIDEO SCROLL-EXPAND STAGE START === */}
      <div ref={videoStageRef} className="about-video-scroll-stage">
        <section className="about-intro-section about-intro" aria-label="About Realevate Introduction">
          <div className="about-intro-grid about-intro__grid">
            <p className="about-page-label about-intro__label">(About Us)</p>
            <h2 className="about-intro-headline about-intro__title">
              <span>Realevate </span> is a global real estate marketing agency, partnering with top-tier developers who share an innovative approach, commitment to excellence, and the vision of &ldquo;Elevating real estate - Elevating life.&rdquo;
            </h2>

            {/* Permanent Grid Anchor for ScrollTrigger & Layout Stability */}
            <div
              ref={videoAnchorRef}
              className="about-video-anchor"
              aria-hidden="true"
            />

            <div
              ref={videoVisualRef}
              className={`about-hero__visual about-intro__visual ${isVideoPlaying ? "about-video-playing" : ""}`}
            >
              <button
                type="button"
                className="about-hero__video"
                onClick={handleTogglePlay}
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              >
                <span className="about-hero__video-stack" aria-hidden="true">
                  <img
                    className="about-hero__video-media about-hero__video-media--preview"
                    src="/assets/video-thumb.avif"
                    alt="Realevate Vision Video"
                    decoding="async"
                  />
                  <video
                    ref={videoRef}
                    className="about-hero__video-media about-hero__video-media--full"
                    src="/assets/short-realevate.mp4"
                    playsInline
                    preload="none"
                    muted={false}
                    loop
                    onEnded={handleVideoEnded}
                    aria-hidden={!isVideoPlaying}
                  />
                </span>
                <span
                  className="about-hero__play about-intro__play"
                  aria-hidden="true"
                >
                  <span className="about-hero__play-icon">
                    <svg viewBox="0 0 14 16" fill="none" aria-hidden="true">
                      <path
                        d="M13.5 7.134C14.1667 7.5189 14.1667 8.4811 13.5 8.866L1.5 15.7942C0.833333 16.1791 0 15.698 0 14.9282V1.0718C0 0.301997 0.833333 -0.179129 1.5 0.205771L13.5 7.134Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="about-video-expand" aria-label="Realevate video">
        </section>
      </div>
      {/* === SECTION 2: INTRO & VIDEO SCROLL-EXPAND STAGE END === */}

      {/* === SECTION 4: OUTRO (Quote, Marquee, Philosophy, 4 Pillars, Process) START === */}
      <section className="category-outro about-hero__chrome" aria-label="Realevate Philosophy and Process">
        {/* Quote */}
        <div className="category-quote">
          <figure className="category-quote__figure">
            <img src="/assets/marble-about.avif" alt="Marble texture" loading="lazy" decoding="async" />
          </figure>
          <h2 className="category-quote__text">
            &ldquo;We find the world&apos;s most distinctive projects for investment and wellbeing.&rdquo;
          </h2>
        </div>

        {/* Marquee */}
        <div className="category-outro__marquee" aria-hidden="true">
          <div className="about-realevate-marquee-track">
            <span className="about-realevate-marquee-text">Realevate</span>
            <span className="about-realevate-marquee-text">Realevate</span>
            <span className="about-realevate-marquee-text">Realevate</span>
            <span className="about-realevate-marquee-text">Realevate</span>
          </div>
        </div>

        {/* Philosophy Header */}
        <div className="about-intro__grid">
          <p className="about-page__label about-intro__label">(Philosophy)</p>
          <h2 className="about-intro__title second">
            <span>Our </span> portfolio is selected by prime locations, exceptional living experiences, world-class amenities, strong year-round demand, and long-term capital appreciation potential.
          </h2>
        </div>

        {/* The 4 Pillars */}
        <div className="category-values">
          <article className="category-values__row">
            <figure className="category-values__figure">
              <img
                src="/assets/strategic-location-converted.avif"
                alt="Luxury coastal marina with yachts and palm trees"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="category-values__copy">
              <p className="about-page__pillar-index">(01)</p>
              <h3 className="category-values__stat">
                Strategic
                <br />
                Location
              </h3>
              <p className="category-values__desc">
                Highly sought-after locations where limited supply and sustained demand create long-term appreciation and above-average returns.
              </p>
            </div>
          </article>

          <article className="category-values__row category-values__row--reverse">
            <div className="category-values__copy">
              <p className="about-page__pillar-index">(02)</p>
              <h3 className="category-values__stat">
                Added
                <br />
                Value
              </h3>
              <p className="category-values__desc">
                A distinctive concept, world-class amenities, and premium services that enhance the living experience and drive stronger demand, occupancy, and long-term value.
              </p>
            </div>
            <figure className="category-values__figure">
              <img
                src="/assets/added-value-converted.avif"
                alt="Modern waterfront development at golden hour"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </article>

          <article className="category-values__row">
            <figure className="category-values__figure">
              <img
                src="/assets/masterplan-development-converted.avif"
                alt="People enjoying outdoor dining by the sea"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="category-values__copy">
              <p className="about-page__pillar-index">(03)</p>
              <h3 className="category-values__stat">
                Masterplan
                <br />
                Development
              </h3>
              <p className="category-values__desc">
                “The next best thing” - a fully planned communities that integrate residential living, lifestyle amenities, and infrastructure and has the biggest potential for accelerating growth and demand.
              </p>
            </div>
          </article>

          <article className="category-values__row category-values__row--reverse">
            <div className="category-values__copy">
              <p className="about-page__pillar-index">(04)</p>
              <h3 className="category-values__stat">
                Exceptional
                <br />
                Management
              </h3>
              <p className="category-values__desc">
                Professional property management that ensures the highest standards of maintenance, supporting exceptional guest experiences and consistently high ratings on leading travel platforms.
              </p>
            </div>
            <figure className="category-values__figure">
              <img
                src="/assets/exceptional-management-converted.avif"
                alt="Clients toasting at an outdoor table overlooking a marina"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </article>
        </div>

        {/* The Process */}
        <div className="about-intro__grid">
          <p className="about-page__label about-intro__label">(The process)</p>
          <h2 className="about-intro__title second">
            <span>We </span> connect investors with trusted developers, provide them with early access to exceptional opportunities, and guide them through every step of the purchasing process to secure the right deal with confidence.
          </h2>
        </div>
      </section>
      {/* === SECTION 4: OUTRO END === */}

      {/* === SECTION 5: PARALLAX VILLA IMAGE START === */}
      <section className="background-image-parallax category-parallax about-parallax-section" aria-label="Seaside resort lifestyle">
        <div className="background-image-parallax-inner category-parallax__viewport about-parallax-viewport">
          <img
            src="/assets/about-villa-bottom.avif"
            alt="Villa lifestyle"
            loading="lazy"
          />
        </div>
      </section>
      {/* === SECTION 5: PARALLAX VILLA IMAGE END === */}

      {/* === SECTION 6: CTA SECTION START === */}
      <section ref={ctaRef} className="about-cta-section" aria-label="Elevate your life call to action">
        <div className="about-cta-inner">
          <span className="about-cta-line" aria-hidden="true" />
          <h2 className="about-cta-title">
            Building wealth through better living.
          </h2>
          <div className="about-cta-link-wrap">
            <Link href="/contact" className="about-cta-link link-underline">
              Elevate your life
              <img
                src="/assets/arrow.svg"
                alt=""
                width={17}
                height={15}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
      {/* === SECTION 6: CTA SECTION END === */}

      {/* === SECTION 7: MOVE NEXT CATEGORY START === */}
      <section className="move-next-category" aria-label="Next category: Coastal Haven">
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

        <Link href="/coastal-haven" className="move-next-category-link">
          <div className="move-next-category-image">
            <div className="move-next-category-image-wrapper">
              <img
                src="/assets/selection/bythesea/bythesea-cover.avif"
                alt="Coastal Haven"
              />
              <div className="move-next-category-overlay" />
            </div>
          </div>

          <div className="move-next-category-content">
            <span className="move-next-category-badge">Next</span>
            <h2 className="move-next-category-title">By The Sea</h2>
            <p className="move-next-category-subtitle">
              Coastal, Marina &amp; Seafront property
            </p>
          </div>
        </Link>
      </section>
      {/* === SECTION 7: MOVE NEXT CATEGORY END === */}
        </div>
      </main>
      {/* === Main Page Stage END === */}

      {/* === Fixed Footer Actions START === */}
      <footer className="about-fixed-footer">
        <span
          ref={scrollHintRef}
          className="about-scroll-hint"
          style={{ opacity: isSelectionOpen || isZoomed ? 0 : 1 }}
        >
          (Scroll)
        </span>

        <div className={`about-footer-actions ${isCtaVisible && !isSelectionOpen ? "is-hidden" : ""}`}>
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
        textColor="#FFFFFF"
      />
      {/* === Navigation Menu Drawer END === */}
    </div>
  );
}

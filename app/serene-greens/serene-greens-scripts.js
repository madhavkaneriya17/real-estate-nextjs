import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* === Projects Slider Controller Re-export START === */
export { initProjectsSlider } from "@/components/CategoryGallery/slider-controller";
/* === Projects Slider Controller Re-export END === */


/* === Hero Parallax & Zoom Animation START === */
export function initHeroParallax({
  heroTrackRef,
  visualRef,
  headerRef,
  marqueeRef,
  contentRef,
  scrollHintRef,
  containerRef,
  setIsZoomed,
}) {
  if (typeof window === "undefined" || !heroTrackRef.current) return () => {};

  const ctx = gsap.context(() => {
    const getVw = () => window.innerWidth;
    const getVh = () => window.innerHeight;
    const getZoomDistance = () => getVh() * 0.9;
    const getSquareSize = () => Math.min(310, Math.max(190, getVw() * 0.195));
    const getInitialTop = () => getVh() * 0.44;
    const getFinalTop = () => getVh() * 0.50;

    // Position hero content below the initial square visual
    const updateContentPosition = () => {
      if (contentRef.current) {
        const topPos =
          getInitialTop() + getSquareSize() / 2 + Math.max(16, getVw() * 0.022);
        gsap.set(contentRef.current, {
          top: `${topPos}px`,
          xPercent: -50,
        });
      }
    };
    updateContentPosition();

    // Main Hero Scroll Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroTrackRef.current,
        start: "top top",
        end: () => `+=${getZoomDistance()}`,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const zoomed = p >= 0.98;
          setIsZoomed((prev) => (prev !== zoomed ? zoomed : prev));
        },
      },
    });

    // (A) Center Visual: zoom from square to full viewport
    tl.fromTo(
      visualRef.current,
      {
        top: () => `${getInitialTop()}px`,
        width: () => `${getSquareSize()}px`,
        height: () => `${getSquareSize()}px`,
        borderRadius: "2px",
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)",
      },
      {
        top: () => `${getFinalTop()}px`,
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
        ease: "none",
        duration: 1,
      },
      0
    );

    // (B) Header Fade: fades out over first 220px of scroll
    tl.fromTo(
      headerRef.current,
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        duration: () => Math.min(1, 220 / getZoomDistance()),
        onUpdate: function () {
          if (headerRef.current) {
            headerRef.current.style.pointerEvents =
              this.progress() >= 0.9 ? "none" : "auto";
          }
        },
      },
      0
    );

    // (C) Marquee Fade: fades out over first 280px of scroll
    tl.fromTo(
      marqueeRef.current,
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        duration: () => Math.min(1, 280 / getZoomDistance()),
      },
      0
    );

    // (D) Hero Content: translates up and fades out over first 300px
    tl.fromTo(
      contentRef.current,
      { opacity: 1, y: 0, display: "flex" },
      {
        opacity: 0,
        y: -320,
        ease: "none",
        duration: () => Math.min(1, 300 / getZoomDistance()),
        onUpdate: function () {
          if (contentRef.current) {
            contentRef.current.style.display =
              this.progress() >= 1 ? "none" : "flex";
          }
        },
      },
      0
    );

    // (E) Scroll Hint: fades out over first 120px
    if (scrollHintRef.current) {
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          duration: () => Math.min(1, 120 / getZoomDistance()),
        },
        0
      );
    }
  }, containerRef);

  const handleResize = () => {
    ScrollTrigger.refresh();
  };
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    ctx.revert();
  };
}
/* === Hero Parallax & Zoom Animation END === */


/* === Background Parallax Animation START === */
/**
 * @param {HTMLElement | { containerRef?: React.RefObject<HTMLElement> } | null} [options]
 */
export function initBackgroundParallax(options = {}) {
  if (typeof window === "undefined") return () => {};

  // Support root element directly, options object with containerRef/parallaxSectionRef, or document
  let root = document;
  if (options instanceof HTMLElement) {
    root = options;
  } else if (options && options.containerRef && options.containerRef.current) {
    root = options.containerRef.current;
  }

  let sections = Array.from(
    root.querySelectorAll(".background-image-parallax, .category-parallax")
  );

  // Fallback to legacy single ref if passed and query returned none
  if (sections.length === 0 && options && options.parallaxSectionRef?.current) {
    sections = [options.parallaxSectionRef.current];
  }

  if (sections.length === 0) return () => {};

  // Balanced elegant parallax parameters - smooth & natural depth
  const travelY = 14;       
  const scaleStart = 1.14;  
  const scaleEnd = 1.02;  
  const scrubLag = 0.45;    

  const imageLoadHandlers = [];

  const ctx = gsap.context(() => {
    sections.forEach((section) => {
      const img = section.querySelector("img");
      if (!img) return;

      gsap.set(img, {
        yPercent: -travelY,
        scale: scaleStart,
        force3D: true,
        transformOrigin: "center center",
      });

      gsap.fromTo(
        img,
        {
          yPercent: -travelY,
          scale: scaleStart,
        },
        {
          yPercent: travelY,
          scale: scaleEnd,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: scrubLag,
            invalidateOnRefresh: true,
          },
        }
      );

      const onImgLoad = () => {
        ScrollTrigger.refresh();
      };
      if (!img.complete) {
        img.addEventListener("load", onImgLoad, { once: true });
        imageLoadHandlers.push({ img, handler: onImgLoad });
      }
    });
  });

  return () => {
    imageLoadHandlers.forEach(({ img, handler }) => {
      img.removeEventListener("load", handler);
    });
    ctx.revert();
  };
}
/* === Background Parallax Animation END === */


/* === Selection Cards Staggered Reveal START === */
export function initSelectionCardsReveal(isSelectionOpen) {
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
}
/* === Selection Cards Staggered Reveal END === */


/* === Navigation Menu Staggered Reveal START === */
export function initNavMenuReveal(isMenuOpen) {
  if (typeof window === "undefined") return;

  const panel = document.querySelector(".nav-menu-panel");
  const overlay = document.querySelector(".nav-menu-backdrop");
  const button = document.querySelector(".about-menu-toggle-btn");
  if (!panel || !overlay) return;

  if (isMenuOpen) {
    gsap.killTweensOf([panel, overlay, ".nav-menu-link__inner", ".nav-menu-bottom"]);

    // Calculate initial clip from button rect
    let initialClip = "inset(100% 0% 0% 100%)";
    if (button) {
      const b = button.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const topDiff = Math.max(b.top - p.top, 0);
      const rightDiff = Math.max(p.right - b.right, 0);
      const bottomDiff = Math.max(p.bottom - b.bottom, 0);
      const leftDiff = Math.max(b.left - p.left, 0);
      initialClip = `inset(${topDiff}px ${rightDiff}px ${bottomDiff}px ${leftDiff}px)`;
    }

    // 1. Overlay fades in smoothly
    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: "power2.out", overwrite: "auto" }
    );

    // 2. Exact clip-path expand from trigger button to full rectangle
    gsap.fromTo(
      panel,
      {
        clipPath: initialClip,
        opacity: 1,
      },
      {
        clipPath: "inset(0px 0px 0px 0px)",
        duration: 0.7,
        ease: "cubic-bezier(0.4, 0.3, 0, 0.99)",
        overwrite: "auto",
      }
    );

    // 3. Links slide up from below overflow clip
    gsap.fromTo(
      ".nav-menu-link__inner",
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.65,
        ease: "power3.out",
        delay: 0.18,
        overwrite: "auto",
      }
    );

    // 4. Contact items (WhatsApp, Email) and close dash fade & rise
    gsap.fromTo(
      ".nav-menu-bottom",
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3,
        overwrite: "auto",
      }
    );
  }
}
/* === Navigation Menu Staggered Reveal END === */

/* === Why Invest Parallax Re-export START === */
export { initWhyInvestParallax } from "@/components/WhyInvestSection";
/* === Why Invest Parallax Re-export END === */



/* === Next Category Scroll & Redirect START === */
/**
 * Custom Cursor & Scroll Progress Controller:
 * - Replaces default mouse cursor with circular "Scroll" widget on section hover
 * - Smoothly follows the mouse cursor with lerp interpolation
 * - On continued scroll-down / wheel / touch swipe, fills the circular progress ring
 * - When 100% full, redirects to the next category page (/limited-edition)
 * - Decays smoothly back to 0 if scrolling stops
 *
 * @param {Object} [options]
 * @param {string} [options.sectionSelector]
 * @param {string} [options.indicatorSelector]
 * @param {string} [options.targetUrl]
 * @param {(() => void) | Function} [options.onRedirect]
 */
export function initNextCategoryScrollRedirect(options = {}) {
  if (typeof window === "undefined") return () => {};

  const {
    sectionSelector = ".move-next-category",
    indicatorSelector = ".next-category-scroll-indicator",
    targetUrl = "/limited-edition",
    onRedirect,
  } = options;

  const section = document.querySelector(sectionSelector);
  const indicator = document.querySelector(indicatorSelector);
  if (!section || !indicator) return () => {};

  const progressBar = indicator.querySelector(".next-category-scroll-bar");
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.03

  let currentProgress = 0;
  let targetProgress = 0;
  let isRedirecting = false;
  let lastScrollTime = 0;
  let isBottomZoneActive = false;
  let rafId = null;
  let isDestroyed = false;
  let redirectTimer = null;
  let backCooldownUntil = 0;

  // Cursor coordinates
  let mouseX = -200;
  let mouseY = -200;
  let currentX = -200;
  let currentY = -200;
  let isMouseActive = false;

  // Full state reset function (used on mount, unmount, scroll-up, and reverse/back navigation)
  const resetState = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }
    isRedirecting = false;
    targetProgress = 0;
    currentProgress = 0;
    isBottomZoneActive = false;
    isMouseActive = false;
    mouseX = -200;
    mouseY = -200;
    currentX = -200;
    currentY = -200;

    document.body.classList.remove("bottom-cursor-active");
    indicator.classList.remove("is-active", "is-complete");
    if (progressBar) {
      progressBar.style.strokeDasharray = `${circumference}`;
      progressBar.style.strokeDashoffset = `${circumference}`;
    }
    indicator.style.transform = `translate3d(-200px, -200px, 0) translate(-50%, -50%) scale(0.65)`;
  };

  // Set initial stroke & transform properties
  resetState();

  let lastWindowScrollY = typeof window !== "undefined" ? window.scrollY : 0;

  // Detect when user has scrolled to the end part of the page
  const updateBottomZone = () => {
    if (isDestroyed) return;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );

    if (scrollY > lastWindowScrollY + 2) {
      lastScrollTime = performance.now();
    }
    if (scrollY < lastWindowScrollY - 4) {
      if (isRedirecting) {
        if (redirectTimer) {
          clearTimeout(redirectTimer);
          redirectTimer = null;
        }
        isRedirecting = false;
        indicator.classList.remove("is-complete");
      }
      targetProgress = Math.max(0, targetProgress - 0.15);
    }
    lastWindowScrollY = scrollY;

    // Bottom section must be FULLY visible on screen before activating round indicator
    const isScrolledToBottom = docHeight - (scrollY + windowHeight) <= 25;
    const isSectionFullyInView = rect.bottom <= windowHeight + 15 && rect.top < windowHeight;
    const isAtBottom = isScrolledToBottom || isSectionFullyInView;

    if (isAtBottom) {
      if (!isBottomZoneActive && !isRedirecting) {
        isBottomZoneActive = true;
      }
      const isMouseOver = isMouseActive && mouseY >= rect.top - 15 && mouseY <= rect.bottom + 15;
      if ((isMouseOver || targetProgress > 0) && !indicator.classList.contains("is-active")) {
        document.body.classList.add("bottom-cursor-active");
        indicator.classList.add("is-active");
      } else if (!isMouseOver && targetProgress <= 0 && !isRedirecting) {
        document.body.classList.remove("bottom-cursor-active");
        indicator.classList.remove("is-active");
      }
    } else {
      if (isBottomZoneActive || indicator.classList.contains("is-active") || isRedirecting) {
        isBottomZoneActive = false;
        targetProgress = 0;
        document.body.classList.remove("bottom-cursor-active");
        indicator.classList.remove("is-active", "is-complete");
        if (redirectTimer) {
          clearTimeout(redirectTimer);
          redirectTimer = null;
          isRedirecting = false;
        }
      }
    }
  };

  window.addEventListener("scroll", updateBottomZone, { passive: true });
  window.addEventListener("resize", updateBottomZone, { passive: true });
  updateBottomZone();

  const handleMouseMove = (e) => {
    if (isDestroyed) return;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMouseActive) {
      currentX = mouseX;
      currentY = mouseY;
      isMouseActive = true;
    }

    if (isBottomZoneActive) {
      const rect = section.getBoundingClientRect();
      const isMouseOver = mouseY >= rect.top - 15 && mouseY <= rect.bottom + 15;
      if (isMouseOver || targetProgress > 0) {
        if (!indicator.classList.contains("is-active")) {
          document.body.classList.add("bottom-cursor-active");
          indicator.classList.add("is-active");
        }
      } else if (!isRedirecting && targetProgress <= 0) {
        document.body.classList.remove("bottom-cursor-active");
        indicator.classList.remove("is-active");
      }
    }
  };

  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  const triggerRedirect = () => {
    if (isDestroyed || isRedirecting) return;
    if (performance.now() < backCooldownUntil) return;
    isRedirecting = true;
    targetProgress = 1;
    currentProgress = 1;
    if (progressBar) {
      progressBar.style.strokeDashoffset = "0";
    }
    indicator.classList.add("is-complete");

    if (redirectTimer) clearTimeout(redirectTimer);
    redirectTimer = setTimeout(() => {
      if (typeof onRedirect === "function") {
        onRedirect();
      } else {
        window.location.assign(targetUrl);
      }
    }, 280);
  };

  // Animation frame loop for smooth cursor follower & progress interpolation
  const tick = () => {
    if (isDestroyed) return;

    // 1. Smooth cursor lerp follower
    if (isMouseActive && (isBottomZoneActive || isRedirecting)) {
      currentX += (mouseX - currentX) * 0.35;
      currentY += (mouseY - currentY) * 0.35;
      const scale = isRedirecting ? 1.15 : 1;
      indicator.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
    }

    // 2. Smooth natural decay: only after 2 seconds (2000ms) of no scroll activity
    if (!isRedirecting && targetProgress > 0 && performance.now() - lastScrollTime > 2000) {
      targetProgress = Math.max(0, targetProgress - 0.015);
    }

    // 3. Smooth interpolation towards targetProgress (silky smooth lerp)
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0004) {
      const lerpSpeed = targetProgress < currentProgress ? 0.18 : 0.14;
      currentProgress += diff * lerpSpeed;
    } else {
      currentProgress = targetProgress;
    }

    currentProgress = Math.max(0, Math.min(1, currentProgress));

    // Update SVG stroke-dashoffset directly every frame
    if (progressBar) {
      const offset = circumference * (1 - currentProgress);
      progressBar.style.strokeDashoffset = `${offset}`;
    }

    // Trigger redirect when 100% full
    if (currentProgress >= 0.985 && !isRedirecting && performance.now() >= backCooldownUntil) {
      triggerRedirect();
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  // Wheel listener: smoothly fills progress on scroll-down; smoothly drains on scroll-up
  const handleWheel = (e) => {
    if (isDestroyed || isRedirecting) return;
    if (performance.now() < backCooldownUntil) return;
    if (!isBottomZoneActive) return;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 33;
    if (e.deltaMode === 2) delta *= 100;

    if (delta > 1) {
      if (!indicator.classList.contains("is-active")) {
        document.body.classList.add("bottom-cursor-active");
        indicator.classList.add("is-active");
      }
      lastScrollTime = performance.now();
      const increment = Math.min(0.065, Math.max(0.006, delta * 0.00065));
      targetProgress = Math.min(1, targetProgress + increment);
    } else if (delta < -1) {
      // Scrolling up: smoothly drain back towards 0
      lastScrollTime = performance.now();
      const decrement = Math.min(0.12, Math.max(0.015, Math.abs(delta) * 0.0012));
      targetProgress = Math.max(0, targetProgress - decrement);
    }
  };

  // Touch handlers for mobile
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      if (!isMouseActive) {
        currentX = mouseX;
        currentY = mouseY;
        isMouseActive = true;
      }
    }
  };

  const handleTouchMove = (e) => {
    if (isDestroyed || isRedirecting) return;
    if (performance.now() < backCooldownUntil) return;
    if (!isBottomZoneActive || !e.touches || e.touches.length === 0) return;

    const currentTouchY = e.touches[0].clientY;
    mouseX = e.touches[0].clientX;
    mouseY = currentTouchY;

    if (!indicator.classList.contains("is-active")) {
      indicator.classList.add("is-active");
    }

    const diffY = touchStartY - currentTouchY; // positive = swipe up (scroll down)
    if (diffY > 1) {
      lastScrollTime = performance.now();
      const increment = Math.min(0.05, Math.max(0.004, diffY * 0.0012));
      targetProgress = Math.min(1, targetProgress + increment);
      touchStartY = currentTouchY;
    } else if (diffY < -1) {
      const decrement = Math.min(0.1, Math.abs(diffY) * 0.002);
      targetProgress = Math.max(0, targetProgress - decrement);
      touchStartY = currentTouchY;
    }
  };

  // Click handler to instantly trigger redirect
  const handleClick = () => {
    if (isDestroyed || isRedirecting || !isBottomZoneActive) return;
    if (performance.now() < backCooldownUntil) return;
    triggerRedirect();
  };

  // History & BFCache reverse navigation handlers (crucial: resets circle and adds grace period when coming back)
  const handlePageShow = (e) => {
    resetState();
    backCooldownUntil = performance.now() + 1800;
    requestAnimationFrame(() => {
      updateBottomZone();
    });
  };

  const handlePopState = () => {
    resetState();
    backCooldownUntil = performance.now() + 1800;
    requestAnimationFrame(() => {
      updateBottomZone();
    });
  };

  const handlePageHide = () => {
    resetState();
  };

  window.addEventListener("wheel", handleWheel, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("pageshow", handlePageShow);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("popstate", handlePopState);
  section.addEventListener("click", handleClick);

  return () => {
    isDestroyed = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    resetState();
    window.removeEventListener("scroll", updateBottomZone);
    window.removeEventListener("resize", updateBottomZone);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("pageshow", handlePageShow);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("popstate", handlePopState);
    section.removeEventListener("click", handleClick);
  };
}
/* === Next Category Scroll & Redirect END === */



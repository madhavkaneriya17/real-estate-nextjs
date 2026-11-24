"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  try {
    CustomEase.create("categoryNext", "0.5, 0.2, 0, 1");
  } catch (e) {}
}

export { initProjectsSlider } from "@/components/CategoryGallery/slider-controller";

/* === Realevate Signature Price Badge Border Draw Animation === */
export function animatePriceBadgeBorder(
  badgeElement,
  { delay = 0.4, duration = 0.65, stagger = 0.35 } = {}
) {
  if (!badgeElement || typeof window === "undefined") return null;

  gsap.set(badgeElement, {
    "--hero-price-border-top": 0,
    "--hero-price-border-right": 0,
    "--hero-price-border-bottom": 0,
    "--hero-price-border-left": 0,
  });

  const tl = gsap.timeline({ delay });

  [
    "--hero-price-border-top",
    "--hero-price-border-right",
    "--hero-price-border-bottom",
    "--hero-price-border-left",
  ].forEach((prop, i) => {
    tl.to(
      badgeElement,
      {
        [prop]: 1,
        duration,
        ease: "power2.inOut",
      },
      i * stagger
    );
  });

  return tl;
}

/* === Hero Parallax & Flight Zoom Animation === */
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
  if (typeof window === "undefined" || !heroTrackRef?.current) return () => {};

  const ctx = gsap.context((self) => {
    const getVw = () => window.innerWidth;
    const getVh = () => window.innerHeight;
    const getZoomDistance = () => getVh() * 0.9;
    const getSquareSize = () => {
      const vw = getVw();
      if (vw <= 650) {
        return Math.min(230, Math.max(160, vw * 0.46));
      }
      return Math.min(310, Math.max(190, vw * 0.195));
    };
    const getInitialTop = () => (getVw() <= 650 ? getVh() * 0.42 : getVh() * 0.44);
    const getFinalTop = () => getVh() * 0.50;

    // Check if incoming from Category Next transition (Realevate signature flight shrink)
    const isFlightIncoming =
      typeof window !== "undefined" &&
      (window.__categoryFlightPending === true ||
        sessionStorage.getItem("category_flight_pending") === "true");

    if (isFlightIncoming && visualRef.current && !window.__categoryFlightRunning) {
      window.__categoryFlightRunning = true;
      window.__categoryFlightPending = false;

      // Reset scroll position to top instantly
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Reset smooth scroller position if present
      if (typeof window !== "undefined" && window.smoothScroller?.scrollTo) {
        window.smoothScroller.scrollTo(0, { immediate: true });
      }

      // Lock scrolling during flight shrink
      document.body.classList.add("category-next-transition", "category-next-scroll-locked");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && window.smoothScroller?.lock) {
        window.smoothScroller.lock();
      }

      // Hide real center hero visual while flight is shrinking
      gsap.set(visualRef.current, { visibility: "hidden" });

      // Surround elements initially invisible and shifted slightly downwards
      const surroundElements = [
        headerRef.current,
        contentRef.current,
        marqueeRef.current,
        scrollHintRef.current,
      ].filter(Boolean);
      gsap.set(surroundElements, { opacity: 0, y: 16 });

      // Get existing flight element or create one if needed
      let flight = document.querySelector(".category-next-flight");
      if (!flight) {
        flight = document.createElement("div");
        flight.className = "category-next-flight";
        flight.setAttribute("aria-hidden", "true");
        flight.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999999;
          margin: 0;
          padding: 0;
          overflow: hidden;
          pointer-events: none;
        `;
        const flightImg = document.createElement("img");
        const realImg = visualRef.current.querySelector("img");
        const savedSrc = typeof window !== "undefined" ? window.__categoryFlightSrc : "";
        flightImg.src = savedSrc || realImg?.getAttribute("src") || "";
        flightImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block;";
        flight.appendChild(flightImg);
        document.body.appendChild(flight);
      } else {
        // Ensure flight element starts full-screen at top: 0, left: 0
        gsap.set(flight, {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          boxShadow: "none",
          opacity: 1,
          transform: "none",
          zIndex: 9999999,
        });
      }

      // Run flight shrink OUTSIDE ctx so React StrictMode cleanup does not abort it
      self.ignore(() => {
        // Measure target center visual coordinates
        const targetRect = visualRef.current.getBoundingClientRect();
        const squareSize = getSquareSize();
        const targetTop = targetRect.width > 0 ? targetRect.top : (getVh() * 0.44 - squareSize / 2);
        const targetLeft = targetRect.width > 0 ? targetRect.left : ((getVw() - squareSize) / 2);
        const targetWidth = targetRect.width > 0 ? targetRect.width : squareSize;
        const targetHeight = targetRect.height > 0 ? targetRect.height : squareSize;

        // Step 2: "small ho kr center me jo next page ki image he vaha pr chali jaye"
        gsap.to(flight, {
          top: targetTop,
          left: targetLeft,
          width: targetWidth,
          height: targetHeight,
          borderRadius: "2px",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)",
          duration: 1.05,
          ease: "categoryNext",
          onComplete: () => {
            // Reveal the real center square right underneath
            if (visualRef.current) {
              gsap.set(visualRef.current, { visibility: "visible", opacity: 1 });
            }

            // Step 3: "then chali jaye" -> Flight element smoothly fades out & is removed
            gsap.to(flight, {
              opacity: 0,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                flight?.remove();
                window.__categoryFlightRunning = false;
                window.__categoryFlightPending = false;
                try {
                  sessionStorage.removeItem("category_flight_pending");
                  sessionStorage.removeItem("category_flight_src");
                } catch (e) {}
                document.body.classList.remove("category-next-transition", "category-next-scroll-locked");
                document.documentElement.style.overflow = "";
                document.body.style.overflow = "";
                if (typeof window !== "undefined" && window.smoothScroller?.unlock) {
                  window.smoothScroller.unlock();
                }
                ScrollTrigger.refresh();
              },
            });
          },
        });
      });

      // Smoothly fade in header, category title, marquee & badges around the shrinking hero
      gsap.to(surroundElements, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.35,
      });
    }

    // Realevate signature clockwise border drawing for the price badge
    const badge =
      contentRef?.current?.querySelector?.(".about-price-badge, .hero-price-badge") ||
      heroTrackRef?.current?.querySelector?.(".about-price-badge, .hero-price-badge");
    if (badge) {
      animatePriceBadgeBorder(badge, { delay: isFlightIncoming ? 0.6 : 0.35 });
    }

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

    const stage =
      heroTrackRef.current.querySelector(".hero-sticky-stage") ||
      heroTrackRef.current;

    // Main Hero Scroll Timeline - Pinned in place while zooming to full screen
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroTrackRef.current,
        start: "top top",
        end: () => `+=${getZoomDistance()}`,
        pin: stage,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const zoomed = p >= 0.98;
          setIsZoomed((prev) => (prev !== zoomed ? zoomed : prev));
        },
      },
    });

    // (A) Center Visual: zoom from centered square to full viewport while remaining anchored
    tl.fromTo(
      visualRef.current,
      {
        top: () => `${getInitialTop()}px`,
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        width: () => `${getSquareSize()}px`,
        height: () => `${getSquareSize()}px`,
        borderRadius: "2px",
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)",
      },
      {
        top: () => `${getFinalTop()}px`,
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        width: () => `${getVw()}px`,
        height: () => `${getVh()}px`,
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

/* === Background Parallax Animation === */
/**
 * @param {any} [options]
 */
export function initBackgroundParallax(options = {}) {
  if (typeof window === "undefined") return () => {};

  let root = document;
  if (options instanceof HTMLElement) {
    root = options;
  } else if (options && options.containerRef && options.containerRef.current) {
    root = options.containerRef.current;
  }

  let sections = Array.from(
    root.querySelectorAll(".background-image-parallax, .category-parallax")
  );

  if (sections.length === 0 && options && options.parallaxSectionRef?.current) {
    sections = [options.parallaxSectionRef.current];
  }

  if (sections.length === 0) return () => {};

  const travelY = 14;
  const scaleStart = 1.14;
  const scaleEnd = 1.02;
  const scrubLag = 0.3;

  const imageLoadHandlers = [];
  let refreshTimer = null;

  const requestDebouncedRefresh = () => {
    if (refreshTimer) return;
    refreshTimer = requestAnimationFrame(() => {
      refreshTimer = null;
      ScrollTrigger.refresh();
    });
  };

  const ctx = gsap.context((self) => {
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
            invalidateOnRefresh: false,
            fastScrollEnd: true,
          },
        }
      );

      const onImgLoad = () => {
        requestDebouncedRefresh();
      };
      if (!img.complete) {
        img.addEventListener("load", onImgLoad, { once: true });
        imageLoadHandlers.push({ img, handler: onImgLoad });
      }
    });
  });

  return () => {
    if (refreshTimer) {
      cancelAnimationFrame(refreshTimer);
      refreshTimer = null;
    }
    imageLoadHandlers.forEach(({ img, handler }) => {
      img.removeEventListener("load", handler);
    });
    ctx.revert();
  };
}

/* === Selection Cards Staggered Reveal === */
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

/* === Navigation Menu Staggered Reveal === */
export function initNavMenuReveal(isMenuOpen) {
  if (isMenuOpen) {
    gsap.fromTo(
      ".nav-menu-link-item",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
      }
    );
  }
}

/* === Next Category Scroll Redirect & Full-Screen Expansion === */
export function initNextCategoryScrollRedirect(options = {}) {
  if (typeof window === "undefined") return () => {};

  const {
    sectionSelector = ".move-next-category",
    indicatorSelector = ".next-category-scroll-indicator",
    targetUrl = "/serene-greens",
    onRedirect,
  } = options;

  const section = document.querySelector(sectionSelector);
  const indicator = document.querySelector(indicatorSelector);
  if (!section || !indicator) return () => {};

  const progressBar = indicator.querySelector(".next-category-scroll-bar");
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.03

  const img = section.querySelector(".move-next-category-image-wrapper img");
  const contentElements = section.querySelectorAll(
    ".move-next-category-badge, .move-next-category-title, .move-next-category-subtitle"
  );
  const overlay = section.querySelector(".move-next-category-overlay");
  const link = section.querySelector(".move-next-category-link");

  let currentProgress = 0;
  let targetProgress = 0;
  let isRedirecting = false;
  let lastScrollTime = 0;
  let isBottomZoneActive = false;
  let rafId = null;
  let isDestroyed = false;
  let redirectTimer = null;
  let backCooldownUntil = 0;

  // Parallax ScrollTrigger on background image
  let parallaxTween = null;
  if (img) {
    parallaxTween = gsap.fromTo(
      img,
      { yPercent: -6, scale: 1.16, transformOrigin: "center center", force3D: true },
      {
        yPercent: 6,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          id: "category-next-scroll-parallax",
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  // Scroll reveal animation for text elements
  let revealTween = null;
  if (contentElements.length) {
    revealTween = gsap.fromTo(
      contentElements,
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          id: "category-next-scroll-reveal",
          trigger: section,
          start: "top 88%",
          once: true,
        },
      }
    );
  }

  // Cursor coordinates
  let mouseX = -200;
  let mouseY = -200;
  let currentX = -200;
  let currentY = -200;
  let isMouseActive = false;

  const checkMouseOverSection = () => {
    if (!isMouseActive) return false;
    const rect = section.getBoundingClientRect();
    return (
      mouseY >= rect.top &&
      mouseY <= rect.bottom &&
      mouseX >= rect.left &&
      mouseX <= rect.right
    );
  };

  const showIndicator = () => {
    if (isDestroyed || isRedirecting) return;
    if (!checkMouseOverSection() && targetProgress <= 0) return;
    isBottomZoneActive = true;
    document.body.classList.add("bottom-cursor-active");
    indicator.classList.add("is-active");
    indicator.style.opacity = "1";
    indicator.style.visibility = "visible";
  };

  const hideIndicator = () => {
    if (isDestroyed || isRedirecting) return;
    if (targetProgress <= 0) {
      document.body.classList.remove("bottom-cursor-active");
      indicator.classList.remove("is-active");
      indicator.style.opacity = "";
      indicator.style.visibility = "";
      isBottomZoneActive = false;
    }
  };

  const resetState = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }

    const isFlightPending =
      isRedirecting ||
      (typeof window !== "undefined" &&
        (window.__categoryFlightPending === true ||
          window.__categoryFlightRunning === true ||
          sessionStorage.getItem("category_flight_pending") === "true"));

    if (!isFlightPending) {
      document.body.classList.remove(
        "bottom-cursor-active",
        "category-next-transition",
        "category-next-scroll-locked"
      );
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.smoothScroller?.unlock) {
        window.smoothScroller.unlock();
      }
      document.querySelectorAll(".category-next-flight").forEach((el) => el.remove());
      document.querySelectorAll(".category-next-transition-spacer").forEach((el) => el.remove());
      section.style.opacity = "";
      if (img) img.style.visibility = "";
    }

    isRedirecting = false;
    targetProgress = 0;
    currentProgress = 0;
    isBottomZoneActive = false;

    section.classList.remove("is-transitioning");
    gsap.killTweensOf(section);
    gsap.set(section, { clearProps: "position,top,left,width,height,margin,zIndex,overflow,opacity" });

    if (contentElements.length) {
      gsap.killTweensOf(contentElements);
      gsap.set(contentElements, { clearProps: "transform,yPercent,opacity,y" });
    }

    if (overlay) {
      gsap.killTweensOf(overlay);
      gsap.set(overlay, { clearProps: "opacity" });
    }

    if (img) {
      gsap.killTweensOf(img);
      gsap.set(img, { clearProps: "scale,yPercent,filter,visibility" });
      if (parallaxTween?.scrollTrigger) {
        parallaxTween.scrollTrigger.refresh();
      }
    }

    gsap.killTweensOf(indicator);
    indicator.classList.remove("is-active", "is-complete");
    indicator.style.opacity = "";
    indicator.style.visibility = "";
    if (progressBar) {
      progressBar.style.strokeDasharray = `${circumference}`;
      progressBar.style.strokeDashoffset = `${circumference}`;
    }
  };

  resetState();

  let lastWindowScrollY = typeof window !== "undefined" ? window.scrollY : 0;

  const updateBottomZone = () => {
    if (isDestroyed || isRedirecting) return;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (scrollY > lastWindowScrollY + 2) {
      lastScrollTime = performance.now();
    }
    if (scrollY < lastWindowScrollY - 4) {
      targetProgress = Math.max(0, targetProgress - 0.15);
    }
    lastWindowScrollY = scrollY;

    const inViewport = rect.top < windowHeight && rect.bottom > 0;
    if (inViewport && checkMouseOverSection()) {
      showIndicator();
    } else if (!checkMouseOverSection() && targetProgress <= 0) {
      hideIndicator();
    }
  };

  window.addEventListener("scroll", updateBottomZone, { passive: true });
  window.addEventListener("resize", updateBottomZone, { passive: true });
  updateBottomZone();

  const handleMouseMove = (e) => {
    if (isDestroyed || isRedirecting) return;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMouseActive) {
      currentX = mouseX;
      currentY = mouseY;
      isMouseActive = true;
      indicator.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(1)`;
    }

    if (checkMouseOverSection()) {
      showIndicator();
    } else if (targetProgress <= 0) {
      hideIndicator();
    }
  };

  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  section.addEventListener("mouseenter", showIndicator);
  section.addEventListener("mouseleave", hideIndicator);

  // Full-screen cinematic page transition matching Realevate Fi spec
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

    // 1. Lock scrolling immediately & set flight active flag
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("category_flight_pending", "true");
        window.__categoryFlightPending = true;
        if (img?.currentSrc || img?.src) {
          sessionStorage.setItem("category_flight_src", img.currentSrc || img.src);
          window.__categoryFlightSrc = img.currentSrc || img.src;
        }
      } catch (e) {}
    }
    document.body.classList.add("category-next-transition", "category-next-scroll-locked");
    document.body.classList.remove("bottom-cursor-active");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (typeof window !== "undefined" && window.smoothScroller?.lock) {
      window.smoothScroller.lock();
    }

    // 2. Hide circular indicator smoothly
    gsap.to(indicator, { opacity: 0, scale: 0.5, duration: 0.25, ease: "power2.out" });

    // 3. Pause parallax scrub & kill tweens
    if (parallaxTween?.scrollTrigger) {
      parallaxTween.scrollTrigger.kill();
    }
    if (revealTween?.scrollTrigger) {
      revealTween.scrollTrigger.kill();
    }
    if (img) gsap.killTweensOf(img);
    if (contentElements.length) gsap.killTweensOf(contentElements);
    if (overlay) gsap.killTweensOf(overlay);

    // 4. Measure section position and create flight element directly on document.body
    const rect = section.getBoundingClientRect();
    const imgSrc = img?.currentSrc || img?.src || window.__categoryFlightSrc || "";

    document.querySelectorAll(".category-next-flight").forEach((el) => el.remove());
    const flight = document.createElement("div");
    flight.className = "category-next-flight";
    flight.setAttribute("aria-hidden", "true");
    flight.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border-radius: 4px;
      z-index: 9999999;
      margin: 0;
      padding: 0;
      overflow: hidden;
      pointer-events: none;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
    `;
    const flightImg = document.createElement("img");
    flightImg.src = imgSrc;
    flightImg.alt = "";
    flightImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block;";
    flight.appendChild(flightImg);
    document.body.appendChild(flight);

    // Hide original image in section to avoid double-image render
    if (img) {
      gsap.set(img, { visibility: "hidden" });
    }

    // 5. Run cinematic expansion animation matching reference site (0.85s)
    // Step 1: "jab image footer vali full page me aa jaye"
    const tl = gsap.timeline({
      onComplete: () => {
        // Flight is now covering 100vw x 100vh full-screen. Transition to target route.
        if (typeof onRedirect === "function") {
          onRedirect();
        } else {
          window.location.assign(targetUrl);
        }
      },
    });

    // Expand flight from footer position to 100vw x 100vh viewport
    tl.to(
      flight,
      {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        boxShadow: "none",
        duration: 0.85,
        ease: "categoryNext",
      },
      0
    );

    // Text slides up and fades out cleanly
    if (contentElements.length) {
      tl.to(
        contentElements,
        {
          yPercent: -120,
          opacity: 0,
          duration: 0.55,
          ease: "power2.in",
          stagger: 0.06,
        },
        0.08
      );
    }

    // Overlay fades out smoothly
    if (overlay) {
      tl.to(
        overlay,
        {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        0.1
      );
    }
  };

  const tick = () => {
    if (isDestroyed) return;

    if (isMouseActive) {
      currentX += (mouseX - currentX) * 0.35;
      currentY += (mouseY - currentY) * 0.35;
      const scale = isRedirecting ? 1.15 : 1;
      indicator.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
    }

    if (!isRedirecting && targetProgress > 0 && performance.now() - lastScrollTime > 2000) {
      targetProgress = Math.max(0, targetProgress - 0.015);
    }

    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0004) {
      const lerpSpeed = targetProgress < currentProgress ? 0.18 : 0.14;
      currentProgress += diff * lerpSpeed;
    } else {
      currentProgress = targetProgress;
    }

    currentProgress = Math.max(0, Math.min(1, currentProgress));

    if (progressBar) {
      const offset = circumference * (1 - currentProgress);
      progressBar.style.strokeDashoffset = `${offset}`;
    }

    if (currentProgress >= 0.985 && !isRedirecting && performance.now() >= backCooldownUntil) {
      triggerRedirect();
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  const handleWheel = (e) => {
    if (isDestroyed || isRedirecting) return;
    if (performance.now() < backCooldownUntil) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const inView = rect.top < windowHeight && rect.bottom > 0;
    if (!inView && !isBottomZoneActive && !checkMouseOverSection()) return;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 33;
    if (e.deltaMode === 2) delta *= 100;

    if (delta > 1) {
      showIndicator();
      lastScrollTime = performance.now();
      const increment = Math.min(0.065, Math.max(0.006, delta * 0.00065));
      targetProgress = Math.min(1, targetProgress + increment);
    } else if (delta < -1) {
      lastScrollTime = performance.now();
      const decrement = Math.min(0.12, Math.max(0.015, Math.abs(delta) * 0.0012));
      targetProgress = Math.max(0, targetProgress - decrement);
    }
  };

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

    const diffY = touchStartY - currentTouchY;
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

  const handleClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isDestroyed || isRedirecting) return;
    if (performance.now() < backCooldownUntil) return;
    triggerRedirect();
  };

  const handlePageShow = () => {
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
  section.addEventListener("click", handleClick, { capture: true });
  if (link) {
    link.addEventListener("click", handleClick, { capture: true });
  }

  return () => {
    isDestroyed = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (parallaxTween?.scrollTrigger) {
      parallaxTween.scrollTrigger.kill();
    }
    if (revealTween?.scrollTrigger) {
      revealTween.scrollTrigger.kill();
    }
    window.removeEventListener("scroll", updateBottomZone);
    window.removeEventListener("resize", updateBottomZone);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("pageshow", handlePageShow);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("popstate", handlePopState);
    section.removeEventListener("mouseenter", showIndicator);
    section.removeEventListener("mouseleave", hideIndicator);
    section.removeEventListener("click", handleClick, { capture: true });
    if (link) {
      link.removeEventListener("click", handleClick, { capture: true });
    }
    resetState();
  };
}

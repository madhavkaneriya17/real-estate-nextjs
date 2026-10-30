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
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4)",
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

    // (B) Header Fade
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

    // (C) Marquee Fade
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

    // (D) Hero Content
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

    // (E) Scroll Hint
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


/* === Why Invest Parallax Re-export START === */
export { initWhyInvestParallax } from "@/components/WhyInvestSection";
/* === Why Invest Parallax Re-export END === */


/* === Next Category Scroll & Redirect START === */
export function initNextCategoryScrollRedirect(options = {}) {
  if (typeof window === "undefined") return () => {};

  const {
    sectionSelector = ".move-next-category",
    indicatorSelector = ".next-category-scroll-indicator",
    targetUrl = "/coastal-haven",
    onRedirect,
  } = options;

  const section = document.querySelector(sectionSelector);
  const indicator = document.querySelector(indicatorSelector);
  if (!section || !indicator) return () => {};

  const progressBar = indicator.querySelector(".next-category-scroll-bar");
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  let currentProgress = 0;
  let targetProgress = 0;
  let isRedirecting = false;
  let lastScrollTime = 0;
  let isBottomZoneActive = false;
  let rafId = null;
  let isDestroyed = false;
  let redirectTimer = null;
  let backCooldownUntil = 0;

  let mouseX = -200;
  let mouseY = -200;
  let currentX = -200;
  let currentY = -200;
  let isMouseActive = false;

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

  resetState();

  let lastWindowScrollY = typeof window !== "undefined" ? window.scrollY : 0;

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

  const tick = () => {
    if (isDestroyed) return;

    if (isMouseActive && (isBottomZoneActive || isRedirecting)) {
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

  const handleClick = () => {
    if (isDestroyed || isRedirecting || !isBottomZoneActive) return;
    if (performance.now() < backCooldownUntil) return;
    triggerRedirect();
  };

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

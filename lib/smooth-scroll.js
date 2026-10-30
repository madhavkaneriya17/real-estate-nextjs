"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* === Smooth Scroller Module START === */
export class SmoothScroller {
  constructor(options = {}) {
    if (typeof window === "undefined") return;

    this.options = {
      smoothness: 0.042,          // Exact Realevate damping constant
      wheelMultiplier: 0.8,       // Exact Realevate wheel step multiplier
      touchMultiplier: 2.2,       // Mobile touch drag multiplier
      keyboardStep: 100,          // Arrow key step
      pageStep: 550,              // PageUp / PageDown step
      ...options,
    };

    this.current = window.scrollY || 0;
    this.target = this.current;
    this.isScrolling = false;
    this.isLocked = false;
    this.destroyed = false;

    // Touch momentum tracking
    this.isTouchActive = false;
    this.touchStartY = 0;
    this.touchLastY = 0;
    this.touchLastTime = 0;
    this.touchVelocity = 0;

    // Prevent programmatic scroll loops
    this.isProgrammaticScroll = false;

    this.bindEvents();
    this.startTicker();

    // Store global instance for developer inspection and cross-component control
    window.smoothScroller = this;
    window.smoothScrollInstance = this; // Compatibility with Realevate naming
  }

  /**
   * Calculate maximum scrollable distance of the current page
   */
  getMaxScroll() {
    if (typeof document === "undefined") return 0;
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }

  /**
   * Check if page scrolling is locked by modals, docks, or overlay classes
   */
  checkIsLocked() {
    if (this.isLocked) return true;
    if (typeof document === "undefined") return false;

    const body = document.body;
    if (
      body.classList.contains("selection-open") ||
      body.classList.contains("is-dock-active") ||
      body.style.overflow === "hidden"
    ) {
      return true;
    }
    return false;
  }

  /**
   * Check if event originated inside a nested scrollable container
   * (e.g. modal overlay, textarea, dropdown)
   * Only true if the element actually has vertical scrollable overflow.
   */
  isInsideScrollable(target, deltaY) {
    if (!target || typeof target.closest !== "function") return false;

    let el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      // Sliders and galleries are horizontal or static containers - never block vertical page scrolling
      if (
        el.classList &&
        (el.classList.contains("projects-slider-viewport") ||
          el.classList.contains("projects-slider") ||
          el.classList.contains("category-gallery"))
      ) {
        el = el.parentElement;
        continue;
      }

      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;

      // Only block if element has scroll/auto AND actual vertical scrollable height
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight + 2
      ) {
        const canScrollDown =
          deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1;
        const canScrollUp = deltaY < 0 && el.scrollTop > 1;

        if (canScrollDown || canScrollUp) {
          return true;
        }
      }

      el = el.parentElement;
    }

    return false;
  }

  /**
   * Mouse Wheel & Trackpad Listener
   */
  onWheel = (e) => {
    if (this.checkIsLocked()) return;

    // If gesture is primarily horizontal (trackpad swipe left/right), let it pass to slider
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }

    if (this.isInsideScrollable(e.target, e.deltaY)) return;

    const maxScroll = this.getMaxScroll();
    // If the page cannot be scrolled (e.g. 100vh homepage), don't intercept wheel
    // so home interactions (like docking/selection cards) work naturally.
    if (maxScroll <= 0) return;

    // Normalize wheel delta across browsers & OS (Firefox lines vs Chrome pixels vs page)
    let delta = e.deltaY;
    if (e.deltaMode === 1) {
      delta *= 33; // DOM_DELTA_LINE
    } else if (e.deltaMode === 2) {
      delta *= 100; // DOM_DELTA_PAGE
    }

    // Filter minute trackpad vibrations
    if (Math.abs(delta) < 0.5) return;

    // Prevent stepped native scroll jump
    e.preventDefault();

    this.target += delta * this.options.wheelMultiplier;
    this.target = Math.max(0, Math.min(this.target, maxScroll));
  };

  /**
   * Keyboard Navigation (Arrows, PageUp/Down, Space, Home, End)
   */
  onKeyDown = (e) => {
    if (this.checkIsLocked()) return;

    // Don't intercept when user is typing in forms
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable)
    ) {
      return;
    }

    const maxScroll = this.getMaxScroll();
    if (maxScroll <= 0) return;

    let delta = 0;
    if (e.key === "ArrowDown") delta = this.options.keyboardStep;
    else if (e.key === "ArrowUp") delta = -this.options.keyboardStep;
    else if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
      delta = this.options.pageStep;
    } else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
      delta = -this.options.pageStep;
    } else if (e.key === "Home") {
      e.preventDefault();
      this.target = 0;
      return;
    } else if (e.key === "End") {
      e.preventDefault();
      this.target = maxScroll;
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      this.target = Math.max(0, Math.min(this.target + delta, maxScroll));
    }
  };

  /**
   * Touch & Swipe Listeners for mobile/tablets
   */
  onTouchStart = (e) => {
    if (this.checkIsLocked() || !e.touches || e.touches.length === 0) return;
    if (this.isInsideScrollable(e.target, 0)) return;

    const maxScroll = this.getMaxScroll();
    if (maxScroll <= 0) return;

    this.isTouchActive = true;
    this.touchStartY = e.touches[0].clientY;
    this.touchLastY = this.touchStartY;
    this.touchLastTime = performance.now();
    this.touchVelocity = 0;
  };

  onTouchMove = (e) => {
    if (!this.isTouchActive || !e.touches || e.touches.length === 0) return;

    const currentY = e.touches[0].clientY;
    const deltaY = this.touchLastY - currentY;
    const now = performance.now();
    const dt = now - this.touchLastTime;

    if (dt > 0) {
      this.touchVelocity = deltaY / dt;
    }

    this.touchLastY = currentY;
    this.touchLastTime = now;

    const maxScroll = this.getMaxScroll();
    this.target = Math.max(
      0,
      Math.min(this.target + deltaY * this.options.touchMultiplier, maxScroll)
    );
  };

  onTouchEnd = () => {
    if (!this.isTouchActive) return;
    this.isTouchActive = false;

    // Apply smooth flick momentum
    if (Math.abs(this.touchVelocity) > 0.15) {
      const momentum = this.touchVelocity * 280;
      const maxScroll = this.getMaxScroll();
      this.target = Math.max(0, Math.min(this.target + momentum, maxScroll));
    }
  };

  /**
   * Sync with native scroll (e.g. user drags scrollbar thumb or clicks anchor)
   */
  onNativeScroll = () => {
    if (this.isProgrammaticScroll) return;

    const actual = window.scrollY || 0;
    // If difference is substantial (dragged scrollbar thumb or jumped)
    if (Math.abs(actual - this.current) > 3) {
      this.current = actual;
      this.target = actual;
    }
  };

  /**
   * Handle Window Resize
   */
  onResize = () => {
    const maxScroll = this.getMaxScroll();
    this.target = Math.max(0, Math.min(this.target, maxScroll));
    this.current = Math.max(0, Math.min(this.current, maxScroll));
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  };

  /**
   * Bind all event listeners
   */
  bindEvents() {
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("touchstart", this.onTouchStart, { passive: true });
    window.addEventListener("touchmove", this.onTouchMove, { passive: true });
    window.addEventListener("touchend", this.onTouchEnd, { passive: true });
    window.addEventListener("scroll", this.onNativeScroll, { passive: true });
    window.addEventListener("resize", this.onResize);
  }

  /**
   * Unbind all event listeners
   */
  unbindEvents() {
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("touchstart", this.onTouchStart);
    window.removeEventListener("touchmove", this.onTouchMove);
    window.removeEventListener("touchend", this.onTouchEnd);
    window.removeEventListener("scroll", this.onNativeScroll);
    window.removeEventListener("resize", this.onResize);
  }

  /**
   * Frame animation loop via GSAP Ticker
   */
  startTicker() {
    this.tick = (time, deltaTime) => {
      if (this.destroyed) return;

      // When page scroll is locked (modal or docked), don't update
      if (this.checkIsLocked()) {
        this.target = window.scrollY || 0;
        this.current = this.target;
        return;
      }

      const maxScroll = this.getMaxScroll();
      if (maxScroll <= 0) {
        this.target = 0;
        this.current = 0;
        return;
      }

      this.target = Math.max(0, Math.min(this.target, maxScroll));

      // Delta time in seconds, clamped between 0.001 and 0.1s
      const dt = Math.max(0.001, Math.min(deltaTime / 1000, 0.1));

      // Delta-time independent lerp factor:
      // factor = 1 - (1 - smoothness)^(dt * 120)
      const factor = 1 - Math.pow(1 - this.options.smoothness, dt * 120);

      // Interpolate current towards target
      this.current += (this.target - this.current) * factor;

      // Snap when close enough to stop microscopic float updates
      if (Math.abs(this.target - this.current) < 0.2) {
        this.current = this.target;
      }

      // Perform the scroll
      this.isProgrammaticScroll = true;
      window.scrollTo(0, this.current);
      this.isProgrammaticScroll = false;

      // Keep GSAP ScrollTrigger perfectly synchronized on the exact same frame
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.update();
      }
    };

    gsap.ticker.add(this.tick);
  }

  /**
   * Smoothly scroll to a specific position or selector
   */
  scrollTo(targetPosition, { immediate = false, duration = 1 } = {}) {
    let dest = 0;
    if (typeof targetPosition === "string") {
      const el = document.querySelector(targetPosition);
      if (el) {
        dest = el.getBoundingClientRect().top + window.scrollY;
      }
    } else if (typeof targetPosition === "number") {
      dest = targetPosition;
    }

    const maxScroll = this.getMaxScroll();
    dest = Math.max(0, Math.min(dest, maxScroll));

    if (immediate) {
      this.target = dest;
      this.current = dest;
      window.scrollTo(0, dest);
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.update();
      }
      return;
    }

    gsap.to(this, {
      target: dest,
      duration,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  /**
   * Recalculate dimensions & sync
   */
  update() {
    this.onResize();
  }

  /**
   * Lock / Unlock scrolling
   */
  lock() {
    this.isLocked = true;
  }

  unlock() {
    this.isLocked = false;
  }

  /**
   * Destroy and clean up scroller
   */
  destroy() {
    this.destroyed = true;
    this.unbindEvents();
    if (this.tick) {
      gsap.ticker.remove(this.tick);
    }
    if (window.smoothScroller === this) {
      delete window.smoothScroller;
    }
    if (window.smoothScrollInstance === this) {
      delete window.smoothScrollInstance;
    }
  }
}

/**
 * Singleton factory helper
 */
let scrollerInstance = null;

export function initSmoothScroller(options = {}) {
  if (typeof window === "undefined") return null;
  if (!scrollerInstance) {
    scrollerInstance = new SmoothScroller(options);
  }
  return scrollerInstance;
}

export function getSmoothScroller() {
  return scrollerInstance;
}

export function destroySmoothScroller() {
  if (scrollerInstance) {
    scrollerInstance.destroy();
    scrollerInstance = null;
  }
}
/* === Smooth Scroller Module END === */

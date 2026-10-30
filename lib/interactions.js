"use client";

import { useState, useEffect } from "react";

/* === Interactions Hook Module START === */
export function useInteractions(options = {}) {
  const {
    enableWheelDock = true,
    enableWheelUndock = false,
    transitionDuration = 800,
  } = options;

  const checkShouldStartDocked = () => {
    if (typeof window === "undefined") return false;
    try {
      const search = window.location.search;
      const hasParam = search.includes("from=dock") || search.includes("from=selection");
      const hasSession = sessionStorage.getItem("expand_from_dock") === "true";
      return hasParam || hasSession;
    } catch (e) {
      return false;
    }
  };

  const [isOpeningFromDock, setIsOpeningFromDock] = useState(checkShouldStartDocked);
  const [isSelectionOpen, setIsSelectionOpen] = useState(checkShouldStartDocked);
  const [isDockActive, setIsDockActive] = useState(checkShouldStartDocked);
  const [dockScrollY, setDockScrollY] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isOpeningFromDock) {
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => {
          setIsOpeningFromDock(false);
          setIsSelectionOpen(false);
          setTimeout(() => {
            setIsDockActive(false);
            if (typeof window !== "undefined") {
              try {
                sessionStorage.removeItem("expand_from_dock");
                if (window.location.search.includes("from=dock") || window.location.search.includes("from=selection")) {
                  const cleanUrl = window.location.pathname;
                  window.history.replaceState({}, "", cleanUrl);
                }
              } catch (e) {}
            }
          }, transitionDuration + 50);
        });
      });

      return () => cancelAnimationFrame(r1);
    }
  }, [isOpeningFromDock, transitionDuration]);

  const openSelection = () => {
    if (isSelectionOpen) return;
    const currentScroll = typeof window !== "undefined" ? window.scrollY : 0;
    const currentHeight = typeof document !== "undefined" ? document.documentElement.scrollHeight : 0;
    setDockScrollY(currentScroll);
    setPageHeight(currentHeight);
    setIsDockActive(true);

    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSelectionOpen(true);
        });
      });
    } else {
      setIsSelectionOpen(true);
    }
  };

  const closeSelection = () => {
    if (!isSelectionOpen) return;
    setIsSelectionOpen(false);
    setTimeout(() => {
      setIsDockActive(false);
      if (typeof window !== "undefined") {
        window.scrollTo(0, dockScrollY);
      }
    }, transitionDuration);
  };

  const toggleSelection = () => {
    if (isSelectionOpen) {
      closeSelection();
    } else {
      openSelection();
    }
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    let isThrottled = false;
    let touchStartY = 0;

    // 1. Mouse Wheel & Trackpad Scroll Detection
    const handleWheel = (e) => {
      if (isMenuOpen || isThrottled) return;

      // Normalize delta across browsers/OS (Firefox lines vs Chrome pixels vs page mode)
      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 33; // DOM_DELTA_LINE (Firefox default)
      } else if (e.deltaMode === 2) {
        delta *= 100; // DOM_DELTA_PAGE
      }

      // Ignore accidental tiny vibrations
      if (Math.abs(delta) < 6) return;

      if (delta > 0) {
        // Scroll DOWN -> If enabled, dock page and reveal 4 selection cards
        if (enableWheelDock && !isSelectionOpen) {
          isThrottled = true;
          setTimeout(() => {
            isThrottled = false;
          }, 450);
          openSelection();
        }
      } else if (delta < 0) {
        // Scroll UP -> Only expand back if wheel undocking is enabled
        if (enableWheelUndock && isSelectionOpen) {
          isThrottled = true;
          setTimeout(() => {
            isThrottled = false;
          }, 450);
          closeSelection();
        }
      }
    };

    // 2. Mobile & Laptop Touchscreen / Touchpad Swipe Detection
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (isMenuOpen || isThrottled || !e.touches || e.touches.length === 0) return;

      const currentY = e.touches[0].clientY;
      const diffY = touchStartY - currentY; // positive = swipe up (scroll down)

      if (Math.abs(diffY) > 30) {
        if (diffY > 0) {
          // Swiped up -> Open Selection if enabled
          if (enableWheelDock && !isSelectionOpen) {
            isThrottled = true;
            setTimeout(() => {
              isThrottled = false;
            }, 450);
            openSelection();
          }
        } else {
          // Swiped down -> Only close if wheel undock is enabled
          if (enableWheelUndock && isSelectionOpen) {
            isThrottled = true;
            setTimeout(() => {
              isThrottled = false;
            }, 450);
            closeSelection();
          }
        }
        touchStartY = currentY;
      }
    };

    // 3. Keyboard Navigation (Arrows & Page Up/Down & Space & Escape)
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        closeSelection();
        return;
      }

      if (isMenuOpen || isThrottled) return;

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        if (enableWheelDock && !isSelectionOpen) {
          isThrottled = true;
          setTimeout(() => {
            isThrottled = false;
          }, 450);
          openSelection();
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (enableWheelUndock && isSelectionOpen) {
          isThrottled = true;
          setTimeout(() => {
            isThrottled = false;
          }, 450);
          closeSelection();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, isSelectionOpen, enableWheelDock, dockScrollY]);

  // Lock body scroll when selection is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isSelectionOpen || isDockActive) {
        document.body.classList.add("selection-open");
      } else {
        document.body.classList.remove("selection-open");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("selection-open");
      }
    };
  }, [isSelectionOpen, isDockActive]);

  return {
    isSelectionOpen,
    setIsSelectionOpen,
    isDockActive,
    isOpeningFromDock,
    dockScrollY,
    pageHeight,
    toggleSelection,
    openSelection,
    closeSelection,
    isMenuOpen,
    setIsMenuOpen,
    toggleMenu,
    openMenu,
    closeMenu,
  };
}
/* === Interactions Hook Module END === */

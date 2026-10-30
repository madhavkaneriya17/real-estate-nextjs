"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initSmoothScroller, getSmoothScroller } from "@/lib/smooth-scroll";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScrollProvider() {
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  useEffect(() => {
    const scroller = initSmoothScroller({
      smoothness: 0.042,    
      wheelMultiplier: 0.8, 
      touchMultiplier: 2.2,  
    });

    const resizeObserver = new ResizeObserver(() => {
      scroller?.update();
    });

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const scroller = getSmoothScroller();
    if (scroller) {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash) {
        setTimeout(() => {
          scroller.scrollTo(hash, { immediate: false, duration: 0.8 });
        }, 150);
      } else {
        scroller.scrollTo(0, { immediate: true });
      }

      requestAnimationFrame(() => {
        scroller.update();
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      });
    }
  }, [pathname]);

  return null;
}

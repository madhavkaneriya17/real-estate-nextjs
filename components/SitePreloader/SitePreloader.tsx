"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import "./SitePreloader.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create("bgWipe", "0.73, 0.15, 0.17, 0.99");
  } catch {
  }
}

const CONFIG = {
  counterSteps: [27, 42, 68, 92, 99],
  imageDelay: 0.50,               
  imageRevealDuration: 1.50,      
  imageRevealEase: "power4.out",  
  imageScaleFrom: 1.50,           
  counterEnterDuration: 0.85,     
  counterEnterEase: "power4.out", 
  counterTickDuration: 0.50,      
  counterTickEase: "expo.out",    
  exitRevealDelay: 0.80,          
  counterExitDuration: 0.95,      
  counterExitEase: "power3.in",   
  bgWipeDuration: 1.20,           
  bgWipeEase: "power3.inOut",
};

const PRELOADER_FRAMES = [
  { src: "/assets/bythesea-card-cover.avif", alt: "Coastal beachfront property" },
  { src: "/assets/evergreen-card-cover.avif", alt: "Golf course resort oasis" },
  { src: "/assets/urban-living-card-cover.avif", alt: "City center terrace" },
  { src: "/assets/rare-gems-card-cover.avif", alt: "Architectural luxury skyscraper tower" },
  { src: "/assets/hero-load-visual.avif", alt: "Woman relaxing on scenic coastal balcony" },
];

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SitePreloader() {
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const blueBgRef = useRef<HTMLDivElement>(null);
  const wipeLayerRef = useRef<HTMLDivElement>(null);
  const framesContainerRef = useRef<HTMLDivElement>(null);
  const counterMaskRef = useRef<HTMLDivElement>(null);
  const numberWrapperRef = useRef<HTMLDivElement>(null);
  const tensDigitRef = useRef<HTMLDivElement>(null);
  const onesDigitRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    PRELOADER_FRAMES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const blueBg = blueBgRef.current;
    const preloaderFrames = framesContainerRef.current;
    const numberWrapper = numberWrapperRef.current;
    const counterMask = counterMaskRef.current;
    const tens = tensDigitRef.current;
    const ones = onesDigitRef.current;

    if (!container || !blueBg || !preloaderFrames || !numberWrapper || !counterMask || !tens || !ones) {
      return;
    }

    const frameEls = container.querySelectorAll<HTMLElement>(".site-preloader__frame");
    const imgEls = container.querySelectorAll<HTMLElement>(".site-preloader__frame img");

    const getDigitYPercent = (digit: number) => {
      const clamped = Math.min(9, Math.max(0, digit));
      return -(clamped * 10);
    };

    const setCounter = (value: number, animate = true) => {
      const val = Math.min(99, Math.max(0, Math.round(value)));
      const tensVal = Math.floor(val / 10);
      const onesVal = val % 10;

      const tensY = getDigitYPercent(tensVal);
      const onesY = getDigitYPercent(onesVal);

      if (!animate) {
        gsap.set(tens, { yPercent: tensY, y: 0 });
        gsap.set(ones, { yPercent: onesY, y: 0 });
        return;
      }

      gsap.to(tens, {
        yPercent: tensY,
        y: 0,
        duration: CONFIG.counterTickDuration,
        ease: CONFIG.counterTickEase,
        overwrite: "auto",
      });

      gsap.to(ones, {
        yPercent: onesY,
        y: 0,
        duration: CONFIG.counterTickDuration,
        ease: CONFIG.counterTickEase,
        overwrite: "auto",
      });
    };

    const ctx = gsap.context(() => {

      document.body.classList.add("site-preloading");
      document.body.style.overflow = "hidden";

      gsap.set(container, { display: "grid", opacity: 1, visibility: "visible", pointerEvents: "auto" });
      if (wipeLayerRef.current) {
        gsap.set(wipeLayerRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      }
      gsap.set(preloaderFrames, { clearProps: "all", opacity: 1, yPercent: 0, y: 0 });

      frameEls.forEach((frame) => {
        const img = frame.querySelector("img");
        gsap.set(frame, { clipPath: "inset(50% 50% 50% 50%)" });
        if (img) gsap.set(img, { scale: CONFIG.imageScaleFrom, transformOrigin: "center center" });
      });

      gsap.set(counterMask, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(numberWrapper, { y: 0, yPercent: 100 });
      setCounter(CONFIG.counterSteps[0], false);

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.classList.remove("site-preloading");
          document.body.style.removeProperty("overflow");
          setIsVisible(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("site-preloader-complete"));
          }
        },
      });

  
      tl.fromTo(
        numberWrapper,
        { yPercent: 100, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: CONFIG.counterEnterDuration,
          ease: CONFIG.counterEnterEase,
        },
        0
      );

      
      frameEls.forEach((frame, index) => {
        const D = index * CONFIG.imageDelay;
        const img = imgEls[index];
        const targetNumber = CONFIG.counterSteps[index];

        
        if (index > 0) {
          tl.call(() => {
            setCounter(targetNumber, true);
          }, undefined, D);
        }

      
        tl.fromTo(
          frame,
          { clipPath: "inset(50% 50% 50% 50%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: CONFIG.imageRevealDuration,
            ease: CONFIG.imageRevealEase,
          },
          D
        );

    
        if (img) {
          tl.fromTo(
            img,
            { scale: CONFIG.imageScaleFrom },
            {
              scale: 1.0,
              duration: CONFIG.imageRevealDuration,
              ease: CONFIG.imageRevealEase,
            },
            D
          );
        }
      });

  
      const finalImageStartTime = (frameEls.length - 1) * CONFIG.imageDelay; 
      const exitStartTime = finalImageStartTime + CONFIG.exitRevealDelay;  

     
      tl.to(
        numberWrapper,
        {
          yPercent: -100,
          y: 0,
          duration: CONFIG.counterExitDuration,
          ease: CONFIG.counterExitEase,
        },
        exitStartTime
      );

      tl.to(
        counterMask,
        {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: CONFIG.counterExitDuration,
          ease: CONFIG.counterExitEase,
        },
        exitStartTime
      );

      tl.call(() => {
        if (container) {
          container.style.pointerEvents = "none";
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("site-preloader-exit"));
        }
      }, undefined, exitStartTime);

    
      // Blue wipe layer (contains both blue background and center image) wipes up together
      if (wipeLayerRef.current) {
        tl.to(
          wipeLayerRef.current,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: CONFIG.bgWipeDuration,
            ease: CustomEase.get("bgWipe") || CONFIG.bgWipeEase,
          },
          exitStartTime
        );
      }

      // Center image moves upward simultaneously as the blue curtain lifts
      tl.to(
        preloaderFrames,
        {
          yPercent: -60,
          duration: CONFIG.bgWipeDuration,
          ease: CustomEase.get("bgWipe") || CONFIG.bgWipeEase,
        },
        exitStartTime
      );

      tl.call(() => {
        document.body.classList.remove("site-preloading");
        document.body.style.removeProperty("overflow");
      }, undefined, exitStartTime + CONFIG.bgWipeDuration);
    }, container);

    return () => {
      document.body.classList.remove("site-preloading");
      document.body.style.removeProperty("overflow");
      ctx.revert();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      id="site-preloader"
      className="site-preloader"
      aria-hidden="true"
    >
      {/* Wipe Layer containing both Blue Fullscreen Background and Center Image Frames */}
      <div ref={wipeLayerRef} className="site-preloader__wipe-layer">
        <div
          ref={blueBgRef}
          id="preloaderBlueBg"
          className="site-preloader__bg site-preloader__bg--blue"
        />
        {/* 5 Center Cascading Image Frames */}
        <div
          ref={framesContainerRef}
          id="preloaderFrames"
          className="site-preloader__frames"
        >
          {PRELOADER_FRAMES.map((frame, index) => (
            <div
              key={frame.src}
              className={`site-preloader__frame ${
                index === PRELOADER_FRAMES.length - 1 ? "site-preloader__frame--final" : ""
              }`}
              data-index={index}
            >
              <img
                src={frame.src}
                alt={frame.alt}
                decoding="async"
                loading="eager"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>

        {/* Odometer Number Counter */}
        <div id="preloaderCounter" className="site-preloader__counter">
          <div ref={counterMaskRef} id="counterMask" className="site-preloader__counter-mask">
            <div ref={numberWrapperRef} id="numberWrapper" className="site-preloader__number-wrapper">
              {/* Tens Digit (0..9) */}
              <div className="site-preloader__digit site-preloader__digit--tens">
                <div ref={tensDigitRef} id="tensInner" className="site-preloader__digit-inner">
                  {DIGITS.map((n) => (
                    <span key={n} className="site-preloader__number">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              {/* Ones Digit (0..9) */}
              <div className="site-preloader__digit site-preloader__digit--ones">
                <div ref={onesDigitRef} id="onesInner" className="site-preloader__digit-inner">
                  {DIGITS.map((n) => (
                    <span key={n} className="site-preloader__number">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

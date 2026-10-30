import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* === Why Invest Parallax Animation START === */
/**
 * Initializes parallax movement for Why Invest images on scroll
 * @param {HTMLElement | Document} [container]
 * @returns {() => void} cleanup function
 */
export function initWhyInvestParallax(container) {
  if (typeof window === "undefined") return () => {};

  const root = container || document;
  const figures = root.querySelectorAll(".why-invest-image, .category-values__figure");
  if (!figures.length) return () => {};

  const travelY = 8;
  const scaleVal = 1.12;
  const scrubLag = 0.3;

  const ctx = gsap.context(() => {
    figures.forEach((fig, idx) => {
      const img = fig.querySelector("img");
      if (!img) return;

      gsap.set(img, {
        yPercent: -travelY,
        scale: scaleVal,
        force3D: true,
        transformOrigin: "center center",
      });

      gsap.fromTo(
        img,
        {
          yPercent: -travelY,
          scale: scaleVal,
        },
        {
          yPercent: travelY,
          scale: scaleVal,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            id: `why-invest-parallax-${idx}`,
            trigger: fig,
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
      }
    });
  }, root);

  return () => ctx.revert();
}
/* === Why Invest Parallax Animation END === */

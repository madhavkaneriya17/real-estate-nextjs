"use client";

import React, { useEffect, useRef } from "react";
import "./CategoryGallery.css";
import { initProjectsSlider } from "./slider-controller";

export interface GallerySlide {
  src: string;
  alt?: string;
}

export interface CategoryGalleryProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  slides?: GallerySlide[];
}

export const DEFAULT_GALLERY_SLIDES: GallerySlide[] = [
  { src: "/assets/BTS-1.avif", alt: "Luxury beachfront villa interior" },
  { src: "/assets/BTS-2.avif", alt: "Family enjoying coastal balcony" },
  { src: "/assets/BTS-3.avif", alt: "Relaxing on seafront beach lounger" },
  { src: "/assets/BTS-4.avif", alt: "Scenic seaside architecture" },
  { src: "/assets/BTS-5.avif", alt: "Sunlit ocean view terrace" },
  { src: "/assets/BTS-6.avif", alt: "Private infinity pool overlooking bay" },
  { src: "/assets/BTS-7.avif", alt: "Coastal marina promenade" },
  { src: "/assets/BTS-8.avif", alt: "Modern waterfront living room" },
  { src: "/assets/BTS-9.avif", alt: "Panoramic blue waters and coastline" },
  { src: "/assets/BTS-10.avif", alt: "Sunset by coastal resort" },
  { src: "/assets/BTS-11.avif", alt: "Luxury bedroom facing the sea" },
];

export const SERENE_GREENS_GALLERY_SLIDES: GallerySlide[] = [
  { src: "/assets/selection/evergreen/slider/ever-1_converted.avif", alt: "Resort villas and green landscapes" },
  { src: "/assets/selection/evergreen/slider/ever-2_converted.avif", alt: "Modern architecture surrounded by forest" },
  { src: "/assets/selection/evergreen/slider/ever-3_converted.avif", alt: "Golf resort fairways and clubhouse" },
  { src: "/assets/selection/evergreen/slider/ever-4_converted.avif", alt: "Luxury terrace overlooking verdant hills" },
  { src: "/assets/selection/evergreen/slider/ever-5_converted.avif", alt: "Serene infinity pool immersed in nature" },
  { src: "/assets/selection/evergreen/slider/ever-6_converted.avif", alt: "Park promenade and garden pathways" },
  { src: "/assets/selection/evergreen/slider/ever-7_converted.avif", alt: "Sunlit living room with forest vistas" },
  { src: "/assets/selection/evergreen/slider/ever-8_converted.avif", alt: "Private retreat in secluded greenery" },
  { src: "/assets/selection/evergreen/slider/ever-9_converted.avif", alt: "Championship golf course fairway" },
  { src: "/assets/selection/evergreen/slider/ever-10_converted.avif", alt: "Contemporary hillside residence" },
  { src: "/assets/selection/evergreen/slider/ever-11_converted.avif", alt: "Sunset glow across mountain ranges" },
  { src: "/assets/selection/evergreen/slider/ever-12_converted.avif", alt: "Elegant outdoor lounge under tree canopy" },
  { src: "/assets/selection/evergreen/slider/ever-13_converted.avif", alt: "Panoramic green valley views" },
  { src: "/assets/selection/evergreen/slider/ever-14_converted.avif", alt: "Architectural villa among ancient pines" },
];

export const URBAN_LUXE_GALLERY_SLIDES: GallerySlide[] = [
  { src: "/assets/selection/urbanliving/slider/urban-1_converted.avif", alt: "Modern urban high-rise residence" },
  { src: "/assets/selection/urbanliving/slider/urban-2_converted.avif", alt: "City center luxury apartment interior" },
  { src: "/assets/selection/urbanliving/slider/urban-3_converted.avif", alt: "Vibrant downtown promenade and cafes" },
  { src: "/assets/selection/urbanliving/slider/urban-4_converted.avif", alt: "Elegant rooftop terrace with skyline views" },
  { src: "/assets/selection/urbanliving/slider/urban-5_converted.avif", alt: "Contemporary living room in the city" },
  { src: "/assets/selection/urbanliving/slider/urban-6_converted.avif", alt: "Architectural metropolitan development" },
  { src: "/assets/selection/urbanliving/slider/urban-7_converted.avif", alt: "Historic stone architecture and cobblestone streets" },
  { src: "/assets/selection/urbanliving/slider/urban-8_converted.avif", alt: "Sophisticated boutique residence" },
  { src: "/assets/selection/urbanliving/slider/urban-9_converted.avif", alt: "City lights and evening urban ambiance" },
  { src: "/assets/selection/urbanliving/slider/urban-10_converted.avif", alt: "Prime downtown lifestyle location" },
];

export const COASTAL_HAVEN_GALLERY_SLIDES: GallerySlide[] = [
  { src: "/assets/selection/bythesea/coastal-luxury-pool-view.jpg", alt: "Private infinity pool overlooking azure bay" },
  { src: "/assets/selection/bythesea/luxury-coastal-villa-view-4k.jpg", alt: "Frontline beachfront luxury villa" },
  { src: "/assets/selection/bythesea/mediterranean-yachts-cove-4k.jpg", alt: "Private marina harbor and superyachts" },
  { src: "/assets/selection/bythesea/amalfi-cliffside-villas-4k.jpg", alt: "Dramatic cliffside Mediterranean residences" },
  { src: "/assets/selection/bythesea/santorini-infinity-pool.jpg", alt: "Sunset infinity pool terrace over the sea" },
  { src: "/assets/selection/bythesea/luxury-hotel-resort-4k.jpg", alt: "Five-star seafront resort amenities" },
  { src: "/assets/selection/bythesea/mediterranean-terrace-view.jpg", alt: "Sun-drenched outdoor terrace with sea views" },
  { src: "/assets/selection/bythesea/coastal-resort-ocean-view.jpg", alt: "Direct beach promenade living" },
  { src: "/assets/selection/bythesea/tropical-luxury-cove-4k.jpg", alt: "Secluded crystal-clear ocean cove" },
  { src: "/assets/selection/bythesea/luxury-infinity-sea-view-4k.jpg", alt: "Panoramic horizon and coastal architecture" },
];

export const LIMITED_EDITION_GALLERY_SLIDES: GallerySlide[] = [
  { src: "/assets/selection/raregems/slider/rare-1_converted.avif", alt: "A unique-concept residence with distinctive architecture" },
  { src: "/assets/selection/raregems/slider/rare-2_converted.avif", alt: "An exclusive one-of-a-kind property interior" },
  { src: "/assets/selection/raregems/slider/rare-3_converted.avif", alt: "A design-led home set in a rare location" },
  { src: "/assets/selection/raregems/slider/rare-4_converted.avif", alt: "A singular architectural statement residence" },
  { src: "/assets/selection/raregems/slider/rare-5_converted.avif", alt: "Iconic branded residences with panoramic views" },
  { src: "/assets/selection/raregems/slider/rare-6_converted.avif", alt: "Sculptural luxury development interior" },
  { src: "/assets/selection/raregems/slider/rare-7_converted.avif", alt: "Landmark architectural silhouette at dusk" },
  { src: "/assets/selection/raregems/slider/rare-8_converted.avif", alt: "Refined materials and bespoke craftsmanship" },
  { src: "/assets/selection/raregems/slider/rare-9_converted.avif", alt: "Exclusive cantilever terrace and private lounge" },
  { src: "/assets/selection/raregems/slider/rare-10_converted.avif", alt: "Trophy penthouse residence overlooking the horizon" },
];

export default function CategoryGallery({
  id = "gallery",
  className = "",
  style,
  label = "Urban Luxe",
  title = (
    <>
      Invest Where
      <br />
      Tourism, Lifestyle
      <br />
      &amp; Growth Meet
    </>
  ),
  description = "Live steps from shopping, fine dining, business hubs, and cultural attractions, combining everyday convenience with the comfort of modern city living.",
  slides = DEFAULT_GALLERY_SLIDES,
}: CategoryGalleryProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = initProjectsSlider(containerRef.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, [slides]);

  return (
    <section
      ref={containerRef}
      className={`category-gallery ${className}`.trim()}
      id={id}
      style={style}
    >
      {/* === Category Gallery Intro Header START === */}
      <div className="category-gallery-intro">
        <span className="category-gallery-intro__line" aria-hidden="true" />
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {/* === Category Gallery Intro Header END === */}

      {/* === Projects Slider Carousel START === */}
      <div
        className="projects-slider"
        data-slider-label={label}
        aria-roledescription="carousel"
      >
        <div className="projects-slider-viewport">
          <div className="projects-slider-track">
            {slides.map((slide, index) => (
              <div className="projects-slider-item" key={index}>
                <img
                  src={slide.src}
                  alt={slide.alt || `Slide ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="projects-slider-nav">
          <button
            type="button"
            className="projects-slider-arrow projects-slider-prev"
            aria-label="Previous slide"
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="36"
                cy="36"
                r="35"
                transform="rotate(90 36 36)"
                stroke="#14121A"
                strokeWidth="1.67"
              />
              <path
                d="M35.5 42.7L28.4 35.6L35.5 28.5M29.4 35.6H43.8"
                stroke="#14121A"
                strokeWidth="2.37"
                strokeMiterlimit="10"
                strokeLinecap="square"
              />
            </svg>
          </button>
          <button
            type="button"
            className="projects-slider-arrow projects-slider-next"
            aria-label="Next slide"
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="36"
                cy="36"
                r="35"
                transform="rotate(-90 36 36)"
                stroke="#14121A"
                strokeWidth="1.67"
              />
              <path
                d="M36.5 29.3L43.6 36.4L36.5 43.5M42.6 36.4H28.2"
                stroke="#14121A"
                strokeWidth="2.37"
                strokeMiterlimit="10"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* === Projects Slider Carousel END === */}
    </section>
  );
}

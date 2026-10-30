"use client";

import React, { useEffect, useRef } from "react";
import "./WhyInvestSection.css";
import { initWhyInvestParallax } from "./why-invest-parallax";

export interface WhyInvestItem {
  imageSrc: string;
  imageAlt?: string;
  index?: string;
  title: React.ReactNode;
  text: React.ReactNode;
  reverse?: boolean;
}

export interface WhyInvestQuote {
  text: React.ReactNode;
  name: string;
  source: string;
}

export interface WhyInvestSectionProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  items?: WhyInvestItem[];
  quote?: WhyInvestQuote | null;
}

export const ABOUT_PAGE_WHY_INVEST_ITEMS: WhyInvestItem[] = [
  {
    index: "(01)",
    imageSrc: "/assets/strategic-location-converted.avif",
    imageAlt: "Luxury coastal marina with yachts and palm trees",
    title: (
      <>
        Strategic
        <br />
        Location
      </>
    ),
    text: "Highly sought-after locations where limited supply and sustained demand create long-term appreciation and above-average returns.",
    reverse: false,
  },
  {
    index: "(02)",
    imageSrc: "/assets/added-value-converted.avif",
    imageAlt: "Modern waterfront development at golden hour",
    title: (
      <>
        Added
        <br />
        Value
      </>
    ),
    text: "A distinctive concept, world-class amenities, and premium services that enhance the living experience and drive stronger demand, occupancy, and long-term value.",
    reverse: true,
  },
  {
    index: "(03)",
    imageSrc: "/assets/masterplan-development-converted.avif",
    imageAlt: "People enjoying outdoor dining by the sea",
    title: (
      <>
        Masterplan
        <br />
        Development
      </>
    ),
    text: "“The next best thing” - a fully planned communities that integrate residential living, lifestyle amenities, and infrastructure and has the biggest potential for accelerating growth and demand.",
    reverse: false,
  },
  {
    index: "(04)",
    imageSrc: "/assets/exceptional-management-converted.avif",
    imageAlt: "Clients toasting at an outdoor table overlooking a marina",
    title: (
      <>
        Exceptional
        <br />
        Management
      </>
    ),
    text: "Professional property management that ensures the highest standards of maintenance, supporting exceptional guest experiences and consistently high ratings on leading travel platforms.",
    reverse: true,
  },
];

export const DEFAULT_WHY_INVEST_ITEMS: WhyInvestItem[] = [
  {
    imageSrc: "/assets/selection/urbanliving/urban-living-stats-1_converted.avif",
    imageAlt: "Historic city street at dusk with outdoor café seating",
    title: (
      <>
        Year-Round
        <br />
        Demand
      </>
    ),
    text: "Historic city centers combine walkability, cultural appeal, and limited supply - three of the strongest drivers of long-term real estate value.",
    reverse: false,
  },
  {
    imageSrc: "/assets/selection/urbanliving/urban-living-stats-2_converted.avif",
    imageAlt: "Woman standing between classical stone columns in an urban setting",
    title: (
      <>
        Walkable
        <br />
        Premiums
      </>
    ),
    text: "Walkable locations can achieve property value premiums of up to 10% compared to less walkable areas.",
    reverse: true,
  },
  {
    imageSrc: "/assets/selection/urbanliving/urban-living-stats-3_converted.avif",
    imageAlt: "Couple dining at a candlelit outdoor table at night",
    title: (
      <>
        Unmatched
        <br />
        Living
      </>
    ),
    text: "Proximity to dining, culture, shopping, and entertainment enhances both lifestyle appeal and long-term capital appreciation.",
    reverse: false,
  },
];

export const DEFAULT_WHY_INVEST_QUOTE: WhyInvestQuote = {
  text: "Walkability is no longer something that is merely nice to have or a luxury. It is a key to economic competitiveness.",
  name: "Urban Land Institute",
  source: "/ Making the Economic Case for More Walkability / 2015",
};

export const COASTAL_HAVEN_WHY_INVEST_ITEMS: WhyInvestItem[] = [
  {
    imageSrc: "/assets/BTS-2.avif",
    imageAlt: "High Demand Waterfront property",
    title: (
      <>
        High
        <br />
        Demand
      </>
    ),
    text: "Waterfront properties consistently outperform inland homes due to their scarcity and enduring global demand.",
    reverse: false,
  },
  {
    imageSrc: "/assets/women-montenegro.avif",
    imageAlt: "Price Premiums Beachfront property",
    title: (
      <>
        Price
        <br />
        Premiums
      </>
    ),
    text: "Beachfront properties command average price premiums of 40%, with prime beachfront homes reaching premiums of up to 76%.",
    reverse: true,
  },
  {
    imageSrc: "/assets/BTS-4.avif",
    imageAlt: "Limited Supply coastal homes",
    title: (
      <>
        Limited
        <br />
        Supply
      </>
    ),
    text: "Limited coastal supply supports long-term capital appreciation and market resilience.",
    reverse: false,
  },
];

export const COASTAL_HAVEN_WHY_INVEST_QUOTE: WhyInvestQuote = {
  text: "Waterfront properties are also amongst the most liquid. Even in a depressed market, due to their position and scarcity, a front-line waterfront property will face strong demand with prospective buyers aware that their future exit strategy is also secure.",
  name: "Knight Frank",
  source: "/ Global Waterfront Report / 2019",
};

export const SERENE_GREENS_WHY_INVEST_ITEMS: WhyInvestItem[] = [
  {
    imageSrc: "/assets/selection/evergreen/evergreen-stats-1_converted.avif",
    imageAlt: "Couple sitting together by a resort swimming pool",
    title: (
      <>
        15%
        <br />
        CAGR
      </>
    ),
    text: "Wellness real estate commands price premiums of 10–25%, higher long-term occupancy rates and is one of the fastest-growing sectors in the global property market.",
    reverse: false,
  },
  {
    imageSrc: "/assets/selection/evergreen/evergreen-stats-2_converted.avif",
    imageAlt: "Aerial view of a master-planned green community with tree-lined streets",
    title: (
      <>
        Masterplan
        <br />
        Evergreen
      </>
    ),
    text: "Homes in Master-planned green communities can achieve price premiums of 5–20% compared to comparable urban developments, attracting both end-users and long-term investors.",
    reverse: true,
  },
  {
    imageSrc: "/assets/selection/evergreen/evergreen-stats-3_converted.avif",
    imageAlt: "Hand wearing a white golf glove gripping a golf club",
    title: (
      <>
        Golf
        <br />
        Premium
      </>
    ),
    text: "Homes within golf resorts worth approximately 19% more than comparable properties, while homes with golf course views add an additional 9–10% premium.",
    reverse: false,
  },
  {
    imageSrc: "/assets/selection/evergreen/evergreen-stats-4_converted.avif",
    imageAlt: "Grandfather giving his grandson a piggyback ride on a golf course",
    title: (
      <>
        Lifestyle
        <br />
        Driven
      </>
    ),
    text: "Over 67% of golf resort buyers are non-golfers, demonstrating that lifestyle, not the sport, is the primary demand driver.",
    reverse: true,
  },
  {
    imageSrc: "/assets/selection/evergreen/evergreen-stats-5_converted.avif",
    imageAlt: "Family having a picnic on a grassy lawn in a park",
    title: (
      <>
        Resilient
        <br />
        Demand
      </>
    ),
    text: "Lifestyle-driven real estate developments tend to show greater demand stability across changing market cycles.",
    reverse: false,
  },
];

export const SERENE_GREENS_WHY_INVEST_QUOTE: WhyInvestQuote = {
  text: "From branded wellness clubs to private dining spaces, community is the new currency in luxury real estate.",
  name: "Knight Frank",
  source: "/ Global Waterfront Report / 2019",
};

export default function WhyInvestSection({
  id = "why-invest",
  className = "",
  style,
  items = DEFAULT_WHY_INVEST_ITEMS,
  quote = DEFAULT_WHY_INVEST_QUOTE,
}: WhyInvestSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cleanup = initWhyInvestParallax(sectionRef.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`why-invest-section ${className}`.trim()}
      style={style}
    >
      {/* === Why Invest Value Rows START === */}
      <div className="why-invest-value">
        {items.map((item, index) => (
          <article
            key={index}
            className={`why-invest-row ${item.reverse ? "why-invest-row--reverse" : ""}`.trim()}
          >
            {item.reverse ? (
              <>
                <div className="why-invest-content">
                  {item.index && <p className="about-page__pillar-index">{item.index}</p>}
                  <h3 className="why-invest-content-title">{item.title}</h3>
                  <p className="why-invest-content-text">{item.text}</p>
                </div>
                <figure className="why-invest-image">
                  <img src={item.imageSrc} alt={item.imageAlt || ""} />
                </figure>
              </>
            ) : (
              <>
                <figure className="why-invest-image">
                  <img src={item.imageSrc} alt={item.imageAlt || ""} />
                </figure>
                <div className="why-invest-content">
                  {item.index && <p className="about-page__pillar-index">{item.index}</p>}
                  <h3 className="why-invest-content-title">{item.title}</h3>
                  <p className="why-invest-content-text">{item.text}</p>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      {/* === Why Invest Value Rows END === */}

      {/* === Why Invest Pull Quote START === */}
      {quote && (
        <div className="why-invest-bottom-content category-pull-quote">
          <h2 className="category-pull-quote__text">
            <span className="why-invest-bottom-quote-mark category-pull-quote__mark">“</span>
            {quote.text}
          </h2>
          <div className="why-invest-bottom-content-attrib category-pull-quote__attrib">
            <p className="why-invest-bottom-content-name category-quote__name">
              {quote.name}
            </p>
            <p className="why-invest-bottom-content-source category-quote__source">
              {quote.source}
            </p>
          </div>
        </div>
      )}
      {/* === Why Invest Pull Quote END === */}
    </section>
  );
}

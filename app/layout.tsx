import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import SitePreloader from "@/components/SitePreloader";

export const metadata: Metadata = {
  title: "Realevate | Exceptional Real Estate Investments in Cyprus, Montenegro & Georgia",
  description: "Invest in Exceptional Real Estate Properties in Cyprus, Montenegro, and Georgia.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical fonts to avoid render-blocking */}
        <link
          rel="preload"
          href="/fonts/sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/serif.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preload hero LCP image discovery */}
        <link
          rel="preload"
          href="/assets/bythesea-card-cover-500w.avif"
          as="image"
          type="image/avif"
          fetchPriority="high"
          media="(max-width: 640px)"
        />
        <link
          rel="preload"
          href="/assets/bythesea-card-cover.avif"
          as="image"
          type="image/avif"
          fetchPriority="high"
          media="(min-width: 641px)"
        />
      </head>
      <body>
        <SitePreloader />
        <SmoothScrollProvider />
        {children}
      </body>
    </html>
  );
}

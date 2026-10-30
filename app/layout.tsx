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
      <body>
        <SitePreloader />
        <SmoothScrollProvider />
        {children}
      </body>
    </html>
  );
}

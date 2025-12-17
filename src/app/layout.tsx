import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import CSSLoader from "../components/CSSLoader";
import BackToTop from "../components/BackToTop";
import "../styles/critical.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const noto = Noto_Sans_Devanagari({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sajhanewsonline.com"),
  title: {
    default: "Sajha News Online - Nepal News & Headlines",
    template: "%s | Sajha News Online",
  },
  description:
    "Sajha News Online brings breaking news, politics, business, sports, entertainment, and the latest updates from Nepal and worldwide.",
  keywords: [
    "Sajha News Online",
    "Nepali News",
    "Nepal News",
    "Breaking News Nepal",
    "Nepal Politics",
    "Nepal Sports",
    "Nepal Business",
    "Nepal Entertainment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Sajha News Online",
    title: "Sajha News Online - Nepal News & Headlines",
    description:
      "Breaking news and the latest updates from Nepal and worldwide.",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Sajha News Online",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@sajhanewsonline",
    creator: "@sajhanewsonline",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${noto.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Sajha News Online",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://sajhanewsonline.com",
              logo: "/images/logo.png",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sajha News Online",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://sajhanewsonline.com",
              potentialAction: {
                "@type": "SearchAction",
                target: `${
                  process.env.NEXT_PUBLIC_SITE_URL || "https://sajhanewsonline.com"
                }/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.setAttribute('data-theme', 'light');
            `,
          }}
        />
      </head>
      <SpeedInsights />
      <body suppressHydrationWarning={true}>
        <CSSLoader />
        <Suspense fallback={<div className="loading">Loading...</div>}>{children}</Suspense>
        <BackToTop />
      </body>
    </html>
  );
}


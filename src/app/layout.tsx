import type { Metadata } from "next";
import { Suspense } from "react";
import BackToTop from "../components/BackToTop";
import Footer from "../components/Footer";
import {
  BRAND_DESCRIPTION,
  BRAND_DOMAIN,
  BRAND_LOGO_PATH,
  BRAND_NAME,
  BRAND_NAME_DEVANAGARI,
  BRAND_SITE_URL,
  BRAND_TAGLINE,
} from "../lib/brand";
import "../styles/globals.css";
import "../styles/critical.css";
import "../styles/header.css";
import "../styles/news-feed.css";
import "../styles/lazy-image.css";
import "../styles/footer.css";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL),
  title: {
    default: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    BRAND_NAME,
    BRAND_NAME_DEVANAGARI,
    BRAND_DOMAIN,
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
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: 1032,
        height: 242,
        alt: `${BRAND_NAME} logo`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    images: [BRAND_LOGO_PATH],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Inter (Latin) + Mukta (Devanagari) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Mukta:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: BRAND_NAME,
              alternateName: BRAND_NAME_DEVANAGARI,
              url: process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL,
              logo: BRAND_LOGO_PATH,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: BRAND_NAME,
              alternateName: BRAND_NAME_DEVANAGARI,
              url: process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL,
              description: BRAND_DESCRIPTION,
              potentialAction: {
                "@type": "SearchAction",
                target: `${
                  process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL
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
        <Suspense fallback={<div className="loading">Loading...</div>}>{children}</Suspense>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}

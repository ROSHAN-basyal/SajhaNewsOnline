import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import CSSLoader from "../components/CSSLoader";
import "../styles/critical.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const noto = Noto_Sans_Devanagari({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://newznepal.com"),
  title: {
    default: "NewzNepal.com - Breaking News & Latest Updates from Nepal",
    template: "%s | NewzNepal.com",
  },
  description:
    "NewzNepal.com - Your trusted source for breaking news, politics, sports, entertainment, and latest updates from Nepal and around the world. Stay informed 24/7.",
  keywords: [
    "Nepali News",
    "Best Nepali News",
    "Breaking News Nepal",
    "Nepal Politics",
    "Nepal Sports",
    "Nepal Entertainment",
    "Latest News Nepal",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "NewzNepal.com",
    title: "NewzNepal.com - Breaking News & Latest Updates from Nepal",
    description:
      "Your trusted source for breaking news, politics, sports, entertainment, and latest updates from Nepal and worldwide.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "NewzNepal.com",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@newznepal",
    creator: "@newznepal",
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
        {/* Organization + WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'NewzNepal.com',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://newznepal.com',
              logo: '/og-default.jpg'
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'NewzNepal.com',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://newznepal.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://newznepal.com'}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set light theme only
              document.documentElement.setAttribute('data-theme', 'light');
              document.documentElement.style.setProperty('--post-content-color', '#1a202c');
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <CSSLoader />
        <Suspense fallback={<div className="loading">Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}

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
    default: "NEWZNEPAL - Stay Informed Stay ahead",
    template: "%s | NEWZNEPAL",
  },
  description:
    "NEWZNEPAL - Stay informed, stay ahead with breaking news, politics, sports, entertainment, and the latest updates from Nepal and around the world.",
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
    siteName: "NEWZNEPAL",
    title: "NEWZNEPAL - Stay Informed Stay ahead",
    description:
      "Stay informed, stay ahead with breaking news and the latest updates from Nepal and worldwide.",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "NEWZNEPAL",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NEWZNEPAL",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://newznepal.com",
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
              name: "NEWZNEPAL",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://newznepal.com",
              potentialAction: {
                "@type": "SearchAction",
                target: `${
                  process.env.NEXT_PUBLIC_SITE_URL || "https://newznepal.com"
                }/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
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
        <Suspense fallback={<div className="loading">Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}


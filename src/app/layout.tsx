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
  title: "NewzNepal.com - Breaking News & Latest Updates from Nepal",
  description:
    "NewzNepal.com - Your trusted source for breaking news, politics, sports, entertainment, and latest updates from Nepal and around the world. Stay informed 24/7.",
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

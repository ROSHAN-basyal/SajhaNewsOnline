import type { Metadata } from "next";
import { Suspense } from "react";
import CSSLoader from "../components/CSSLoader";
import { ThemeProvider } from "../lib/themeContext";
import "../styles/critical.css";

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
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <CSSLoader />
          <Suspense fallback={<div className="loading">Loading...</div>}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

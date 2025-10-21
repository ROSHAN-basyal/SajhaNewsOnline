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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
                
                // Set CSS custom property for immediate styling
                const root = document.documentElement;
                if (theme === 'dark') {
                  root.style.setProperty('--post-content-color', '#f7fafc');
                } else {
                  root.style.setProperty('--post-content-color', '#1a202c');
                }
                
                // Mobile-specific fixes
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                  // Force immediate color application on mobile
                  const style = document.createElement('style');
                  style.textContent = \`
                    .post-full-content {
                      color: \${theme === 'dark' ? '#f7fafc' : '#1a202c'} !important;
                      -webkit-text-fill-color: \${theme === 'dark' ? '#f7fafc' : '#1a202c'} !important;
                      opacity: 1 !important;
                    }
                  \`;
                  document.head.appendChild(style);
                }
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.style.setProperty('--post-content-color', '#1a202c');
              }
            `,
          }}
        />
      </head>
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

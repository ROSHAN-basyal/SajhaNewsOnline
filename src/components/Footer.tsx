"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BRAND_LOGO_PATH,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_NAME_DEVANAGARI,
} from "../lib/brand";
import { NEWS_CATEGORIES, getCategoryLabel } from "../lib/supabase";
import "../styles/footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname?.startsWith("/secret-admin-portal")) {
    return null;
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__logoLink" aria-label={`${BRAND_NAME} - Home`}>
            <Image
              className="site-footer__logo"
              src={BRAND_LOGO_PATH}
              alt={`${BRAND_NAME} logo`}
              width={1032}
              height={242}
            />
          </Link>
          <p className="site-footer__tagline">{BRAND_TAGLINE}</p>
          <p className="site-footer__desc">
            {BRAND_NAME_DEVANAGARI} — नेपाल र विश्वभरका ताजा अपडेट, मूलबाट आएका रिपोर्ट र
            स्पष्ट समाचार कवरेज।
          </p>
        </div>

        <div className="site-footer__nav">
          <h4 className="site-footer__heading">श्रेणीहरू</h4>
          <ul className="site-footer__links">
            {NEWS_CATEGORIES.map((cat) => (
              <li key={cat}>
                <Link href={`/?category=${cat}`} className="site-footer__link">
                  {getCategoryLabel(cat, "ne")}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__nav">
          <h4 className="site-footer__heading">Quick Links</h4>
          <ul className="site-footer__links">
            <li>
              <Link href="/" className="site-footer__link">
                गृहपृष्ठ
              </Link>
            </li>
            <li>
              <Link href="/rss" className="site-footer__link">
                RSS Feed
              </Link>
            </li>
          </ul>
        </div>

        <div className="site-footer__nav">
          <h4 className="site-footer__heading">सम्पर्क</h4>
          <div className="site-footer__social">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__socialBtn"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M15 8h2.5l-1 4H15v8h-4v-8H8V8h3V6.5A3.5 3.5 0 0 1 14.5 3H18v3h-2a1 1 0 0 0-1 1V8Z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__socialBtn"
              aria-label="X"
              title="X"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2H21l-6.529 7.46L22 22h-6.828l-4.804-6.253L4.9 22H2.142l6.99-7.987L2 2h6.914l4.41 5.79L18.244 2Zm-1.195 18h1.872L7.03 4H5.06L17.05 20Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottomInner">
          <p className="site-footer__copy">
            &copy; {currentYear} {BRAND_NAME}. सर्वाधिकार सुरक्षित।
          </p>
        </div>
      </div>
    </footer>
  );
}

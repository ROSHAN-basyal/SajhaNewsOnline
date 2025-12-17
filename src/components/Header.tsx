"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import CategoryNav from "./CategoryNav";
import { NewsCategory } from "../lib/supabase";
import "../styles/header.css";
import NepaliClock from "./NepaliClock";
import CityStatusWidget from "./CityStatusWidget";

type HeaderProps = {
  activeCategory: NewsCategory | "all";
  onCategoryChange: (category: NewsCategory | "all") => void;
};

export default function Header({ activeCategory, onCategoryChange }: HeaderProps) {
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const update = () => {
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-bar-h", `${Math.ceil(height)}px`);
    };

    update();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }

    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, []);

  return (
    <>
      <header ref={barRef} className="site-header__bar" role="banner">
        <div className="container site-header__barInner">
          <div className="site-header__leftMeta">
            <NepaliClock />
          </div>

          <Link href="/" aria-label="Sajha News Online - Home" className="site-header__title">
            <span className="site-header__titleRow">
              <span className="site-header__titleIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  <path d="M8 8h8M8 12h8M8 16h6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="brand__name">Sajha News Online</span>
            </span>
            <span className="brand__tagline">नेपाललाई जोड्ने समाचार।</span>
          </Link>

          <div className="site-header__side">
            <CityStatusWidget align="right" />
          </div>
        </div>
      </header>

      <div className="site-header">
        <div className="site-header__navWrap" aria-label="श्रेणी नेभिगेसन">
          <div className="container">
            <div className="site-header__nav">
              <CategoryNav
                activeCategory={activeCategory}
                onCategoryChange={onCategoryChange}
                variant="header"
                locale="ne"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

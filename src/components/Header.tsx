"use client";

import Link from "next/link";
import CategoryNav from "./CategoryNav";
import { NewsCategory } from "../lib/supabase";
import "../styles/header.css";

type HeaderProps = {
  activeCategory: NewsCategory | "all";
  onCategoryChange: (category: NewsCategory | "all") => void;
};

export default function Header({ activeCategory, onCategoryChange }: HeaderProps) {
  return (
    <header className="site-header" role="banner">
      <div className="container site-header__inner">
        <div className="site-header__top">
          <Link href="/" aria-label="Sajha News Online - Home" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/images/logo.png" alt="" />
            <span className="brand__copy">
              <span className="brand__name">Sajha News Online</span>
              <span className="brand__tagline">News that connects Nepal.</span>
            </span>
          </Link>

          <CategoryNav
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            variant="header"
            className="site-header__categoryNav"
          />
        </div>
      </div>
    </header>
  );
}

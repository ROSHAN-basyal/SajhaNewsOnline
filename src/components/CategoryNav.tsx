"use client";

import { ConsumerLocale, NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from "../lib/supabase";
import "../styles/category-nav.css";

type CategoryNavProps = {
  activeCategory: NewsCategory | "all";
  onCategoryChange: (category: NewsCategory | "all") => void;
  variant?: "header" | "sidebar";
  className?: string;
  locale?: ConsumerLocale;
};

export default function CategoryNav({
  activeCategory,
  onCategoryChange,
  variant = "sidebar",
  className = "",
  locale = "en",
}: CategoryNavProps) {
  return (
    <nav
      className={`category-nav category-nav--${variant} ${className}`.trim()}
      aria-label={locale === "ne" ? "समाचार श्रेणीहरू" : "News categories"}
    >
      <button
        type="button"
        className={`category-nav__item ${activeCategory === "all" ? "is-active" : ""}`}
        onClick={() => onCategoryChange("all")}
        aria-current={activeCategory === "all" ? "page" : undefined}
      >
        {getCategoryLabel("all", locale)}
      </button>

      {NEWS_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-nav__item ${activeCategory === category ? "is-active" : ""}`}
          onClick={() => onCategoryChange(category)}
          aria-current={activeCategory === category ? "page" : undefined}
        >
          {getCategoryLabel(category, locale)}
        </button>
      ))}
    </nav>
  );
}

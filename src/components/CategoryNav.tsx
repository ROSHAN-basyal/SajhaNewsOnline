"use client";

import { NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from "../lib/supabase";
import "../styles/category-nav.css";

type CategoryNavProps = {
  activeCategory: NewsCategory | "all";
  onCategoryChange: (category: NewsCategory | "all") => void;
  variant?: "header" | "sidebar";
  className?: string;
};

export default function CategoryNav({
  activeCategory,
  onCategoryChange,
  variant = "sidebar",
  className = "",
}: CategoryNavProps) {
  return (
    <nav
      className={`category-nav category-nav--${variant} ${className}`.trim()}
      aria-label="News categories"
    >
      <button
        type="button"
        className={`category-nav__item ${activeCategory === "all" ? "is-active" : ""}`}
        onClick={() => onCategoryChange("all")}
        aria-current={activeCategory === "all" ? "page" : undefined}
      >
        {getCategoryLabel("all")}
      </button>

      {NEWS_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-nav__item ${activeCategory === category ? "is-active" : ""}`}
          onClick={() => onCategoryChange(category)}
          aria-current={activeCategory === category ? "page" : undefined}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </nav>
  );
}

"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from '../lib/supabase'
import '../styles/header.css'
import '../styles/header-mobile.css'

interface HeaderProps {
  activeCategory: string
  onCategoryChange: (category: NewsCategory | 'all') => void
}

export default function Header({ activeCategory, onCategoryChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleCategoryClick = (category: NewsCategory | 'all') => {
    onCategoryChange(category)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="header-content">
          <div className="logo-container">
            <h1 className="logo">
              <Link href="/" aria-label="NEWZNEPAL - Home" className="logo-link">
                <img className="logo-image" src="/images/logo.png" alt="NEWZNEPAL" />
                <span className="logo-copy">
                  <span className="logo-text">NEWZNEPAL</span>
                  <span className="logo-slogan">Stay Informed Stay ahead</span>
                </span>
              </Link>
            </h1>
          </div>

          <button
            type="button"
            className={`hamburger ${isMenuOpen ? 'is-active' : ''}`}
            aria-label="Toggle navigation menu"
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span className="hamburger-box">
              <span className="hamburger-inner" />
            </span>
          </button>

          <nav
            id="primary-navigation"
            className={`nav-menu ${isMenuOpen ? 'open' : ''}`}
            role="navigation"
            aria-label="News categories"
          >
            <button
              className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
              aria-pressed={activeCategory === 'all'}
              aria-label="Show all news articles"
            >
              {getCategoryLabel('all')}
            </button>
            {NEWS_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`nav-link ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
                aria-pressed={activeCategory === category}
                aria-label={`Show ${category} news articles`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </nav>

          {isMenuOpen && (
            <button
              type="button"
              className="nav-backdrop"
              aria-label="Close navigation menu"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  )
}

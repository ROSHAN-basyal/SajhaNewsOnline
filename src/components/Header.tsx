"use client"

import { NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from '../lib/supabase'
import '../styles/header.css'
import '../styles/header-mobile.css'
import { useEffect, useState } from 'react'

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

  // Close on Escape
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
              <span aria-label="Newznepal.com - Home">Newznepal.com</span>
            </h1>
            <p className="logo-slogan">विश्वसनीय समचार हाम्रो प्रतिबद्धता</p>
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

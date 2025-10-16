'use client'

import { NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from '../lib/supabase'
import dynamic from 'next/dynamic'
import '../styles/header.css'

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { 
  ssr: false, 
  loading: () => (
    <button className="theme-toggle" disabled aria-label="Loading theme toggle">
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          <span className="theme-icon">🌙</span>
        </div>
      </div>
    </button>
  )
})

interface HeaderProps {
  activeCategory: string
  onCategoryChange: (category: NewsCategory | 'all') => void
}

export default function Header({ activeCategory, onCategoryChange }: HeaderProps) {
  const handleCategoryClick = (category: NewsCategory | 'all') => {
    onCategoryChange(category)
  }


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
          <div className="header-right">
            <nav className="nav-menu" role="navigation" aria-label="News categories">
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
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
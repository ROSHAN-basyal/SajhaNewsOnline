'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { NewsCategory } from '../lib/supabase'

const Header = dynamic(() => import('../components/Header'), {
  ssr: true,
})

const NewsFeed = dynamic(() => import('../components/NewsFeed'), {
  ssr: true,
  loading: () => <LoadingSkeleton />,
})

const Sidebar = dynamic(() => import('../components/Sidebar'), {
  ssr: true,
  loading: () => <div className="sidebar-loading">Loading sidebar...</div>,
})

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const handleCategoryChange = (category: NewsCategory | 'all') => {
    setActiveCategory(category)
  }

  return (
    <div className="app-layout">
      <Header 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <div className="main-content">
        <NewsFeed activeCategory={activeCategory} />
        <Sidebar />
      </div>
    </div>
  )
}
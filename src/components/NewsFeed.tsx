'use client'

import { useState, useEffect } from 'react'
import { supabase, NewsPost, NewsCategory } from '../lib/supabase'
import NewsPostCard from './NewsPostCard'
import '../styles/news-feed.css'

interface NewsFeedProps {
  activeCategory: string
}

export default function NewsFeed({ activeCategory }: NewsFeedProps) {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const POSTS_PER_PAGE = 10

  useEffect(() => {
    fetchPosts()
  }, [activeCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = async (pageNumber = 0, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      let query = supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter by category if not 'all'
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory)
      }

      const { data, error } = await query
        .range(pageNumber * POSTS_PER_PAGE, (pageNumber + 1) * POSTS_PER_PAGE - 1)

      if (error) throw error

      if (append) {
        setPosts(prev => [...prev, ...data])
      } else {
        setPosts(data)
        setPage(0)
      }

      setHasMore(data.length === POSTS_PER_PAGE)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchPosts(nextPage, true)
  }

  if (loading) {
    return (
      <div className="news-feed">
        <div className="container">
          <div className="loading">Loading news...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="news-feed">
        <div className="container">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <main className="news-feed" role="main" aria-label="News articles feed">
      <div className="feed-header">
        <h2 className="feed-title" id="feed-title">
          {activeCategory === 'all' ? 'All News' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News`}
        </h2>
      </div>
      
      <div className="feed-content" role="feed" aria-labelledby="feed-title" aria-busy={loading} aria-live="polite">
        {posts.map((post, index) => (
          <NewsPostCard key={post.id} post={post} priority={index === 0} />
        ))}
        
        {hasMore && (
          <div className="load-more">
            <button 
              className="load-more-btn" 
              onClick={loadMore}
              disabled={loadingMore}
              aria-label={loadingMore ? 'Loading more articles...' : 'Load more articles'}
              aria-describedby="load-more-status"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
            <div id="load-more-status" className="sr-only" aria-live="polite">
              {loadingMore ? 'Loading more articles...' : ''}
            </div>
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className="load-more">
            <p style={{ color: '#888' }}>No more posts to load</p>
          </div>
        )}
      </div>
    </main>
  )
}
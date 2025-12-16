'use client'

import { useState, useEffect } from 'react'
import { NewsPost, NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from '../lib/supabase'
import { getPostAge, getDaysUntilExpiration, isPostExpired } from '../lib/cleanup'
import '../styles/admin-panel.css'

interface PostsListProps {
  onEditPost: (post: NewsPost) => void
  refreshTrigger: number
}

export default function PostsList({ onEditPost, refreshTrigger }: PostsListProps) {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const POSTS_PER_PAGE = 20 // Increased to accommodate filtering

  useEffect(() => {
    fetchPosts()
  }, [refreshTrigger])

  // Filter and sort posts whenever posts, category filter, or sort order changes
  useEffect(() => {
    let filtered = [...posts]
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
    
    setFilteredPosts(filtered)
  }, [posts, categoryFilter, sortOrder])

  const fetchPosts = async (pageNumber = 0, maintainPosition = false) => {
    try {
      setLoading(true)
      setError('')

      // Fetch more posts to accommodate filtering
      const response = await fetch(`/api/posts?page=0&limit=100`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.posts)
      setHasMore(data.posts.length === 100) // Adjust as needed
      
      // Maintain current page if specified
      if (!maintainPosition) {
        setPage(pageNumber)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPost = (post: NewsPost) => {
    setEditingPostId(post.id)
    onEditPost(post)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Refresh posts list while maintaining position
      await fetchPosts(page, true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  const handleManualCleanup = async () => {
    if (!confirm('Are you sure you want to delete all expired posts (older than 30 days)?')) {
      return
    }

    try {
      setIsCleaningUp(true)
      const response = await fetch('/api/cleanup', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Cleanup failed')
      }

      const result = await response.json()
      alert(`Cleanup completed: ${result.message}`)
      
      // Refresh posts list while maintaining position
      await fetchPosts(page, true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cleanup failed')
    } finally {
      setIsCleaningUp(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading">Loading posts...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  // Get posts to display (filtered or all)
  const displayPosts = filteredPosts
  const currentPagePosts = displayPosts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE)
  const totalPages = Math.ceil(displayPosts.length / POSTS_PER_PAGE)

  return (
    <div className="posts-list">
      <div className="posts-list-header">
        <h2 className="posts-list-title">Manage Posts ({displayPosts.length} posts)</h2>
        <button
          className="cleanup-btn"
          onClick={handleManualCleanup}
          disabled={isCleaningUp}
        >
          {isCleaningUp ? 'Cleaning...' : 'Clean expired posts'}
        </button>
      </div>

      {/* Filter and Sort Controls */}
      <div className="posts-controls">
        <div className="posts-filters">
          <div className="filter-group">
            <label htmlFor="category-filter">Filter by Category:</label>
            <select
              id="category-filter"
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">सबै श्रेणी (All Categories)</option>
              {NEWS_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order">Sort by Date:</label>
            <select
              id="sort-order"
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {displayPosts.length === 0 ? (
        <div className="empty-state">
          <h3>{posts.length === 0 ? 'No posts found' : 'No posts match the current filter'}</h3>
          <p>{posts.length === 0 ? 'Create your first post to get started.' : 'Try adjusting your filter criteria.'}</p>
        </div>
      ) : (
        <>
          {currentPagePosts.map((post) => (
            <div key={post.id} className="post-item">
              <div className="post-item-header">
                <h3 className="post-item-title">{post.title}</h3>
                <span className="post-category-badge">{getCategoryLabel(post.category as NewsCategory)}</span>
              </div>
              
              <div className="post-item-meta">
                <div>Created: {formatDate(post.created_at)} | Updated: {formatDate(post.updated_at)}</div>
                <div className={`post-age ${isPostExpired(post.created_at) ? 'expired' : getDaysUntilExpiration(post.created_at) <= 3 ? 'expiring-soon' : ''}`}>
                  Age: {getPostAge(post.created_at)} days | 
                  {isPostExpired(post.created_at) 
                    ? ' ⚠️ EXPIRED - Will be auto-deleted'
                    : ` Expires in ${getDaysUntilExpiration(post.created_at)} days`
                  }
                </div>
              </div>
              
              <p className="post-item-summary">{post.summary}</p>
              
              <div className="post-item-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditPost(post)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {page + 1} of {totalPages} ({displayPosts.length} posts total)
              </span>
              
              <button
                className="page-btn"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

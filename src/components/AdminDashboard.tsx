'use client'

import { useState } from 'react'
import { useAuth } from '../lib/authContext'
import PostForm from './PostForm'
import PostsList from './PostsList'
import { NewsPost } from '../lib/supabase'

type View = 'list' | 'create' | 'edit'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<View>('list')
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreatePost = async (postData: Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        setCurrentView('list')
        setRefreshTrigger(prev => prev + 1)
        return true
      }
      return false
    } catch (error) {
      console.error('Create post error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePost = async (postData: Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingPost) return false

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        setCurrentView('list')
        setEditingPost(null)
        setRefreshTrigger(prev => prev + 1)
        return true
      }
      return false
    } catch (error) {
      console.error('Update post error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleEditPost = (post: NewsPost) => {
    setEditingPost(post)
    setCurrentView('edit')
  }

  const handleCancel = () => {
    setCurrentView('list')
    setEditingPost(null)
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <h1 className="admin-title">NewzNepal Admin</h1>
            <div className="admin-user">
              <span>Welcome, {user?.username}</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <div className="container">
          <nav className="admin-nav">
            <div className="admin-nav-buttons">
              <button
                className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
                onClick={() => setCurrentView('list')}
              >
                All Posts
              </button>
              <button
                className={`nav-btn ${currentView === 'create' ? 'active' : ''}`}
                onClick={() => setCurrentView('create')}
              >
                Create New Post
              </button>
            </div>
          </nav>

          {currentView === 'list' && (
            <PostsList 
              onEditPost={handleEditPost}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentView === 'create' && (
            <PostForm
              onSubmit={handleCreatePost}
              onCancel={handleCancel}
              loading={loading}
            />
          )}

          {currentView === 'edit' && editingPost && (
            <PostForm
              post={editingPost}
              onSubmit={handleUpdatePost}
              onCancel={handleCancel}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
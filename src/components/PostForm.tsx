'use client'

import { useState, useEffect, useRef } from 'react'
import { NewsPost, NEWS_CATEGORIES, NewsCategory, getCategoryLabel } from '../lib/supabase'
import '../styles/admin-panel.css'

interface PostFormProps {
  post?: NewsPost
  onSubmit: (postData: Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
}

export default function PostForm({ post, onSubmit, onCancel, loading = false }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<NewsCategory>('latest')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSummary(post.summary)
      setContent(post.content)
      setCategory(post.category as NewsCategory)
      setImageUrl(post.image_url || '')
      setUseUrlInput(!!post.image_url)
    }
  }, [post])

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.')
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError('File size too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setImageUrl(data.url)
        setUploadProgress(100)
        setTimeout(() => {
          setUploadProgress(0)
        }, 1000)
      } else {
        setUploadError(data.error || 'Upload failed')
      }
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = async () => {
    if (imageUrl) {
      // Extract filename from URL for deletion
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      
      try {
        await fetch(`/api/upload?fileName=${fileName}`, {
          method: 'DELETE'
        })
      } catch (err) {
        console.error('Failed to delete image:', err)
      }
    }
    setImageUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setError('Title, summary, and content are required')
      return
    }

    try {
      const success = await onSubmit({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        image_url: imageUrl.trim() || undefined,
      })

      if (success) {
        if (!post) {
          // Reset form for new posts
          setTitle('')
          setSummary('')
          setContent('')
          setCategory('latest')
          setImageUrl('')
        }
      }
    } catch (err) {
      setError('Failed to save post. Please try again.')
    }
  }

  return (
    <div className="post-form">
      <h2 className="post-form-title">
        {post ? 'Edit Post' : 'Create New Post'}
      </h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as NewsCategory)}
              required
              disabled={loading}
            >
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="image-upload-section">
          <div className="image-upload-title">Article Image (Optional)</div>
          
          {imageUrl && (
            <div className="current-image">
              <label className="current-image-label">Current Image:</label>
              <div className="image-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="preview-image" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={handleRemoveImage}
                  disabled={loading || uploading}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {!useUrlInput ? (
            <>
              <div
                className={`upload-area ${dragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <span className="upload-icon">📁</span>
                <div className="upload-text">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </div>
                <div className="upload-subtext">
                  JPEG, PNG, WebP, GIF up to 5MB
                </div>
                <button
                  type="button"
                  className="upload-btn"
                  disabled={loading || uploading}
                >
                  Choose File
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                disabled={loading || uploading}
              />

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">Uploading... {uploadProgress}%</div>
                </div>
              )}

              {uploadError && (
                <div className="upload-error">{uploadError}</div>
              )}

              <div className="url-input-toggle">
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setUseUrlInput(true)}
                  disabled={loading || uploading}
                >
                  Or enter image URL instead
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="imageUrl" className="form-label">
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  className="form-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="url-input-toggle">
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setUseUrlInput(false)}
                  disabled={loading}
                >
                  Or upload file instead
                </button>
              </div>
            </>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="summary" className="form-label">
            Summary *
          </label>
          <textarea
            id="summary"
            className="form-textarea"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            disabled={loading}
            placeholder="Brief summary that will be shown in the feed..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">
            Full Content *
          </label>
          <textarea
            id="content"
            className="form-textarea large"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            placeholder="Full article content..."
          />
        </div>

        <div className="form-buttons">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !title.trim() || !summary.trim() || !content.trim()}
          >
            {loading ? (post ? 'Updating...' : 'Creating...') : (post ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  )
}
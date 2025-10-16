'use client'

import { useState } from 'react'
import Image from 'next/image'
import LazyImage from './LazyImage'
import { NewsPost } from '../lib/supabase'
import '../styles/lazy-image.css'

interface NewsPostCardProps {
  post: NewsPost
  priority?: boolean
}

export default function NewsPostCard({ post, priority = false }: NewsPostCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <article className="news-post" role="article" aria-labelledby={`post-title-${post.id}`}>
      {post.image_url && (
        <div className="post-image-container">
          <LazyImage
            src={post.image_url}
            alt={`Featured image for: ${post.title}`}
            width={800}
            height={250}
            priority={priority}
          />
        </div>
      )}
      
      <div className="post-content">
        <h2 id={`post-title-${post.id}`} className="post-title">{post.title}</h2>
        
        <div id={`post-content-${post.id}`} role="region" aria-live="polite">
          {!expanded ? (
            <p className="post-summary">{post.summary}</p>
          ) : (
            <div className="post-full-content">{post.content}</div>
          )}
        </div>
        
        <div className="post-actions">
          <button 
            className={expanded ? "read-less-btn" : "read-more-btn"}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls={`post-content-${post.id}`}
            aria-label={expanded ? `Collapse article: ${post.title}` : `Expand article: ${post.title}`}
          >
            {expanded ? 'Read Less' : 'Read More'}
          </button>
          
          <span className="post-meta">
            {formatDate(post.created_at)}
          </span>
        </div>
      </div>
    </article>
  )
}
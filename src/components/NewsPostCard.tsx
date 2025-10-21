"use client";

import { useState } from "react";
import Image from "next/image";
import LazyImage from "./LazyImage";
import { NewsPost } from "../lib/supabase";
import "../styles/lazy-image.css";

interface NewsPostCardProps {
  post: NewsPost;
  priority?: boolean;
}

export default function NewsPostCard({
  post,
  priority = false,
}: NewsPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${post.id}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const systemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: shareUrl,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  return (
    <article
      className="news-post"
      role="article"
      aria-labelledby={`post-title-${post.id}`}
    >
      {post.image_url && (
        <div className="post-image-container">
          <a
            href={`/posts/${post.id}`}
            aria-label={`Open full article: ${post.title}`}
          >
            <LazyImage
              src={post.image_url}
              alt={`Featured image for: ${post.title}`}
              width={800}
              height={250}
              priority={priority}
            />
          </a>
        </div>
      )}

      <div className="post-content">
        <h2 id={`post-title-${post.id}`} className="post-title">
          <a href={`/posts/${post.id}`}>{post.title}</a>
        </h2>

        <div id={`post-content-${post.id}`} role="region" aria-live="polite">
          {!expanded ? (
            <p className="post-summary">{post.summary}</p>
          ) : (
            <div 
              className="post-full-content"
              style={{
                color: '#1a202c',
                WebkitTextFillColor: '#1a202c',
                opacity: 1,
                fontSize: '16px',
                lineHeight: '1.7',
                fontWeight: '400',
                whiteSpace: 'pre-wrap'
              }}
            >
              {post.content}
            </div>
          )}
        </div>

        <div className="post-actions">
          <button
            className={expanded ? "read-less-btn" : "read-more-btn"}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls={`post-content-${post.id}`}
            aria-label={
              expanded
                ? `Collapse article: ${post.title}`
                : `Expand article: ${post.title}`
            }
          >
            {expanded ? "Read Less" : "Read More"}
          </button>

          <span className="post-meta">{formatDate(post.created_at)}</span>

          <div className="share-actions" style={{ marginLeft: 12 }}>
            <button
              className="icon-btn share"
              onClick={systemShare}
              aria-label="Share this article"
              title="Share"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 0 6h.17A3 3 0 0 0 15 8Zm-6 8a3 3 0 1 0-2.83-4H6a3 3 0 0 0 0 6h.17A3 3 0 0 0 9 16Zm9 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM9.64 13.23l4.72 2.36a1 1 0 1 0 .9-1.79l-4.72-2.36a1 1 0 0 0-.9 1.79Z" />
              </svg>
            </button>
            <button
              className="icon-btn copy"
              onClick={copyLink}
              aria-label="Copy link"
              title="Copy link"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 3a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H9Zm-5 6a2 2 0 0 0-2 2v7a3 3 0 0 0 3 3h8a2 2 0 1 0 0-4H5v-6a2 2 0 0 0-2-2Z" />
              </svg>
            </button>
            <a
              className="icon-btn fb"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              title="Facebook"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13 22v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4Z" />
              </svg>
            </a>
            <a
              className="icon-btn x"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              title="X"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 3l7.5 9.5L4 21h3l6-7.5L18.5 21H21l-7.5-9.5L21 3h-3l-5.5 6.9L7 3H4Z" />
              </svg>
            </a>
            <a
              className="icon-btn wa"
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                post.title + " " + shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              title="WhatsApp"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20 4a10 10 0 0 0-16 12l-2 6 6-2A10 10 0 1 0 20 4Zm-5.4 12.6c-2.7 0-5.9-2.3-6.7-5-.2-.7 0-1.4.5-1.9l1-.9a.9.9 0 0 1 1.3.1l1 1.4c.3.4.3.9-.1 1.3l-.3.3c.6 1.3 1.7 2.4 3 3l.3-.3c.4-.4.9-.4 1.3-.1l1.4 1c.5.3.7 1 .4 1.6-.4.9-1.3 1.5-2.1 1.5Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

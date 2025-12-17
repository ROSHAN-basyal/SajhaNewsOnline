"use client";

import { useMemo, useState } from "react";
import LazyImage from "./LazyImage";
import { getCategoryLabel, NewsPost } from "../lib/supabase";
import "../styles/news-feed.css";

interface NewsPostCardProps {
  post: NewsPost;
  priority?: boolean;
}

function estimateReadingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export default function NewsPostCard({ post, priority = false }: NewsPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    return base ? `${base}/posts/${post.id}` : `/posts/${post.id}`;
  }, [post.id]);

  const readingMinutes = useMemo(() => estimateReadingMinutes(post.content || ""), [post.content]);

  const categoryLabel = useMemo(
    () => getCategoryLabel((post.category as any) || "latest", "ne"),
    [post.category]
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("ne-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const hasUpdatedAt = Boolean(post.updated_at && post.updated_at !== post.created_at);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
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
      className={`story ${expanded ? "story--expanded" : ""}`}
      aria-labelledby={`story-title-${post.id}`}
    >
      {post.image_url ? (
        <a className="story__media" href={`/posts/${post.id}`} aria-label={`समाचार खोल्नुहोस्: ${post.title}`}>
          <LazyImage
            src={post.image_url}
            alt={`समाचारको तस्बिर: ${post.title}`}
            width={720}
            height={420}
            priority={priority}
            sizes="(max-width: 768px) 100vw, 720px"
            errorText="तस्बिर लोड हुन सकेन"
          />
        </a>
      ) : null}

      <div className="story__body">
        <div className="story__metaRow">
          <span className="story__badge">{categoryLabel}</span>
          <span className="story__meta">
            {expanded ? (
              <>
                {formatDateTime(post.created_at)} · {new Intl.NumberFormat("ne-NP").format(readingMinutes)} मिनेट पढाइ
                {hasUpdatedAt ? ` · अपडेट: ${formatDateTime(post.updated_at)}` : ""}
              </>
            ) : (
              <>
                {formatDate(post.created_at)} | {new Intl.NumberFormat("ne-NP").format(readingMinutes)} मिनेट पढाइ
              </>
            )}
          </span>
        </div>

        <h2 id={`story-title-${post.id}`} className="story__title">
          <a href={`/posts/${post.id}`}>{post.title}</a>
        </h2>

        <p className="story__deck">{post.summary}</p>

        {expanded ? (
          <>
            <div className="story__full" role="region" aria-label="समाचारको विस्तृत पूर्वावलोकन">
              {post.content}
            </div>
          </>
        ) : null}

        <div className="story__actions">
          <button type="button" className="btn btn-ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "कम पढ्नुहोस्" : "थप पढ्नुहोस्"}
          </button>

          <div className="story__share" aria-label="सेयर विकल्पहरू">
            <button
              type="button"
              className="icon-btn share"
              onClick={systemShare}
              aria-label="यो समाचार सेयर गर्नुहोस्"
              title="सेयर"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>

            <button type="button" className="icon-btn copy" onClick={copyLink} aria-label="लिङ्क कपी गर्नुहोस्" title="लिङ्क कपी गर्नुहोस्">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 1 7 0l1 1a5 5 0 0 1-7 7l-1-1" />
                <path d="M14 11a5 5 0 0 1-7 0l-1-1a5 5 0 0 1 7-7l1 1" />
              </svg>
            </button>

            <a
              className="icon-btn fb"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="फेसबुकमा सेयर गर्नुहोस्"
              title="Facebook"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 1 1-11.6-9.9A10 10 0 0 1 22 12Z" fill="currentColor" opacity=".08" />
                <path d="M15 8h2.5l-1 4H15v8h-4v-8H8V8h3V6.5A3.5 3.5 0 0 1 14.5 3H18v3h-2a1 1 0 0 0-1 1V8Z" fill="currentColor" />
              </svg>
            </a>

            <a
              className="icon-btn x"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X मा सेयर गर्नुहोस्"
              title="X"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2H21l-6.529 7.46L22 22h-6.828l-4.804-6.253L4.9 22H2.142l6.99-7.987L2 2h6.914l4.41 5.79L18.244 2Zm-1.195 18h1.872L7.03 4H5.06L17.05 20Z" />
              </svg>
            </a>

            <a
              className="icon-btn wa"
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp मा सेयर गर्नुहोस्"
              title="WhatsApp"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.44 0 .04 5.4.04 12.08c0 2.13.56 4.14 1.63 5.95L0 24l6.13-1.6a11.96 11.96 0 0 0 5.92 1.56h.01c6.62 0 12.02-5.4 12.02-12.07 0-3.22-1.26-6.25-3.56-8.41Zm-8.47 17.3h-.01a10.1 10.1 0 0 1-5.15-1.41l-.37-.22-3.64.95.97-3.55-.24-.36a10.12 10.12 0 0 1-1.57-5.47c0-5.6 4.56-10.15 10.17-10.15 2.72 0 5.27 1.06 7.2 2.98a10.05 10.05 0 0 1 2.99 7.16c0 5.6-4.56 10.15-10.15 10.15Zm5.56-7.6c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.69.15-.2.3-.79.98-.97 1.18-.18.2-.36.23-.66.08-.3-.15-1.24-.46-2.35-1.47-.87-.77-1.45-1.71-1.62-2.01-.17-.3-.02-.46.13-.61.13-.13.3-.33.44-.49.15-.17.2-.28.3-.48.1-.2.05-.37-.03-.52-.08-.15-.69-1.66-.95-2.28-.25-.6-.5-.52-.69-.53l-.58-.01c-.2 0-.52.08-.79.37-.27.3-1.03 1-.99 2.45.04 1.45 1.06 2.84 1.21 3.04.15.2 2.08 3.17 5.04 4.45.7.3 1.25.48 1.67.61.7.22 1.33.19 1.83.12.56-.08 1.78-.73 2.03-1.43.25-.7.25-1.29.18-1.43-.07-.14-.27-.22-.57-.37Z" />
              </svg>
            </a>
          </div>
        </div>

        {copied ? <div className="story__toast">लिङ्क कपी गरियो</div> : null}
      </div>
    </article>
  );
}

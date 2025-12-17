"use client";

import { useEffect, useMemo, useState } from "react";
import { getDaysUntilExpiration, getPostAge, isPostExpired } from "../lib/cleanup";
import { getCategoryLabel, NewsCategory, NewsPost, NEWS_CATEGORIES } from "../lib/supabase";
import LazyImage from "./LazyImage";
import "../styles/admin-panel.css";

interface PostsListProps {
  onEditPost: (post: NewsPost) => void;
  refreshTrigger: number;
}

export default function PostsList({ onEditPost, refreshTrigger }: PostsListProps) {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | NewsCategory>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const POSTS_PER_PAGE = 12;

  const fetchPosts = async ({ maintainPage }: { maintainPage?: boolean } = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/posts?page=0&limit=200`);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      if (!maintainPage) setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = posts;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter);
    }

    if (normalizedQuery) {
      filtered = filtered.filter((post) => {
        const haystack = `${post.title || ""} ${post.summary || ""}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [posts, query, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const currentPagePosts = filteredPosts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      await fetchPosts({ maintainPage: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const handleManualCleanup = async () => {
    if (!confirm("Delete all expired posts (older than 30 days)?")) return;

    try {
      setIsCleaningUp(true);
      const response = await fetch("/api/cleanup", { method: "POST" });
      if (!response.ok) throw new Error("Cleanup failed");

      const result = await response.json();
      alert(`Cleanup completed: ${result.message}`);
      await fetchPosts({ maintainPage: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cleanup failed");
    } finally {
      setIsCleaningUp(false);
    }
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <section className="posts-list" aria-label="Posts">
      <div className="posts-toolbar" role="region" aria-label="Post filters">
        <div className="posts-toolbar__filters">
          <input
            className="posts-toolbar__input"
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search posts"
          />

          <select
            className="posts-toolbar__select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            aria-label="Filter by category"
          >
            <option value="all">All</option>
            {NEWS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>

          <select
            className="posts-toolbar__select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            aria-label="Sort by date"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        <div className="posts-toolbar__meta">
          <span
            className="posts-toolbar__count"
            title={posts.length !== filteredPosts.length ? `Filtered from ${posts.length}` : undefined}
          >
            <span className="posts-toolbar__countLabel">Posts</span>
            <span className="posts-toolbar__countValue">{filteredPosts.length}</span>
          </span>
          <button className="cleanup-btn posts-toolbar__cleanup" onClick={handleManualCleanup} disabled={isCleaningUp}>
            {isCleaningUp ? "Cleaning..." : "Clean expired"}
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <h3>{posts.length === 0 ? "No posts yet" : "No posts match the filters"}</h3>
          <p>{posts.length === 0 ? "Create your first post to get started." : "Try adjusting the search or category filter."}</p>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {currentPagePosts.map((post) => {
              const expired = isPostExpired(post.created_at);
              const daysUntilExpiration = getDaysUntilExpiration(post.created_at);
              const ageDays = getPostAge(post.created_at);

              const statusClass = expired ? "is-expired" : daysUntilExpiration <= 3 ? "is-warning" : "is-ok";
              const statusText = expired ? "Expired" : `Expires in ${daysUntilExpiration}d`;

              return (
                <article key={post.id} className="post-card">
                  <div className="post-card__media">
                    {post.image_url ? (
                      <LazyImage
                        src={post.image_url}
                        alt={post.title}
                        width={720}
                        height={420}
                        sizes="(max-width: 900px) 100vw, 420px"
                      />
                    ) : (
                      <div className="post-card__mediaPlaceholder" aria-hidden="true">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" />
                          <path d="M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                          <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="post-card__body">
                    <div className="post-card__top">
                      <span className="post-card__badge">{getCategoryLabel((post.category as NewsCategory) || "latest")}</span>
                      <button
                        type="button"
                        className="post-card__iconBtn icon-btn is-delete"
                        onClick={() => handleDeletePost(post.id)}
                        aria-label={`Delete post: ${post.title}`}
                        title="Delete"
                      >
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" strokeLinecap="round" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="post-card__statusRow">
                      <span className={`post-card__status ${statusClass}`} title={`Age: ${ageDays} days`}>
                        {statusText}
                      </span>
                      <span className="post-card__statusHint">Age {ageDays}d</span>
                    </div>

                    <h3 className="post-card__title">{post.title}</h3>
                    <p className="post-card__summary">{post.summary}</p>

                    <div className="post-card__meta">
                      <span className="post-card__metaText">Created {formatDateTime(post.created_at)}</span>
                      <span className="post-card__metaText">Updated {formatDateTime(post.updated_at)}</span>
                      <button type="button" className="post-card__edit" onClick={() => onEditPost(post)}>
                        Edit
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredPosts.length > POSTS_PER_PAGE ? (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Previous
              </button>
              <span className="page-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase, NewsPost, getCategoryLabel, NewsCategory } from "../lib/supabase";
import NewsPostCard from "./NewsPostCard";
import AdSlot from "./ads/AdSlot";
import "../styles/news-feed.css";

interface NewsFeedProps {
  activeCategory: NewsCategory | "all";
}

export default function NewsFeed({ activeCategory }: NewsFeedProps) {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const fetchPosts = async (pageNumber = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      let query = supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query.range(
        pageNumber * POSTS_PER_PAGE,
        (pageNumber + 1) * POSTS_PER_PAGE - 1
      );

      if (error) throw error;

      if (append) {
        setPosts((prev) => [...prev, ...(data as NewsPost[])]);
      } else {
        setPosts(data as NewsPost[]);
        setPage(0);
      }

      setHasMore((data as any[])?.length === POSTS_PER_PAGE);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, true);
  };

  const title = useMemo(() => {
    if (activeCategory === "all") return "Latest Updates";
    return `${getCategoryLabel(activeCategory)} News`;
  }, [activeCategory]);

  if (loading) {
    return (
      <main className="feed" aria-label="News feed">
        <div className="feed__header">
          <h2 className="feed__title">{title}</h2>
        </div>
        <div className="feed__status">Loading news...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="feed" aria-label="News feed">
        <div className="feed__header">
          <h2 className="feed__title">{title}</h2>
        </div>
        <div className="error">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="feed" role="main" aria-label="News feed">
      <div className="feed__header">
        <h2 className="feed__title" id="feed-title">
          {title}
        </h2>
      </div>

      <div className="feed__list" role="feed" aria-labelledby="feed-title" aria-busy={loading}>
        {posts.length === 0 ? (
          <div className="feed__empty">
            <h3>No articles found</h3>
            <p>Try changing category or adjusting your search.</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <Fragment key={post.id}>
              <NewsPostCard post={post} priority={index === 0} />
              {index === 2 && (
                <div className="feed__ad">
                  <AdSlot placement="in_content" label="Sponsored" />
                </div>
              )}
            </Fragment>
          ))
        )}

        {hasMore && posts.length > 0 && (
          <div className="feed__more">
            <button className="btn btn-primary" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="feed__more">
            <p className="feed__end">You&apos;ve reached the end.</p>
          </div>
        )}
      </div>
    </main>
  );
}

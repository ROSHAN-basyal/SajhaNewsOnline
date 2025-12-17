"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../lib/authContext";
import { NewsPost } from "../lib/supabase";
import AdManagement from "./AdManagement";
import NepaliClock from "./NepaliClock";
import PostForm from "./PostForm";
import PostsList from "./PostsList";

type Section = "posts" | "ads";
type PostView = "list" | "create" | "edit";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>("posts");
  const [postView, setPostView] = useState<PostView>("list");
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const username = user?.username || "Admin";
  const headerRef = useRef<HTMLElement | null>(null);

  const pageTitle = useMemo(() => {
    if (section === "ads") return "Advertisements";
    if (postView === "create") return "Create Post";
    if (postView === "edit") return "Edit Post";
    return "Posts";
  }, [section, postView]);

  const switchSection = (next: Section) => {
    setSection(next);
    if (next !== "posts") {
      setPostView("list");
      setEditingPost(null);
    }
  };

  const goToNewPost = () => {
    setSection("posts");
    setPostView("create");
    setEditingPost(null);
  };

  const handleCreatePost = async (postData: Omit<NewsPost, "id" | "created_at" | "updated_at">) => {
    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setPostView("list");
        setRefreshTrigger((prev) => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Create post error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (postData: Omit<NewsPost, "id" | "created_at" | "updated_at">) => {
    if (!editingPost) return false;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setPostView("list");
        setEditingPost(null);
        setRefreshTrigger((prev) => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update post error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: NewsPost) => {
    setEditingPost(post);
    setPostView("edit");
    setSection("posts");
  };

  const handleCancel = () => {
    setPostView("list");
    setEditingPost(null);
  };

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--admin-header-h", `${Math.ceil(height)}px`);
    };

    update();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }

    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="admin-shell">
      <header ref={headerRef} className="admin-header" role="banner">
        <div className="container admin-header__inner">
          <div className="admin-header__left">
            <NepaliClock />
          </div>

          <div className="admin-header__center" aria-label="Admin portal title">
            <div className="admin-header__titleRow">
              <span className="admin-header__title">Sajha Admin</span>
              <span className="admin-header__divider" aria-hidden="true">
                ·
              </span>
              <span className="admin-header__page" title={pageTitle}>
                {pageTitle}
              </span>
            </div>
          </div>

          <div className="admin-header__right">
            <button type="button" className="admin-logout icon-btn" onClick={logout} aria-label={`Logout (${username})`} title="Logout">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-subnav is-sticky" role="navigation" aria-label="Admin sections">
        <div className="container admin-subnav__inner">
          <div className="admin-tabs" aria-label="Posts and Ads">
            <button
              type="button"
              className={`admin-tabs__tab ${section === "posts" ? "is-active" : ""}`}
              onClick={() => switchSection("posts")}
            >
              Posts
            </button>
            <button
              type="button"
              className={`admin-tabs__tab ${section === "ads" ? "is-active" : ""}`}
              onClick={() => switchSection("ads")}
            >
              Ads
            </button>
          </div>
        </div>
      </div>

      <main className="admin-main">
        <div className="container admin-content">
          {section === "posts" && postView === "list" ? (
            <PostsList onEditPost={handleEditPost} refreshTrigger={refreshTrigger} />
          ) : null}

          {section === "posts" && postView === "create" ? (
            <PostForm onSubmit={handleCreatePost} onCancel={handleCancel} loading={loading} />
          ) : null}

          {section === "posts" && postView === "edit" && editingPost ? (
            <PostForm post={editingPost} onSubmit={handleUpdatePost} onCancel={handleCancel} loading={loading} />
          ) : null}

          {section === "ads" ? <AdManagement /> : null}
        </div>
      </main>

      {section === "posts" && postView === "list" ? (
        <button type="button" className="admin-fab" onClick={goToNewPost} aria-label="Create new post" title="New post">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}


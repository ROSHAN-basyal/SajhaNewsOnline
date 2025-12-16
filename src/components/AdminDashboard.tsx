"use client";

import { useMemo, useState } from "react";
import { useAuth } from "../lib/authContext";
import PostForm from "./PostForm";
import PostsList from "./PostsList";
import AdManagement from "./AdManagement";
import { NewsPost } from "../lib/supabase";

type Section = "posts" | "ads";
type PostView = "list" | "create" | "edit";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>("posts");
  const [postView, setPostView] = useState<PostView>("list");
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const pageTitle = useMemo(() => {
    if (section === "ads") return "Advertisements";
    if (postView === "create") return "Create Post";
    if (postView === "edit") return "Edit Post";
    return "Posts";
  }, [section, postView]);

  const handleCreatePost = async (
    postData: Omit<NewsPost, "id" | "created_at" | "updated_at">
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleUpdatePost = async (
    postData: Omit<NewsPost, "id" | "created_at" | "updated_at">
  ) => {
    if (!editingPost) return false;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="admin-shell">
      <aside className="admin-side" aria-label="Admin navigation">
        <div className="admin-side__brand">
          <div className="admin-side__brandTitle">Sajha Admin</div>
          <div className="admin-side__brandSub">Content & Ads</div>
        </div>

        <nav className="admin-menu">
          <button
            type="button"
            className={`admin-menu__item ${section === "posts" ? "is-active" : ""}`}
            onClick={() => setSection("posts")}
          >
            Posts
          </button>
          <button
            type="button"
            className={`admin-menu__item ${section === "ads" ? "is-active" : ""}`}
            onClick={() => setSection("ads")}
          >
            Ads
          </button>
        </nav>

        <div className="admin-side__user">
          <div className="admin-side__userName">{user?.username}</div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title">{pageTitle}</div>

          {section === "posts" ? (
            <div className="admin-topbar__tabs" aria-label="Post actions">
              <button
                type="button"
                className={`admin-tab ${postView === "list" ? "is-active" : ""}`}
                onClick={() => {
                  setPostView("list");
                  setEditingPost(null);
                }}
              >
                All Posts
              </button>
              <button
                type="button"
                className={`admin-tab ${postView === "create" ? "is-active" : ""}`}
                onClick={() => {
                  setPostView("create");
                  setEditingPost(null);
                }}
              >
                New Post
              </button>
            </div>
          ) : null}
        </header>

        <div className="admin-content">
          {section === "posts" && postView === "list" && (
            <PostsList onEditPost={handleEditPost} refreshTrigger={refreshTrigger} />
          )}

          {section === "posts" && postView === "create" && (
            <PostForm onSubmit={handleCreatePost} onCancel={handleCancel} loading={loading} />
          )}

          {section === "posts" && postView === "edit" && editingPost && (
            <PostForm
              post={editingPost}
              onSubmit={handleUpdatePost}
              onCancel={handleCancel}
              loading={loading}
            />
          )}

          {section === "ads" && <AdManagement />}
        </div>
      </div>
    </div>
  );
}


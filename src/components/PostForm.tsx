"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCategoryLabel, NewsCategory, NEWS_CATEGORIES, NewsPost } from "../lib/supabase";
import { getPostImageMap, POST_IMAGE_ALIASES, PostImageAlias } from "../lib/postImages";
import "../styles/admin-panel.css";

interface PostFormProps {
  post?: NewsPost;
  onSubmit: (postData: Omit<NewsPost, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PostForm({ post, onSubmit, onCancel, loading = false }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NewsCategory>("latest");
  const [durationDays, setDurationDays] = useState(30);
  const [imageSlots, setImageSlots] = useState<Record<PostImageAlias, string>>({
    img1: "",
    img2: "",
    img3: "",
  });
  const [error, setError] = useState("");

  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeAlias, setActiveAlias] = useState<PostImageAlias>("img1");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!post) return;
    setTitle(post.title || "");
    setSummary(post.summary || "");
    setContent(post.content || "");
    setCategory((post.category as NewsCategory) || "latest");
    setDurationDays(post.duration_days || 30);
    setImageSlots(getPostImageMap(post));
  }, [post]);

  const submitDisabled = useMemo(() => {
    if (loading || uploading) return true;
    return !title.trim() || !summary.trim() || !content.trim();
  }, [loading, uploading, title, summary, content]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      setImageSlots((prev) => ({ ...prev, [activeAlias]: data.url }));
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 700);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectAlias = (alias: PostImageAlias) => {
    setActiveAlias(alias);
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async (alias: PostImageAlias) => {
    const currentUrl = imageSlots[alias];
    if (currentUrl) {
      const urlParts = currentUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      try {
        await fetch(`/api/upload?fileName=${encodeURIComponent(fileName)}`, { method: "DELETE" });
      } catch {}
    }
    setImageSlots((prev) => ({ ...prev, [alias]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadError("");

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setError("Title, summary, and content are required.");
      return;
    }

    if (durationDays < 1 || durationDays > 300) {
      setError("Please enter a valid duration.");
      return;
    }

    const imageUrls = POST_IMAGE_ALIASES.map((alias) => imageSlots[alias]).filter(Boolean);

    try {
      const success = await onSubmit({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        duration_days: durationDays,
        image_url: imageUrls[0] || undefined,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      if (success && !post) {
        setTitle("");
        setSummary("");
        setContent("");
        setCategory("latest");
        setDurationDays(30);
        setImageSlots({ img1: "", img2: "", img3: "" });
      }
    } catch {
      setError("Failed to save post. Please try again.");
    }
  };

  return (
    <section className="post-form" aria-label={post ? "Edit post" : "Create post"}>
      <header className="post-form__header">
        <div className="post-form__headerCopy">
          <h2 className="post-form__title">{post ? "Edit Post" : "Create New Post"}</h2>
          <div className="post-form__subtitle">Fields marked with * are required.</div>
        </div>
        <div className="post-form__duration" aria-label="Post duration">
          <label htmlFor="post-duration" className="post-form__durationLabel">
            Duration
          </label>
          <div className="post-form__durationControl">
            <input
              id="post-duration"
              type="number"
              min={1}
              max={300}
              className="post-form__durationInput"
              value={durationDays}
              onChange={(e) => setDurationDays(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
              disabled={loading || uploading}
            />
            <span className="post-form__durationSuffix">days</span>
          </div>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <form onSubmit={handleSubmit} className="post-form__form">
        <div className="post-form__layout">
          <div className="post-form__main">
            <div className="form-group">
              <label htmlFor="post-title" className="form-label">
                Title *
              </label>
              <input
                id="post-title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                placeholder="Headline for the post…"
              />
            </div>

            <div className="form-group">
              <label htmlFor="post-category" className="form-label">
                Category *
              </label>
              <select
                id="post-category"
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

            <div className="form-group">
              <label htmlFor="post-summary" className="form-label">
                Summary *
              </label>
              <textarea
                id="post-summary"
                className="form-textarea"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                disabled={loading}
                placeholder="Short summary shown in the feed…"
              />
            </div>

            <div className="form-group">
              <label htmlFor="post-content" className="form-label">
                Full Content *
              </label>
              <textarea
                id="post-content"
                className="form-textarea large"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={loading}
                placeholder="Full article content…"
              />
              <div className="form-hint">
                Use <code>/img2</code> and <code>/img3</code> inside full content to place attached images inline.
              </div>
            </div>
          </div>

          <aside className="post-form__side" aria-label="Article image">
            <div className="image-card">
              <div className="image-card__header">
                <div className="image-card__title">Article Images</div>
                <div className="image-card__hint">img1 is used as the cover image.</div>
              </div>
              <div className="image-slots" aria-label="Image attachment slots">
                {POST_IMAGE_ALIASES.map((alias) => {
                  const imageUrl = imageSlots[alias];
                  const isCover = alias === "img1";

                  return (
                    <div key={alias} className="image-slot">
                      <div className="image-slot__meta">
                        <span className="image-slot__alias">{alias}</span>
                        <span className="image-slot__role">
                          {isCover ? "Cover" : "Inline"}
                        </span>
                      </div>
                      <div className="image-slot__controls">
                        <button
                          type="button"
                          className="upload-btn image-slot__attach"
                          onClick={() => handleSelectAlias(alias)}
                          disabled={loading || uploading}
                        >
                          {imageUrl ? "Replace" : "Attach"}
                        </button>
                        {imageUrl ? (
                          <button
                            type="button"
                            className="image-slot__remove"
                            onClick={() => handleRemoveImage(alias)}
                            disabled={loading || uploading}
                            aria-label={`Remove ${alias}`}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      {imageUrl ? (
                        <div className="image-slot__preview">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt={`${alias} preview`} className="image-slot__previewImg" />
                        </div>
                      ) : (
                        <div className="image-slot__placeholder">No image attached</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.currentTarget.value = "";
                }}
                disabled={loading || uploading}
              />

              {uploadProgress > 0 ? (
                <div className="upload-progress">
                  <progress className="progress-native" max={100} value={uploadProgress} />
                  <div className="progress-text">
                    {uploadProgress < 100 ? `Uploading ${activeAlias}… ${uploadProgress}%` : `${activeAlias} attached`}
                  </div>
                </div>
              ) : null}

              {uploadError ? <div className="upload-error">{uploadError}</div> : null}
            </div>
          </aside>
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading || uploading}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitDisabled}>
            {loading ? (post ? "Updating…" : "Creating…") : post ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </section>
  );
}

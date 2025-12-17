"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCategoryLabel, NewsCategory, NEWS_CATEGORIES, NewsPost } from "../lib/supabase";
import "../styles/admin-panel.css";

interface PostFormProps {
  post?: NewsPost;
  onSubmit: (postData: Omit<NewsPost, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

type ImageMode = "upload" | "url";

export default function PostForm({ post, onSubmit, onCancel, loading = false }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NewsCategory>("latest");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!post) return;
    setTitle(post.title || "");
    setSummary(post.summary || "");
    setContent(post.content || "");
    setCategory((post.category as NewsCategory) || "latest");
    setImageUrl(post.image_url || "");
    setImageMode(post.image_url ? "url" : "upload");
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

      setImageUrl(data.url);
      setImageMode("url");
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 700);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (imageUrl) {
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      try {
        await fetch(`/api/upload?fileName=${encodeURIComponent(fileName)}`, { method: "DELETE" });
      } catch {}
    }
    setImageUrl("");
    setImageMode("upload");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadError("");

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setError("Title, summary, and content are required.");
      return;
    }

    try {
      const success = await onSubmit({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        image_url: imageUrl.trim() || undefined,
      });

      if (success && !post) {
        setTitle("");
        setSummary("");
        setContent("");
        setCategory("latest");
        setImageUrl("");
        setImageMode("upload");
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
            </div>
          </div>

          <aside className="post-form__side" aria-label="Article image">
            <div className="image-card">
              <div className="image-card__header">
                <div className="image-card__title">Article Image</div>
                <div className="image-card__mode" role="tablist" aria-label="Image input mode">
                  <button
                    type="button"
                    className={`image-card__modeBtn ${imageMode === "upload" ? "is-active" : ""}`}
                    onClick={() => setImageMode("upload")}
                    disabled={loading || uploading}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className={`image-card__modeBtn ${imageMode === "url" ? "is-active" : ""}`}
                    onClick={() => setImageMode("url")}
                    disabled={loading || uploading}
                  >
                    URL
                  </button>
                </div>
              </div>

              {imageUrl ? (
                <div className="image-card__preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Selected article image" className="image-card__previewImg" />
                  <button
                    type="button"
                    className="image-card__remove icon-btn"
                    onClick={handleRemoveImage}
                    disabled={loading || uploading}
                    aria-label="Remove image"
                    title="Remove"
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" strokeLinecap="round" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : null}

              {imageMode === "upload" ? (
                <>
                  <div
                    className={`dropzone ${dragOver ? "is-dragOver" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload image"
                  >
                    <div className="dropzone__icon" aria-hidden="true">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v10" strokeLinecap="round" />
                        <path d="M8 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 19H4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="dropzone__text">
                      {uploading ? "Uploading…" : "Click to upload or drag & drop"}
                    </div>
                    <div className="dropzone__subtext">JPEG, PNG, WebP, GIF • up to 5MB</div>
                    <button type="button" className="upload-btn" disabled={loading || uploading}>
                      Choose file
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="file-input"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    disabled={loading || uploading}
                  />
                </>
              ) : (
                <div className="form-group">
                  <label htmlFor="post-image-url" className="form-label">
                    Image URL
                  </label>
                  <input
                    id="post-image-url"
                    type="url"
                    className="form-input"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={loading}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {uploadProgress > 0 ? (
                <div className="upload-progress">
                  <progress className="progress-native" max={100} value={uploadProgress} />
                  <div className="progress-text">{uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : "Uploaded"}</div>
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


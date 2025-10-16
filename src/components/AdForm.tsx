"use client";

import { useState, useEffect } from "react";
import { Advertisement } from "../app/api/ads/route";
import "../styles/ad-form.css";

interface AdFormProps {
  ad?: Advertisement;
  onSubmit: (
    adData: Omit<Advertisement, "id" | "created_at" | "updated_at">
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  loading: boolean;
  selectedPlacement?: string;
}

const AD_PLACEMENTS = [
  { id: "header", name: "Header Banner", size: "728×90 / 320×50 (mobile)" },
  { id: "sidebar_top", name: "Sidebar Top", size: "300×250" },
  { id: "in_content", name: "In-Content", size: "728×90 / 300×250" },
  { id: "sidebar_mid", name: "Sidebar Mid", size: "300×600 / 300×250" },
  { id: "footer", name: "Footer Banner", size: "728×90" },
];

export default function AdForm({
  ad,
  onSubmit,
  onCancel,
  loading,
  selectedPlacement,
}: AdFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    image_url: string;
    click_url: string;
    placement:
      | "header"
      | "sidebar_top"
      | "in_content"
      | "sidebar_mid"
      | "footer";
    status: "active" | "paused" | "expired" | "draft";
    priority: number;
    start_date: string;
    end_date: string;
    target_impressions: number;
    target_clicks: number;
  }>({
    title: "",
    description: "",
    image_url: "",
    click_url: "",
    placement: (selectedPlacement as any) || "header",
    status: "active",
    priority: 1,
    start_date: "",
    end_date: "",
    target_impressions: 0,
    target_clicks: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || "",
        description: ad.description || "",
        image_url: ad.image_url || "",
        click_url: ad.click_url || "",
        placement: ad.placement || "header",
        status: ad.status || "active",
        priority: ad.priority || 1,
        start_date: ad.start_date
          ? new Date(ad.start_date).toISOString().slice(0, 16)
          : "",
        end_date: ad.end_date
          ? new Date(ad.end_date).toISOString().slice(0, 16)
          : "",
        target_impressions: ad.target_impressions || 0,
        target_clicks: ad.target_clicks || 0,
      });
      setPreviewImage(ad.image_url || null);
    } else if (selectedPlacement) {
      setFormData((prev) => ({ ...prev, placement: selectedPlacement as any }));
    }
  }, [ad, selectedPlacement]);

  useEffect(() => {
    if (formData.image_url && formData.image_url !== previewImage) {
      // Validate image URL
      const img = new Image();
      img.onload = () => setPreviewImage(formData.image_url);
      img.onerror = () => setPreviewImage(null);
      img.src = formData.image_url;
    }
  }, [formData.image_url, previewImage]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    if (!formData.image_url.trim()) {
      newErrors.image_url = "Image URL is required";
    } else if (!isValidUrl(formData.image_url)) {
      newErrors.image_url = "Please enter a valid URL";
    }

    if (!formData.click_url.trim()) {
      newErrors.click_url = "Click URL is required";
    } else if (!isValidUrl(formData.click_url)) {
      newErrors.click_url = "Please enter a valid URL";
    }

    if (!formData.placement) {
      newErrors.placement = "Placement is required";
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = "Priority must be between 1 and 10";
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    if (formData.target_impressions < 0) {
      newErrors.target_impressions = "Target impressions cannot be negative";
    }

    if (formData.target_clicks < 0) {
      newErrors.target_clicks = "Target clicks cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    const submitData = {
      ...formData,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    };

    const result = await onSubmit(submitData);

    if (!result.success) {
      setSubmitError(result.error || "Failed to save advertisement");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getPlacementInfo = (placementId: string) => {
    return AD_PLACEMENTS.find((p) => p.id === placementId);
  };

  const selectedPlacementInfo = getPlacementInfo(formData.placement);

  return (
    <div className="ad-form-container">
      <form onSubmit={handleSubmit} className="ad-form">
        {submitError && <div className="error-message">{submitError}</div>}

        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h4>📝 Basic Information</h4>

            <div className="form-group">
              <label className="form-label">Advertisement Title *</label>
              <input
                type="text"
                className={`form-input ${errors.title ? "error" : ""}`}
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter advertisement title"
                maxLength={255}
              />
              {errors.title && (
                <span className="field-error">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Optional description for internal use"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL *</label>
              <input
                type="url"
                className={`form-input ${errors.image_url ? "error" : ""}`}
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/banner-image.jpg"
              />
              {errors.image_url && (
                <span className="field-error">{errors.image_url}</span>
              )}

              {previewImage && (
                <div className="image-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImage} alt="Ad preview" />
                  <div className="preview-info">
                    Recommended size: {selectedPlacementInfo?.size}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Click URL *</label>
              <input
                type="url"
                className={`form-input ${errors.click_url ? "error" : ""}`}
                value={formData.click_url}
                onChange={(e) => handleInputChange("click_url", e.target.value)}
                placeholder="https://example.com/landing-page"
              />
              {errors.click_url && (
                <span className="field-error">{errors.click_url}</span>
              )}
            </div>
          </div>

          {/* Placement & Status */}
          <div className="form-section">
            <h4>🎯 Placement & Status</h4>

            <div className="form-group">
              <label className="form-label">Placement *</label>
              <select
                className={`form-select ${errors.placement ? "error" : ""}`}
                value={formData.placement}
                onChange={(e) => handleInputChange("placement", e.target.value)}
              >
                {AD_PLACEMENTS.map((placement) => (
                  <option key={placement.id} value={placement.id}>
                    {placement.name} ({placement.size})
                  </option>
                ))}
              </select>
              {errors.placement && (
                <span className="field-error">{errors.placement}</span>
              )}

              {selectedPlacementInfo && (
                <div className="placement-info">
                  <strong>{selectedPlacementInfo.name}</strong>
                  <br />
                  Recommended size: {selectedPlacementInfo.size}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="active">🟢 Active</option>
                <option value="paused">⏸️ Paused</option>
                <option value="draft">📝 Draft</option>
                <option value="expired">🔴 Expired</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority (1-10)</label>
              <input
                type="number"
                className={`form-input ${errors.priority ? "error" : ""}`}
                value={formData.priority}
                onChange={(e) =>
                  handleInputChange("priority", parseInt(e.target.value) || 1)
                }
                min={1}
                max={10}
              />
              {errors.priority && (
                <span className="field-error">{errors.priority}</span>
              )}
              <div className="form-hint">
                Higher priority ads show first (10 = highest)
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="form-section">
            <h4>⏰ Scheduling (Optional)</h4>

            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
              />
              <div className="form-hint">Leave empty to start immediately</div>
            </div>

            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <input
                type="datetime-local"
                className={`form-input ${errors.end_date ? "error" : ""}`}
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
              />
              {errors.end_date && (
                <span className="field-error">{errors.end_date}</span>
              )}
              <div className="form-hint">Leave empty to run indefinitely</div>
            </div>
          </div>

          {/* Targets */}
          <div className="form-section">
            <h4>🎯 Performance Targets (Optional)</h4>

            <div className="form-group">
              <label className="form-label">Target Impressions</label>
              <input
                type="number"
                className={`form-input ${
                  errors.target_impressions ? "error" : ""
                }`}
                value={formData.target_impressions}
                onChange={(e) =>
                  handleInputChange(
                    "target_impressions",
                    parseInt(e.target.value) || 0
                  )
                }
                min={0}
                placeholder="0"
              />
              {errors.target_impressions && (
                <span className="field-error">{errors.target_impressions}</span>
              )}
              <div className="form-hint">
                Set to 0 for unlimited impressions
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Clicks</label>
              <input
                type="number"
                className={`form-input ${errors.target_clicks ? "error" : ""}`}
                value={formData.target_clicks}
                onChange={(e) =>
                  handleInputChange(
                    "target_clicks",
                    parseInt(e.target.value) || 0
                  )
                }
                min={0}
                placeholder="0"
              />
              {errors.target_clicks && (
                <span className="field-error">{errors.target_clicks}</span>
              )}
              <div className="form-hint">Set to 0 for unlimited clicks</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>⏳ {ad ? "Updating..." : "Creating..."}</>
            ) : (
              <>✅ {ad ? "Update Advertisement" : "Create Advertisement"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

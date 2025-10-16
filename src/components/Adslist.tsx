"use client";

import { useState } from "react";
import { Advertisement } from "../app/api/ads/route";
import "../styles/ads-list.css";

interface AdsListProps {
  ads: Advertisement[];
  onEditAd: (ad: Advertisement) => void;
  onDeleteAd: (adId: string) => Promise<{ success: boolean; error?: string }>;
  refreshTrigger: number;
  loading: boolean;
}

export default function AdsList({
  ads,
  onEditAd,
  onDeleteAd,
  refreshTrigger,
  loading,
}: AdsListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlacement, setFilterPlacement] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🟢";
      case "paused":
        return "⏸️";
      case "draft":
        return "📝";
      case "expired":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getPlacementName = (placement: string) => {
    const placements: { [key: string]: string } = {
      header: "Header Banner",
      sidebar_top: "Sidebar Top",
      in_content: "In-Content",
      sidebar_mid: "Sidebar Mid",
      footer: "Footer Banner",
    };
    return placements[placement] || placement;
  };

  const handleDelete = async (adId: string) => {
    setDeleting(adId);
    const result = await onDeleteAd(adId);
    setDeleting(null);
    setDeleteConfirm(null);

    if (!result.success) {
      alert(result.error || "Failed to delete advertisement");
    }
  };

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    if (filterStatus !== "all" && ad.status !== filterStatus) return false;
    if (filterPlacement !== "all" && ad.placement !== filterPlacement)
      return false;
    return true;
  });

  // Sort ads
  const sortedAds = [...filteredAds].sort((a, b) => {
    let aVal: any = a[sortBy as keyof Advertisement];
    let bVal: any = b[sortBy as keyof Advertisement];

    // Handle dates
    if (sortBy === "created_at" || sortBy === "updated_at") {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Handle strings
    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();

    if (sortOrder === "asc") {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateCTR = (impressions?: number, clicks?: number) => {
    if (!impressions || impressions === 0) return "0.00";
    const ctr = ((clicks || 0) / impressions) * 100;
    return ctr.toFixed(2);
  };

  const isAdExpired = (ad: Advertisement) => {
    if (!ad.end_date) return false;
    return new Date(ad.end_date) < new Date();
  };

  const isAdScheduled = (ad: Advertisement) => {
    if (!ad.start_date) return false;
    return new Date(ad.start_date) > new Date();
  };

  return (
    <div className="ads-list-container">
      {/* Filters & Controls */}
      <div className="list-controls">
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Placement:</label>
            <select
              className="filter-select"
              value={filterPlacement}
              onChange={(e) => setFilterPlacement(e.target.value)}
            >
              <option value="all">All Placements</option>
              <option value="header">Header Banner</option>
              <option value="sidebar_top">Sidebar Top</option>
              <option value="in_content">In-Content</option>
              <option value="sidebar_mid">Sidebar Mid</option>
              <option value="footer">Footer Banner</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="placement">Placement</option>
              <option value="priority">Priority</option>
              <option value="impressions">Impressions</option>
              <option value="clicks">Clicks</option>
            </select>
          </div>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="results-count">
          Showing {sortedAds.length} of {ads.length} ads
        </div>
      </div>

      {/* Ads List */}
      {loading && sortedAds.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading advertisements...</p>
        </div>
      ) : sortedAds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No advertisements found</h3>
          <p>
            {filterStatus !== "all" || filterPlacement !== "all"
              ? "Try adjusting your filters"
              : "Create your first advertisement to get started"}
          </p>
        </div>
      ) : (
        <div className="ads-grid">
          {sortedAds.map((ad) => (
            <div key={ad.id} className="ad-card">
              {/* Ad Header */}
              <div className="ad-card-header">
                <div className="ad-title-section">
                  <h3 className="ad-title">{ad.title}</h3>
                  <div className="ad-meta">
                    <span className="status-badge">
                      {getStatusIcon(ad.status)} {ad.status}
                    </span>
                    <span className="placement-badge">
                      📍 {getPlacementName(ad.placement)}
                    </span>
                    <span className="priority-badge">
                      ⭐ Priority: {ad.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ad Preview */}
              <div className="ad-preview">
                {ad.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='100'%3E%3Crect fill='%23ddd' width='400' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </div>

              {/* Ad Info */}
              <div className="ad-info">
                {ad.description && (
                  <p className="ad-description">{ad.description}</p>
                )}

                <div className="ad-details">
                  <div className="detail-row">
                    <strong>Click URL:</strong>
                    <a
                      href={ad.click_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="click-url"
                    >
                      {ad.click_url.length > 40
                        ? ad.click_url.substring(0, 40) + "..."
                        : ad.click_url}
                    </a>
                  </div>

                  {(ad.start_date || ad.end_date) && (
                    <div className="detail-row">
                      <strong>Schedule:</strong>
                      <span>
                        {ad.start_date
                          ? formatDate(ad.start_date)
                          : "Immediate"}{" "}
                        → {ad.end_date ? formatDate(ad.end_date) : "Indefinite"}
                      </span>
                    </div>
                  )}

                  {isAdScheduled(ad) && (
                    <div className="scheduled-notice">
                      ⏰ Scheduled to start {formatDate(ad.start_date)}
                    </div>
                  )}

                  {isAdExpired(ad) && (
                    <div className="expired-notice">
                      ⚠️ Expired on {formatDate(ad.end_date)}
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="ad-metrics">
                <div className="metric">
                  <div className="metric-value">
                    {(ad.impressions || 0).toLocaleString()}
                  </div>
                  <div className="metric-label">Impressions</div>
                  {ad.target_impressions > 0 && (
                    <div className="metric-progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(
                            ((ad.impressions || 0) / ad.target_impressions) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="metric">
                  <div className="metric-value">
                    {(ad.clicks || 0).toLocaleString()}
                  </div>
                  <div className="metric-label">Clicks</div>
                  {ad.target_clicks > 0 && (
                    <div className="metric-progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(
                            ((ad.clicks || 0) / ad.target_clicks) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="metric">
                  <div className="metric-value">
                    {calculateCTR(ad.impressions, ad.clicks)}%
                  </div>
                  <div className="metric-label">CTR</div>
                </div>
              </div>

              {/* Ad Footer */}
              <div className="ad-card-footer">
                <div className="ad-dates">
                  <small>Created: {formatDate(ad.created_at)}</small>
                  {ad.updated_at && (
                    <small>Updated: {formatDate(ad.updated_at)}</small>
                  )}
                </div>

                <div className="ad-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => onEditAd(ad)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  {deleteConfirm === ad.id ? (
                    <>
                      <button
                        className="btn-icon btn-confirm-delete"
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleting === ad.id}
                        title="Confirm Delete"
                      >
                        {deleting === ad.id ? "⏳" : "✓"}
                      </button>
                      <button
                        className="btn-icon btn-cancel"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting === ad.id}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => setDeleteConfirm(ad.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

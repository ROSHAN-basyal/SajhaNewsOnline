"use client";

import { useState, useEffect } from "react";
import AdPlacementSelector from "./AdPlacementSelector";
import AdForm from "./AdForm";
import AdsList from "./Adslist";
import AdAnalytics from "./AdAnalytics";
import { Advertisement } from "../app/api/ads/route";
import "../styles/ad-management.css";

type AdView = "list" | "create" | "edit" | "analytics" | "placement";

export default function AdManagement() {
  const [currentView, setCurrentView] = useState<AdView>("list");
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPlacement, setSelectedPlacement] = useState<string>("header");

  // Statistics
  const [statistics, setStatistics] = useState({
    total_ads: 0,
    active_ads: 0,
    total_impressions: 0,
    total_clicks: 0,
    avg_ctr: 0,
  });

  useEffect(() => {
    fetchAds();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ads?analytics=true");
      const data = await response.json();

      if (data.ads) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/ads/track?range=30d");
      const data = await response.json();

      if (data.summary) {
        const totalImpressions = data.summary.reduce(
          (sum: number, ad: any) => sum + ad.impressions,
          0
        );
        const totalClicks = data.summary.reduce(
          (sum: number, ad: any) => sum + ad.clicks,
          0
        );
        const avgCtr =
          totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        setStatistics({
          total_ads: ads.length,
          active_ads: ads.filter((ad) => ad.status === "active").length,
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          avg_ctr: parseFloat(avgCtr.toFixed(2)),
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleCreateAd = async (
    adData: Omit<Advertisement, "id" | "created_at" | "updated_at">
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adData),
      });

      if (response.ok) {
        setCurrentView("list");
        setRefreshTrigger((prev) => prev + 1);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Create ad error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAd = async (
    adData: Omit<Advertisement, "id" | "created_at" | "updated_at">
  ) => {
    if (!editingAd)
      return { success: false, error: "No ad selected for editing" };

    setLoading(true);
    try {
      const response = await fetch(`/api/ads?id=${editingAd.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adData),
      });

      if (response.ok) {
        setCurrentView("list");
        setEditingAd(null);
        setRefreshTrigger((prev) => prev + 1);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Update ad error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
    setCurrentView("edit");
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/ads?id=${adId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRefreshTrigger((prev) => prev + 1);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Delete ad error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const handleCancel = () => {
    setCurrentView("list");
    setEditingAd(null);
  };

  const getExistingAdsByPlacement = () => {
    const adsByPlacement: { [key: string]: number } = {};
    ads.forEach((ad) => {
      adsByPlacement[ad.placement] = (adsByPlacement[ad.placement] || 0) + 1;
    });
    return adsByPlacement;
  };

  return (
    <div className="ad-management">
      <div className="ad-management-header">
        <div className="header-content">
          <div className="header-title">
            <h2>📺 Advertisement Management</h2>
            <p>Manage banner ads across 5 strategic placements</p>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{statistics.total_ads}</div>
              <div className="stat-label">Total Ads</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statistics.active_ads}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {statistics.total_impressions.toLocaleString()}
              </div>
              <div className="stat-label">Impressions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {statistics.total_clicks.toLocaleString()}
              </div>
              <div className="stat-label">Clicks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statistics.avg_ctr}%</div>
              <div className="stat-label">Avg CTR</div>
            </div>
          </div>
        </div>
      </div>

      <nav className="ad-nav">
        <div className="ad-nav-buttons">
          <button
            className={`nav-btn ${currentView === "list" ? "active" : ""}`}
            onClick={() => setCurrentView("list")}
          >
            📋 All Ads ({ads.length})
          </button>
          <button
            className={`nav-btn ${currentView === "create" ? "active" : ""}`}
            onClick={() => setCurrentView("create")}
          >
            ➕ Create New Ad
          </button>
          <button
            className={`nav-btn ${currentView === "placement" ? "active" : ""}`}
            onClick={() => setCurrentView("placement")}
          >
            🎯 Placement Guide
          </button>
          <button
            className={`nav-btn ${currentView === "analytics" ? "active" : ""}`}
            onClick={() => setCurrentView("analytics")}
          >
            📊 Analytics
          </button>
        </div>
      </nav>

      <div className="ad-content">
        {currentView === "list" && (
          <AdsList
            ads={ads}
            onEditAd={handleEditAd}
            onDeleteAd={handleDeleteAd}
            refreshTrigger={refreshTrigger}
            loading={loading}
          />
        )}

        {currentView === "create" && (
          <div className="ad-create-section">
            <div className="section-header">
              <h3>Create New Advertisement</h3>
              <p>
                Fill in the details below to create a new banner advertisement
              </p>
            </div>

            <div className="create-workflow">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Placement</h4>
                  <AdPlacementSelector
                    selectedPlacement={selectedPlacement}
                    onPlacementChange={setSelectedPlacement}
                    existingAds={getExistingAdsByPlacement()}
                  />
                </div>
              </div>

              <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Ad Details</h4>
                  <AdForm
                    onSubmit={handleCreateAd}
                    onCancel={handleCancel}
                    loading={loading}
                    selectedPlacement={selectedPlacement}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "edit" && editingAd && (
          <div className="ad-edit-section">
            <div className="section-header">
              <h3>Edit Advertisement</h3>
              <p>
                Update the details of &quot;{editingAd.title}&quot;
              </p>
            </div>

            <AdForm
              ad={editingAd}
              onSubmit={handleUpdateAd}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        )}

        {currentView === "placement" && (
          <div className="placement-guide-section">
            <div className="section-header">
              <h3>Placement Strategy Guide</h3>
              <p>Understand where your ads will appear and their impact</p>
            </div>

            <AdPlacementSelector
              selectedPlacement={selectedPlacement}
              onPlacementChange={setSelectedPlacement}
              existingAds={getExistingAdsByPlacement()}
            />

            <div className="placement-recommendations">
              <h4>💡 Placement Recommendations</h4>
              <div className="recommendations-grid">
                <div className="recommendation-card">
                  <h5>🎯 Header Banner</h5>
                  <p>
                    <strong>Best for:</strong> Brand awareness, maximum
                    visibility
                  </p>
                  <p>
                    <strong>Ideal ads:</strong> Product launches, major
                    announcements
                  </p>
                </div>
                <div className="recommendation-card">
                  <h5>📌 Sidebar Top</h5>
                  <p>
                    <strong>Best for:</strong> Persistent brand presence
                  </p>
                  <p>
                    <strong>Ideal ads:</strong> Services, ongoing campaigns
                  </p>
                </div>
                <div className="recommendation-card">
                  <h5>📰 In-Content</h5>
                  <p>
                    <strong>Best for:</strong> Native advertising, high
                    engagement
                  </p>
                  <p>
                    <strong>Ideal ads:</strong> Content marketing, relevant
                    products
                  </p>
                </div>
                <div className="recommendation-card">
                  <h5>📍 Sidebar Mid</h5>
                  <p>
                    <strong>Best for:</strong> Detailed information, engaged
                    users
                  </p>
                  <p>
                    <strong>Ideal ads:</strong> Complex products, B2B services
                  </p>
                </div>
                <div className="recommendation-card">
                  <h5>⬇️ Footer Banner</h5>
                  <p>
                    <strong>Best for:</strong> Cost-effective placement
                  </p>
                  <p>
                    <strong>Ideal ads:</strong> Brand recall, secondary
                    CTAs
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "analytics" && (
          <div className="analytics-section">
            <div className="section-header">
              <h3>Advertisement Analytics</h3>
              <p>Track performance across all placements and ads</p>
            </div>

            <AdAnalytics ads={ads} />
          </div>
        )}
      </div>
    </div>
  );
}

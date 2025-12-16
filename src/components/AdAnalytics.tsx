"use client";

import { useState, useEffect } from "react";
import { Advertisement } from "../app/api/ads/route";
import "../styles/ad-analytics.css";

interface AdAnalyticsProps {
  ads: Advertisement[];
}

interface AnalyticsData {
  ad_id: string;
  ad_title: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export default function AdAnalytics({ ads }: AdAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    "impressions" | "clicks" | "ctr"
  >("impressions");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, ads]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ads/track?range=${timeRange}`);
      const data = await response.json();

      if (data.summary) {
        const analytics = data.summary.map((item: any) => ({
          ad_id: item.id,
          ad_title: item.title || "Unknown Ad",
          impressions: item.impressions || 0,
          clicks: item.clicks || 0,
          ctr:
            item.impressions > 0
              ? ((item.clicks || 0) / item.impressions) * 100
              : 0,
        }));
        setAnalyticsData(analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalMetrics = () => {
    return analyticsData.reduce(
      (acc, item) => ({
        impressions: acc.impressions + item.impressions,
        clicks: acc.clicks + item.clicks,
      }),
      { impressions: 0, clicks: 0 }
    );
  };

  const totals = getTotalMetrics();
  const overallCTR =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  const getTopPerformers = () => {
    return [...analyticsData]
      .sort((a, b) => {
        if (selectedMetric === "impressions")
          return b.impressions - a.impressions;
        if (selectedMetric === "clicks") return b.clicks - a.clicks;
        return b.ctr - a.ctr;
      })
      .slice(0, 5);
  };

  const getPlacementStats = () => {
    const placementMap: {
      [key: string]: { impressions: number; clicks: number; count: number };
    } = {};

    ads.forEach((ad) => {
      const analytics = analyticsData.find((a) => a.ad_id === ad.id);
      if (!placementMap[ad.placement]) {
        placementMap[ad.placement] = { impressions: 0, clicks: 0, count: 0 };
      }
      placementMap[ad.placement].impressions += analytics?.impressions || 0;
      placementMap[ad.placement].clicks += analytics?.clicks || 0;
      placementMap[ad.placement].count++;
    });

    return Object.entries(placementMap).map(([placement, stats]) => ({
      placement,
      ...stats,
      ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
    }));
  };

  const placementStats = getPlacementStats();

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

  const getMaxValue = (metric: "impressions" | "clicks" | "ctr") => {
    if (analyticsData.length === 0) return 1;
    return Math.max(...analyticsData.map((item) => item[metric]), 1);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="ad-analytics-container">
      {/* Time Range Selector */}
      <div className="analytics-controls">
        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === "7d" ? "active" : ""}`}
            onClick={() => setTimeRange("7d")}
          >
            Last 7 Days
          </button>
          <button
            className={`range-btn ${timeRange === "30d" ? "active" : ""}`}
            onClick={() => setTimeRange("30d")}
          >
            Last 30 Days
          </button>
          <button
            className={`range-btn ${timeRange === "90d" ? "active" : ""}`}
            onClick={() => setTimeRange("90d")}
          >
            Last 90 Days
          </button>
          <button
            className={`range-btn ${timeRange === "all" ? "active" : ""}`}
            onClick={() => setTimeRange("all")}
          >
            All Time
          </button>
        </div>

        <button className="refresh-btn" onClick={fetchAnalytics}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="overall-stats">
            <div className="stat-card-large">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <div className="stat-value">
                  {totals.impressions.toLocaleString()}
                </div>
                <div className="stat-label">Total Impressions</div>
              </div>
            </div>

            <div className="stat-card-large">
              <div className="stat-icon">👆</div>
              <div className="stat-content">
                <div className="stat-value">
                  {totals.clicks.toLocaleString()}
                </div>
                <div className="stat-label">Total Clicks</div>
              </div>
            </div>

            <div className="stat-card-large">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{overallCTR.toFixed(2)}%</div>
                <div className="stat-label">Overall CTR</div>
              </div>
            </div>

            <div className="stat-card-large">
              <div className="stat-icon">📺</div>
              <div className="stat-content">
                <div className="stat-value">{ads.length}</div>
                <div className="stat-label">Total Ads</div>
              </div>
            </div>
          </div>

          {/* Placement Performance */}
          <div className="analytics-section">
            <h3>📍 Performance by Placement</h3>
            <div className="placement-stats">
              {placementStats.map((stat) => (
                <div key={stat.placement} className="placement-stat-card">
                  <div className="placement-stat-header">
                    <h4>{getPlacementName(stat.placement)}</h4>
                    <span className="ad-count">{stat.count} ads</span>
                  </div>
                  <div className="placement-metrics">
                    <div className="metric-row">
                      <span className="metric-label">Impressions:</span>
                      <span className="metric-value">
                        {stat.impressions.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Clicks:</span>
                      <span className="metric-value">
                        {stat.clicks.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">CTR:</span>
                      <span className="metric-value">
                        {stat.ctr.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="placement-bar">
                    <div
                      className="placement-bar-fill"
                      style={{
                        width: `${
                          (stat.impressions / (totals.impressions || 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="analytics-section">
            <div className="section-header-with-controls">
              <h3>🏆 Top Performing Ads</h3>
              <div className="metric-selector">
                <button
                  className={`metric-btn ${
                    selectedMetric === "impressions" ? "active" : ""
                  }`}
                  onClick={() => setSelectedMetric("impressions")}
                >
                  Impressions
                </button>
                <button
                  className={`metric-btn ${
                    selectedMetric === "clicks" ? "active" : ""
                  }`}
                  onClick={() => setSelectedMetric("clicks")}
                >
                  Clicks
                </button>
                <button
                  className={`metric-btn ${
                    selectedMetric === "ctr" ? "active" : ""
                  }`}
                  onClick={() => setSelectedMetric("ctr")}
                >
                  CTR
                </button>
              </div>
            </div>

            <div className="top-performers">
              {getTopPerformers().length === 0 ? (
                <div className="no-data">No performance data available yet</div>
              ) : (
                getTopPerformers().map((ad, index) => (
                  <div key={ad.ad_id} className="performer-card">
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-info">
                      <h4 className="performer-title">{ad.ad_title}</h4>
                      <div className="performer-metrics">
                        <span>
                          👁️ {formatNumber(ad.impressions)} impressions
                        </span>
                        <span>👆 {formatNumber(ad.clicks)} clicks</span>
                        <span>📈 {ad.ctr.toFixed(2)}% CTR</span>
                      </div>
                    </div>
                    <div className="performer-chart">
                      <div
                        className="performer-bar"
                        style={{
                          width: `${
                            (ad[selectedMetric] / getMaxValue(selectedMetric)) *
                            100
                          }%`,
                        }}
                      ></div>
                      <span className="performer-value">
                        {selectedMetric === "ctr"
                          ? `${ad[selectedMetric].toFixed(2)}%`
                          : formatNumber(ad[selectedMetric])}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All Ads Performance Table */}
          <div className="analytics-section">
            <h3>📊 All Ads Performance</h3>
            <div className="performance-table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Advertisement</th>
                    <th>Status</th>
                    <th>Placement</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-data-cell">
                        No analytics data available
                      </td>
                    </tr>
                  ) : (
                    analyticsData.map((data) => {
                      const ad = ads.find((a) => a.id === data.ad_id);
                      return (
                        <tr key={data.ad_id}>
                          <td className="ad-title-cell">{data.ad_title}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                ad?.status || "unknown"
                              }`}
                            >
                              {ad?.status || "Unknown"}
                            </span>
                          </td>
                          <td>{getPlacementName(ad?.placement || "")}</td>
                          <td className="number-cell">
                            {data.impressions.toLocaleString()}
                          </td>
                          <td className="number-cell">
                            {data.clicks.toLocaleString()}
                          </td>
                          <td className="number-cell">
                            <span
                              className={`ctr-value ${
                                data.ctr > 2
                                  ? "good"
                                  : data.ctr > 1
                                  ? "average"
                                  : "low"
                              }`}
                            >
                              {data.ctr.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="analytics-section">
            <h3>💡 Performance Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <h4>Best Performing Placement</h4>
                  <p>
                    {placementStats.length > 0
                      ? getPlacementName(
                          placementStats.sort((a, b) => b.ctr - a.ctr)[0]
                            .placement
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">⭐</div>
                <div className="insight-content">
                  <h4>Average CTR</h4>
                  <p>{overallCTR.toFixed(2)}%</p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h4>Total Engagement</h4>
                  <p>{(totals.impressions + totals.clicks).toLocaleString()}</p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">🔥</div>
                <div className="insight-content">
                  <h4>Most Active Ad</h4>
                  <p>
                    {analyticsData.length > 0
                      ? analyticsData.sort(
                          (a, b) => b.impressions - a.impressions
                        )[0].ad_title
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

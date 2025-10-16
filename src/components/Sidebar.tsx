"use client";

import { useState, useEffect } from "react";
import NewsletterForm from "./NewsletterForm";
import "../styles/sidebar.css";

const initialWeatherData = {
  kathmandu: { temp: "22°C", condition: "☀️ Sunny" },
  pokhara: { temp: "19°C", condition: "⛅ Partly Cloudy" },
  chitwan: { temp: "26°C", condition: "🌤️ Clear" },
};

const trendingTopics = [
  "#NepalPolitics",
  "#MountEverest",
  "#KathmanduValley",
  "#NepalTourism",
  "#Tihar2025",
  "#NepalEconomy",
];

const quickStats = [
  { label: "Today&apos;s Stories", value: "12" },
  { label: "Breaking News", value: "3" },
  { label: "Total Views", value: "1.2M" },
  { label: "Active Readers", value: "450" },
];

export default function Sidebar() {
  const [currentTime, setCurrentTime] = useState("");
  const [nepaliDate, setNepaliDate] = useState("");
  const [weatherData, setWeatherData] = useState(initialWeatherData);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kathmandu",
        })
      );
      setNepaliDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("/api/weather");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setWeatherData(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    // Update weather every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  return (
    <aside className="sidebar">
      {/* Live Time Widget */}
      <div className="sidebar-widget">
        <h3 className="widget-title">🕒 Nepal Time</h3>
        <div className="time-widget">
          <div className="current-time">{currentTime}</div>
          <div className="current-date">{nepaliDate}</div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="sidebar-widget">
        <h3 className="widget-title">🌤️ Weather Updates</h3>
        <div className="weather-widget">
          {weatherLoading ? (
            <div className="weather-loading">Loading weather data...</div>
          ) : (
            Object.entries(weatherData).map(([city, data]) => (
              <div key={city} className="weather-item">
                <span className="city-name">
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </span>
                <span className="weather-info">
                  {data.condition} {data.temp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="sidebar-widget">
        <h3 className="widget-title">📈 Trending Now</h3>
        <div className="trending-widget">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="trending-item">
              <span className="trend-rank">#{index + 1}</span>
              <span className="trend-topic">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="sidebar-widget">
        <h3 className="widget-title">📊 Today&apos;s Stats</h3>
        <div className="stats-widget">
          {quickStats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="sidebar-widget">
        <h3 className="widget-title">📧 Stay Updated</h3>
        <div className="newsletter-widget">
          <p>Get daily news digest delivered to your inbox</p>
          <NewsletterForm />
        </div>
      </div>
    </aside>
  );
}

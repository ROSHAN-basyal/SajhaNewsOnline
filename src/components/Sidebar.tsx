"use client";

import AdSlot from "./ads/AdSlot";
import "../styles/sidebar.css";

const trendingTopics = [
  "#NepalPolitics",
  "#MountEverest",
  "#KathmanduValley",
  "#NepalTourism",
  "#Tihar2025",
  "#NepalEconomy",
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <section className="sidebar-block" aria-label="Advertisement">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">Sponsored</h3>
        </header>
        <div className="sidebar-block__body">
          <AdSlot placement="sidebar_top" />
        </div>
      </section>

      <section className="sidebar-block" aria-label="Trending now">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">Trending Now</h3>
        </header>
        <div className="sidebar-block__body">
          <ol className="trend-list">
            {trendingTopics.map((topic, index) => (
              <li key={topic} className="trend-item">
                <span className="trend-index">{index + 1}</span>
                <span className="trend-topic">{topic}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sidebar-block" aria-label="Advertisement">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">Sponsored</h3>
        </header>
        <div className="sidebar-block__body">
          <AdSlot placement="sidebar_mid" />
        </div>
      </section>

      <section className="sidebar-block" aria-label="Advertisement">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">Sponsored</h3>
        </header>
        <div className="sidebar-block__body">
          <AdSlot placement="footer" />
        </div>
      </section>
    </aside>
  );
}

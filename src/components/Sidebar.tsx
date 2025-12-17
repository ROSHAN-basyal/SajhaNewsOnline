"use client";

import AdSlot from "./ads/AdSlot";
import ElectionCountdown from "./ElectionCountdown";
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
    <aside className="sidebar" aria-label="साइडबार">
      <ElectionCountdown />

      <section className="sidebar-block" aria-label="विज्ञापन">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">विज्ञापन</h3>
        </header>
        <div className="sidebar-block__body">
          <AdSlot placement="sidebar_top" label="विज्ञापन" />
        </div>
      </section>

      <section className="sidebar-block" aria-label="ट्रेन्डिङ">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">ट्रेन्डिङ</h3>
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

      <section className="sidebar-block" aria-label="विज्ञापन">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">विज्ञापन</h3>
        </header>
        <div className="sidebar-block__body">
          <AdSlot placement="sidebar_mid" label="विज्ञापन" />
        </div>
      </section>

      <section className="sidebar-block" aria-label="विज्ञापन">
        <header className="sidebar-block__header">
          <h3 className="sidebar-block__title">विज्ञापन</h3>
        </header>
        <div className="sidebar-block__body">
          <AdSlot placement="footer" label="विज्ञापन" />
        </div>
      </section>
    </aside>
  );
}

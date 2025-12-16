"use client";

import { useEffect, useId, useRef, useState } from "react";
import "../../styles/ad-slot.css";

type AdPlacement = "header" | "sidebar_top" | "in_content" | "sidebar_mid" | "footer";

type AdStatus = "active" | "paused" | "expired" | "draft";

type Advertisement = {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  click_url: string;
  placement: AdPlacement;
  status: AdStatus;
  priority: number;
};

type AdSlotProps = {
  placement: AdPlacement;
  className?: string;
  label?: string;
  showPlaceholder?: boolean;
};

function trackEvent(adId: string, eventType: "impression" | "click") {
  const payload = JSON.stringify({ ad_id: adId, event_type: eventType });

  // Prefer sendBeacon for best chance of delivery during navigations.
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/ads/track", blob);
    return;
  }

  fetch("/api/ads/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export default function AdSlot({
  placement,
  className = "",
  label = "Advertisement",
  showPlaceholder = true,
}: AdSlotProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ads?placement=${encodeURIComponent(placement)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load ads");
        const data = (await res.json()) as { ads?: Advertisement[] };
        const first = data.ads?.[0] ?? null;
        if (!canceled) setAd(first);
      } catch {
        if (!canceled) setAd(null);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, [placement]);

  useEffect(() => {
    if (!ad || hasTrackedImpression) return;
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        trackEvent(ad.id, "impression");
        setHasTrackedImpression(true);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ad, hasTrackedImpression]);

  if (!loading && !ad && !showPlaceholder) return null;

  return (
    <div ref={rootRef} className={`ad-slot ${className}`} aria-labelledby={titleId}>
      <div className="ad-slot__label" id={titleId}>
        {label}
      </div>

      {loading ? (
        <div className="ad-slot__skeleton" />
      ) : ad ? (
        <a
          className="ad-slot__link"
          href={ad.click_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(ad.id, "click")}
          aria-label={`Open sponsored link: ${ad.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ad-slot__image" src={ad.image_url} alt={ad.title} loading="lazy" />
          <div className="ad-slot__meta">
            <div className="ad-slot__title">{ad.title}</div>
            {ad.description ? (
              <div className="ad-slot__description">{ad.description}</div>
            ) : null}
          </div>
        </a>
      ) : (
        <div className="ad-slot__placeholder">
          <div className="ad-slot__placeholderTitle">Your Ad Here</div>
          <div className="ad-slot__placeholderText">Replace this slot with an active campaign.</div>
        </div>
      )}
    </div>
  );
}

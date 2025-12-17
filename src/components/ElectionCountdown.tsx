"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sajha:electionTarget";
const DAYS_FROM_FIRST_VISIT = 78;

function getOrInitTargetMs() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const ms = Number(stored);
      if (Number.isFinite(ms) && ms > Date.now()) return ms;
    }
  } catch {}

  const ms = Date.now() + DAYS_FROM_FIRST_VISIT * 24 * 60 * 60 * 1000;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(ms));
  } catch {}
  return ms;
}

function parts(msRemaining: number) {
  const total = Math.max(0, msRemaining);
  const totalSeconds = Math.floor(total / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return { days, hours, minutes };
}

export default function ElectionCountdown() {
  const [targetMs, setTargetMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setTargetMs(getOrInitTargetMs());
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = useMemo(() => {
    if (targetMs === null) return null;
    return targetMs - nowMs;
  }, [nowMs, targetMs]);

  const p = useMemo(() => (remaining === null ? null : parts(remaining)), [remaining]);
  const nf0 = useMemo(() => new Intl.NumberFormat("ne-NP"), []);
  const nf2 = useMemo(() => new Intl.NumberFormat("ne-NP", { minimumIntegerDigits: 2 }), []);

  return (
    <section className="sidebar-block sidebar-countdown" aria-label="निर्वाचन काउन्टडाउन">
      <header className="sidebar-block__header">
        <h3 className="sidebar-block__title">निर्वाचन काउन्टडाउन</h3>
      </header>
      <div className="sidebar-block__body">
        <div className="countdown">
          <div className="countdown__label">नेपाल निर्वाचन</div>
          <div className="countdown__value">
            {p ? (
              <>
                <span className="countdown__num">{nf0.format(p.days)}</span>
                <span className="countdown__unit">दिन</span>
                <span className="countdown__sep">:</span>
                <span className="countdown__num">{nf2.format(p.hours)}</span>
                <span className="countdown__unit">घ</span>
                <span className="countdown__sep">:</span>
                <span className="countdown__num">{nf2.format(p.minutes)}</span>
                <span className="countdown__unit">मि</span>
              </>
            ) : (
              <span className="countdown__loading">लोड हुँदैछ...</span>
            )}
          </div>
          <div className="countdown__note">लक्ष्य समय पहिलो भेटदेखि ७८ दिनमा सेट गरिएको छ।</div>
        </div>
      </div>
    </section>
  );
}

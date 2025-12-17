"use client";

import { useEffect, useMemo, useState } from "react";
import { ADToBS } from "bikram-sambat-js";

function formatNepalTime(now: Date) {
  return new Intl.DateTimeFormat("ne-NP", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
}

type BsParts = { year: string; month: string; day: string };

function getBikramSambatParts(now: Date): BsParts {
  const adInNepal = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const bs = ADToBS(adInNepal);
  const [year = "", month = "", day = ""] = bs.split("-");
  return { year, month, day };
}

export default function NepaliClock() {
  const [now, setNow] = useState(() => new Date());
  const [bs, setBs] = useState<BsParts>(() => getBikramSambatParts(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setBs(getBikramSambatParts(new Date())), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(() => formatNepalTime(now), [now]);
  const bsDate = useMemo(() => `${bs.year}/${bs.month}/${bs.day}`, [bs]);

  return (
    <div className="np-clock" aria-label="Nepali date and time">
      <div className="np-clock__date">वि.सं. {bsDate}</div>
      <div className="np-clock__time">{time}</div>
    </div>
  );
}


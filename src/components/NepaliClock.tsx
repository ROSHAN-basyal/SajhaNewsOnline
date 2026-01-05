"use client";

import { useEffect, useMemo, useState } from "react";
import { getBikramSambatParts, BsParts } from "../lib/nepaliDate";

function formatNepalTime(now: Date) {
  return new Intl.DateTimeFormat("ne-NP", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
}

export default function NepaliClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [bs, setBs] = useState<BsParts | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => setBs(getBikramSambatParts(new Date()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(() => (now ? formatNepalTime(now) : "--:--:--"), [now]);
  const bsDate = useMemo(() => (bs ? `${bs.year}/${bs.month}/${bs.day}` : "----/--/--"), [bs]);

  return (
    <div className="np-clock" aria-label="Nepali date and time">
      <div className="np-clock__date">वि.सं. {bsDate}</div>
      <div className="np-clock__time">{time}</div>
    </div>
  );
}

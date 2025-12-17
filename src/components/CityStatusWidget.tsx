"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/city-status.css";

type CityKey =
  | "Kathmandu"
  | "Pokhara"
  | "Biratnagar"
  | "Bharatpur"
  | "Birgunj"
  | "Butwal"
  | "Nepalgunj"
  | "Dharan";

const CITY_PRESETS: Record<CityKey, { label: string; short: string; lat: number; lon: number }> = {
  Kathmandu: { label: "काठमाडौं", short: "KTM", lat: 27.7172, lon: 85.324 },
  Pokhara: { label: "पोखरा", short: "PKR", lat: 28.2096, lon: 83.9856 },
  Biratnagar: { label: "बिराटनगर", short: "BRT", lat: 26.4525, lon: 87.2718 },
  Bharatpur: { label: "भरतपुर", short: "BHR", lat: 27.6766, lon: 84.4359 },
  Birgunj: { label: "बीरगञ्ज", short: "BRG", lat: 27.015, lon: 84.8808 },
  Butwal: { label: "बुटवल", short: "BTW", lat: 27.7006, lon: 83.4484 },
  Nepalgunj: { label: "नेपालगञ्ज", short: "NPJ", lat: 28.05, lon: 81.6167 },
  Dharan: { label: "धरान", short: "DRN", lat: 26.8147, lon: 87.2836 },
};

const STORAGE_KEY = "sajha:selectedCity";

function weatherCodeLabel(code: number | null | undefined) {
  const c = typeof code === "number" ? code : null;
  if (c === null) return "मौसम";
  if (c === 0) return "सफा";
  if (c === 1 || c === 2) return "आंशिक सफा";
  if (c === 3) return "बादल";
  if (c === 45 || c === 48) return "कुहिरो";
  if (c === 51 || c === 53 || c === 55) return "छिटो पानी";
  if (c === 61 || c === 63 || c === 65) return "वर्षा";
  if (c === 66 || c === 67) return "चिसो वर्षा";
  if (c === 71 || c === 73 || c === 75) return "हिउँ";
  if (c === 77) return "हिउँका दाना";
  if (c === 80 || c === 81 || c === 82) return "अविरल झरी";
  if (c === 85 || c === 86) return "हिउँझरी";
  if (c === 95 || c === 96 || c === 99) return "आँधी";
  return "मौसम";
}

function aqiBand(aqi: number | null) {
  if (aqi === null) return "unknown";
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazard";
}

function WeatherIcon({ code }: { code: number | null }) {
  if (code === null) {
    return (
      <svg className="cs__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 14a4 4 0 0 1 4-4 5 5 0 0 1 9.7 1.6A3.5 3.5 0 0 1 17 19H7a3 3 0 0 1-3-3Z" />
      </svg>
    );
  }

  const isClear = code === 0;
  const isCloud = code === 1 || code === 2 || code === 3 || code === 45 || code === 48;
  const isRain =
    (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code === 95 || code === 96 || code === 99;
  const isSnow = (code >= 71 && code <= 77) || code === 85 || code === 86;

  if (isClear) {
    return (
      <svg className="cs__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M19 5l1.4-1.4M5 19l-1.4 1.4" />
      </svg>
    );
  }

  if (isSnow) {
    return (
      <svg className="cs__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 14a4 4 0 0 1 4-4 5 5 0 0 1 9.7 1.6A3.5 3.5 0 0 1 19 19H9a3 3 0 0 1-3-3Z" />
        <path d="M10 20h.01M14 21h.01M12 22h.01" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (isRain) {
    return (
      <svg className="cs__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 14a4 4 0 0 1 4-4 5 5 0 0 1 9.7 1.6A3.5 3.5 0 0 1 19 19H9a3 3 0 0 1-3-3Z" />
        <path d="M9 20l-1 2M13 20l-1 2M17 20l-1 2" strokeLinecap="round" />
      </svg>
    );
  }

  if (isCloud) {
    return (
      <svg className="cs__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 14a4 4 0 0 1 4-4 5 5 0 0 1 9.7 1.6A3.5 3.5 0 0 1 17 19H7a3 3 0 0 1-3-3Z" />
      </svg>
    );
  }

  return (
    <svg className="cs__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 14a4 4 0 0 1 4-4 5 5 0 0 1 9.7 1.6A3.5 3.5 0 0 1 17 19H7a3 3 0 0 1-3-3Z" />
    </svg>
  );
}

export default function CityStatusWidget({ align = "right" }: { align?: "left" | "right" }) {
  const [city, setCity] = useState<CityKey>("Kathmandu");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempC, setTempC] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && stored in CITY_PRESETS) setCity(stored as CityKey);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, city);
    } catch {}
  }, [city]);

  const coords = CITY_PRESETS[city];
  const band = useMemo(() => aqiBand(aqi), [aqi]);
  const condition = useMemo(() => weatherCodeLabel(weatherCode), [weatherCode]);
  const nf0 = useMemo(() => new Intl.NumberFormat("ne-NP"), []);

  useEffect(() => {
    let canceled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function load() {
      setLoading(true);
      try {
        const tz = "Asia%2FKathmandu";
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=${tz}`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi&timezone=${tz}`;

        const [weatherRes, aqiRes] = await Promise.all([fetch(weatherUrl), fetch(aqiUrl)]);
        if (!weatherRes.ok) throw new Error("Weather unavailable");
        if (!aqiRes.ok) throw new Error("AQI unavailable");

        const weatherJson = (await weatherRes.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const aqiJson = (await aqiRes.json()) as { current?: { us_aqi?: number } };

        const nextTemp = typeof weatherJson.current?.temperature_2m === "number" ? weatherJson.current.temperature_2m : null;
        const nextCode = typeof weatherJson.current?.weather_code === "number" ? weatherJson.current.weather_code : null;
        const nextAqi = typeof aqiJson.current?.us_aqi === "number" ? Math.round(aqiJson.current.us_aqi) : null;

        if (canceled) return;
        setTempC(nextTemp !== null ? Math.round(nextTemp) : null);
        setWeatherCode(nextCode);
        setAqi(nextAqi);
      } catch {
        if (canceled) return;
        setTempC(null);
        setWeatherCode(null);
        setAqi(null);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 10 * 60 * 1000);
    return () => {
      canceled = true;
      if (timer) clearInterval(timer);
    };
  }, [coords.lat, coords.lon, city]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && root.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const tempText = tempC === null ? "--°C" : `${nf0.format(tempC)}°C`;
  const aqiText = aqi === null ? "--" : nf0.format(aqi);

  return (
    <div ref={rootRef} className={`cs ${align === "right" ? "cs--right" : ""}`.trim()}>
      <button
        type="button"
        className={`cs__pill ${loading ? "is-loading" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`${coords.label} • ${condition} • ${tempText} • AQI ${aqiText}`}
      >
        <span className="cs__city">{coords.short}</span>
        <span className="cs__sep" aria-hidden="true" />
        <span className="cs__wx">
          <span className="cs__wxIcon" aria-hidden="true">
            <WeatherIcon code={weatherCode} />
          </span>
          <span className="cs__temp">{tempText}</span>
        </span>
        <span className="cs__sep" aria-hidden="true" />
        <span className="cs__aqi">
          <span className={`cs__dot cs__dot--${band}`} aria-hidden="true" />
          <span className="cs__aqiLabel">AQI</span>
          <span className="cs__aqiValue">{aqiText}</span>
        </span>
      </button>

      {open ? (
        <div className="cs__menu" role="menu" aria-label="सहर छान्नुहोस्">
          {(Object.keys(CITY_PRESETS) as CityKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={city === key}
              className={`cs__item ${city === key ? "is-active" : ""}`}
              onClick={() => {
                setCity(key);
                setOpen(false);
              }}
            >
              {CITY_PRESETS[key].label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}


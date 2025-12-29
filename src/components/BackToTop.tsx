"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isHidden = pathname?.startsWith("/secret-admin-portal");

  useEffect(() => {
    if (isHidden) {
      setVisible(false);
      return;
    }

    let ticking = false;

    const update = () => {
      setVisible(window.scrollY > 600);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHidden]);

  if (isHidden || !visible) return null;

  const onClick = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <button type="button" className="backToTop" onClick={onClick} aria-label="Back to top">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 5l-7 7 1.4 1.4L11 8.8V19h2V8.8l4.6 4.6L19 12z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

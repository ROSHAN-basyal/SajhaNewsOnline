import type { MetadataRoute } from "next";
import { BRAND_SITE_URL } from "../lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

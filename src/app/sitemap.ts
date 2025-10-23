import type { MetadataRoute } from "next";
import { supabase } from "../lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://newznepal.com";

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  try {
    const { data } = await supabase
      .from("news_posts")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (data) {
      for (const row of data as { id: string; updated_at: string }[]) {
        entries.push({
          url: `${base}/posts/${row.id}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
    }
  } catch {}

  return entries;
}


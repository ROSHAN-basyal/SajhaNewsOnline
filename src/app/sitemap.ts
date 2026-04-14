import type { MetadataRoute } from "next";
import { BRAND_SITE_URL } from "../lib/brand";
import { listAllLocalPosts } from "../lib/localDb";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  try {
    const data = isSupabaseConfigured
      ? (
          await supabase
            .from("news_posts")
            .select("id, updated_at")
            .order("updated_at", { ascending: false })
            .limit(1000)
        ).data
      : listAllLocalPosts(1000).map((row) => ({
          id: row.id,
          updated_at: row.updated_at,
        }));

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

import { NextResponse } from "next/server";
import {
  BRAND_DESCRIPTION_DEVANAGARI,
  BRAND_NAME,
  BRAND_NAME_DEVANAGARI,
  BRAND_SITE_URL,
} from "../../lib/brand";
import { listAllLocalPosts } from "../../lib/localDb";
import { supabase } from "../../lib/supabase";
import { isSupabaseConfigured } from "../../lib/supabase";

const site = process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;

export async function GET() {
  const data = isSupabaseConfigured
    ? (
        await supabase
          .from("news_posts")
          .select("id, title, summary, updated_at, created_at")
          .order("created_at", { ascending: false })
          .limit(50)
      ).data
    : listAllLocalPosts(50).map((post) => ({
        id: post.id,
        title: post.title,
        summary: post.summary,
        updated_at: post.updated_at,
        created_at: post.created_at,
      }));

  const items = (data || []).map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${site}/posts/${p.id}</link>
      <guid>${site}/posts/${p.id}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${p.summary || ""}]]></description>
    </item>
  `).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>${BRAND_NAME_DEVANAGARI} - ${BRAND_NAME}</title>
      <link>${site}</link>
      <description>${BRAND_DESCRIPTION_DEVANAGARI}</description>
      <language>ne</language>
      ${items}
    </channel>
  </rss>`;

  return new NextResponse(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

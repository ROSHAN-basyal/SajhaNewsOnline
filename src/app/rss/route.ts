import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sajhanewsonline.com";

export async function GET() {
  const { data } = await supabase
    .from("news_posts")
    .select("id, title, summary, updated_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

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
      <title>साझा न्यूज अनलाइन - ताजा समाचार</title>
      <link>${site}</link>
      <description>नेपाल तथा विश्वका ताजा समाचार अपडेट</description>
      <language>ne</language>
      ${items}
    </channel>
  </rss>`;

  return new NextResponse(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}


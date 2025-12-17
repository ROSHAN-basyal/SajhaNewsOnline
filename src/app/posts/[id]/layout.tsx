import type { Metadata } from "next";
import { supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sajhanewsonline.com";
  try {
    const { data } = await supabase
      .from("news_posts")
      .select("id, title, summary, image_url, updated_at, created_at")
      .eq("id", params.id)
      .maybeSingle();

    if (!data) return { title: "समाचार", alternates: { canonical: `/posts/${params.id}` } };

    const title = data.title || "समाचार";
    const description = data.summary || "साझा न्यूज अनलाइनमा ताजा समाचार पढ्नुहोस्।";
    const url = `${base}/posts/${data.id}`;

    return {
      title,
      description,
      alternates: { canonical: `/posts/${data.id}` },
      openGraph: {
        type: "article",
        url,
        title,
        description,
        images: data.image_url
          ? [{ url: data.image_url, width: 1200, height: 630, alt: title }]
          : [{ url: "/images/logo.png", width: 512, height: 512, alt: "साझा न्यूज अनलाइन" }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: data.image_url ? [data.image_url] : ["/images/logo.png"],
      },
    };
  } catch {
    return { title: "समाचार" };
  }
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}


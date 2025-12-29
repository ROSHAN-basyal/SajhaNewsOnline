import type { Metadata } from "next";
import { supabase } from "../../../lib/supabase";
import { getSiteUrl, resolveSocialImageUrl } from "../../../lib/metadata";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = getSiteUrl();
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
    const imageUrl = data.image_url ? resolveSocialImageUrl(data.image_url) : null;
    const logoUrl = resolveSocialImageUrl("/images/logo.png");

    return {
      metadataBase: new URL(base),
      title,
      description,
      alternates: { canonical: `/posts/${data.id}` },
      openGraph: {
        type: "article",
        url,
        title,
        description,
        images: imageUrl
          ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
          : [{ url: logoUrl, width: 512, height: 512, alt: "साझा न्यूज अनलाइन" }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [logoUrl],
      },
    };
  } catch {
    return { title: "समाचार" };
  }
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}


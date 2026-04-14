import type { Metadata } from "next";
import { BRAND_LOGO_PATH, BRAND_NAME, BRAND_NAME_DEVANAGARI } from "../../../lib/brand";
import { getSiteUrl, resolveSocialImageUrl } from "../../../lib/metadata";
import { getLocalPostById } from "../../../lib/localDb";
import { getPostCoverImage } from "../../../lib/postImages";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = getSiteUrl();
  try {
    const data = isSupabaseConfigured
      ? (
          await supabase
            .from("news_posts")
            .select("id, title, summary, image_url, updated_at, created_at")
            .eq("id", params.id)
            .maybeSingle()
        ).data
      : getLocalPostById(params.id);

    if (!data) return { title: "समाचार", alternates: { canonical: `/posts/${params.id}` } };

    const title = data.title || "समाचार";
    const description = data.summary || `${BRAND_NAME_DEVANAGARI} मा ताजा समाचार पढ्नुहोस्।`;
    const url = `${base}/posts/${data.id}`;
    const imageUrl = getPostCoverImage(data) ? resolveSocialImageUrl(getPostCoverImage(data)) : null;
    const logoUrl = resolveSocialImageUrl(BRAND_LOGO_PATH);

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
          : [{ url: logoUrl, width: 1032, height: 242, alt: `${BRAND_NAME} logo` }],
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

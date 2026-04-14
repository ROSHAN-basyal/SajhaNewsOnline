import type { NewsPost } from "./supabase";

export type PostImageAlias = "img1" | "img2" | "img3";

export const POST_IMAGE_ALIASES: PostImageAlias[] = ["img1", "img2", "img3"];

export function getPostImageMap(post?: Pick<NewsPost, "image_url" | "image_urls"> | null) {
  const images = Array.isArray(post?.image_urls)
    ? post!.image_urls.filter((value): value is string => Boolean(value?.trim()))
    : [];

  const cover = post?.image_url?.trim() || images[0] || "";
  const normalized = [...images];

  if (cover && normalized[0] !== cover) {
    normalized.unshift(cover);
  }

  return {
    img1: normalized[0] || cover || "",
    img2: normalized[1] || "",
    img3: normalized[2] || "",
  };
}

export function getPostImageArray(post?: Pick<NewsPost, "image_url" | "image_urls"> | null) {
  const map = getPostImageMap(post);
  return POST_IMAGE_ALIASES.map((alias) => map[alias]).filter(Boolean);
}

export function getPostCoverImage(post?: Pick<NewsPost, "image_url" | "image_urls"> | null) {
  return getPostImageMap(post).img1 || "";
}

export function normalizePostImages<T extends Pick<NewsPost, "image_url" | "image_urls">>(
  post: T
) {
  const imageMap = getPostImageMap(post);
  const imageUrls = POST_IMAGE_ALIASES.map((alias) => imageMap[alias]).filter(Boolean);

  return {
    ...post,
    image_url: imageMap.img1 || undefined,
    image_urls: imageUrls.length > 0 ? imageUrls : undefined,
  };
}


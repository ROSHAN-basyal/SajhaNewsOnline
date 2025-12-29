const DEFAULT_SITE_URL = "https://sajhanewsonline.com";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const getSiteUrl = () =>
  trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);

export const resolveSocialImageUrl = (rawUrl?: string | null) => {
  const siteUrl = getSiteUrl();
  const trimmed = (rawUrl || "").trim();

  if (!trimmed) return `${siteUrl}/images/logo.png`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${siteUrl}${trimmed}`;

  if (trimmed.startsWith("storage/")) {
    const supabaseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    if (supabaseUrl) return `${supabaseUrl}/${trimmed}`;
  }

  return `${siteUrl}/${trimmed}`;
};

import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { BRAND_LOGO_PATH } from "./brand";
import type { NewsPost } from "./supabase";
import { clampDurationDays, getPostExpirationDate } from "./cleanup";
import { normalizePostImages } from "./postImages";

export interface AdvertisementRecord {
  id?: string;
  title: string;
  description?: string | null;
  image_url: string;
  click_url: string;
  placement: "header" | "sidebar_top" | "in_content" | "sidebar_mid" | "footer";
  status: "active" | "paused" | "expired" | "draft";
  priority: number;
  start_date?: string | null;
  end_date?: string | null;
  target_impressions: number;
  target_clicks: number;
  created_at?: string;
  updated_at?: string;
}

interface AnalyticsRecord {
  id: string;
  ad_id: string;
  event_type: "impression" | "click";
  user_ip?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  created_at: string;
}

interface AnalyticsSummaryRow {
  id: string;
  title: string;
  placement: AdvertisementRecord["placement"];
  impressions: number;
  clicks: number;
  ctr: string;
  latest_activity: string | null;
}

interface TrackEventInput {
  adId: string;
  eventType: "impression" | "click";
  userIp?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
}

interface LocalDbState {
  news_posts: NewsPost[];
  advertisements: AdvertisementRecord[];
  ad_analytics: AnalyticsRecord[];
}

const dataDir = join(process.cwd(), "local_files");
const dataPath = join(dataDir, "sajhanews-debug.json");

const seedPosts: Omit<NewsPost, "id" | "created_at" | "updated_at">[] = [
  {
    title: "Local Debug: Khabar Mulbata workspace is ready",
    summary:
      "This local article confirms the file-backed datastore is active for debugging on localhost.",
    content:
      "The cloned Khabar Mulbata codebase is now running with a local datastore saved inside the repository. You can edit posts, view articles, and test the admin portal without relying on the hosted Supabase project.",
    category: "latest",
    image_url: BRAND_LOGO_PATH,
    image_urls: [BRAND_LOGO_PATH],
    duration_days: 30,
  },
  {
    title: "Education ministry announces digital classroom pilot",
    summary:
      "A pilot program will introduce blended digital learning tools in selected public schools.",
    content:
      "Education officials said the pilot will focus on classroom connectivity, digital teaching materials, and teacher support. The local debug datastore includes this sample entry so feed filtering and article pages can be tested end to end.",
    category: "education",
    image_url: BRAND_LOGO_PATH,
    image_urls: [BRAND_LOGO_PATH],
    duration_days: 45,
  },
  {
    title: "Kathmandu clubs prepare for major sports week",
    summary:
      "Local organizers are coordinating venues, transport, and youth participation ahead of the event.",
    content:
      "Sports organizers said the upcoming week will include football, volleyball, and athletics competitions. This seeded record exists so category switching, pagination, and article rendering can be verified locally.",
    category: "sports",
    image_url: BRAND_LOGO_PATH,
    image_urls: [BRAND_LOGO_PATH],
    duration_days: 21,
  },
];

const seedAds: AdvertisementRecord[] = [
  {
    title: "Local Header Sponsor",
    description: "Sample banner stored in the local debug datastore.",
    image_url: BRAND_LOGO_PATH,
    click_url: "https://example.com/header-ad",
    placement: "header",
    status: "active",
    priority: 5,
    target_impressions: 0,
    target_clicks: 0,
  },
  {
    title: "Sidebar Debug Campaign",
    description: "Use this ad to test placement rendering and analytics.",
    image_url: BRAND_LOGO_PATH,
    click_url: "https://example.com/sidebar-ad",
    placement: "sidebar_top",
    status: "active",
    priority: 4,
    target_impressions: 0,
    target_clicks: 0,
  },
];

function ensureDataFile() {
  mkdirSync(dataDir, { recursive: true });

  try {
    readFileSync(dataPath, "utf8");
  } catch {
    const now = new Date();
    const posts = seedPosts.map((post, index) => {
      const createdAt = new Date(now.getTime() - index * 24 * 60 * 60 * 1000).toISOString();
      const durationDays = clampDurationDays(post.duration_days);
      return {
        id: randomUUID(),
        ...normalizePostImages(post),
        duration_days: durationDays,
        expires_at: new Date(
          new Date(createdAt).setDate(new Date(createdAt).getDate() + durationDays)
        ).toISOString(),
        created_at: createdAt,
        updated_at: createdAt,
      };
    });

    const ads = seedAds.map((ad, index) => {
      const timestamp = new Date(now.getTime() - index * 60 * 60 * 1000).toISOString();
      return {
        id: randomUUID(),
        ...ad,
        start_date: ad.start_date ?? timestamp,
        end_date: ad.end_date ?? null,
        created_at: timestamp,
        updated_at: timestamp,
      };
    });

    const initialState: LocalDbState = {
      news_posts: posts,
      advertisements: ads,
      ad_analytics: [],
    };

    writeFileSync(dataPath, JSON.stringify(initialState, null, 2));
  }
}

function readState(): LocalDbState {
  ensureDataFile();
  const state = JSON.parse(readFileSync(dataPath, "utf8")) as LocalDbState;
  let changed = false;

  state.news_posts = state.news_posts.map((post) => {
    const durationDays = clampDurationDays(post.duration_days);
    const normalized: NewsPost = {
      ...normalizePostImages(post),
      duration_days: durationDays,
      expires_at: getPostExpirationDate({
        created_at: post.created_at,
        duration_days: durationDays,
        expires_at: post.expires_at,
      }).toISOString(),
    };

    if (
      normalized.duration_days !== post.duration_days ||
      normalized.expires_at !== post.expires_at
    ) {
      changed = true;
    }

    return normalized;
  });

  if (changed) {
    writeState(state);
  }

  return state;
}

function writeState(nextState: LocalDbState) {
  writeFileSync(dataPath, JSON.stringify(nextState, null, 2));
}

export function getLocalDbPath() {
  ensureDataFile();
  return dataPath;
}

export function listLocalPosts({
  page = 0,
  limit = 10,
  category,
}: {
  page?: number;
  limit?: number;
  category?: string;
} = {}) {
  const state = readState();
  const filtered = state.news_posts
    .filter((post) => !category || category === "all" || post.category === category)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const offset = page * limit;
  return filtered.slice(offset, offset + limit);
}

export function listAllLocalPosts(limit = 1000) {
  const state = readState();
  return [...state.news_posts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function getLocalPostById(id: string) {
  const state = readState();
  return state.news_posts.find((post) => post.id === id) || null;
}

export function createLocalPost(
  input: Omit<NewsPost, "id" | "created_at" | "updated_at">
) {
  const state = readState();
  const now = new Date().toISOString();
  const post: NewsPost = {
    id: randomUUID(),
    title: input.title,
    content: input.content,
    summary: input.summary,
    category: input.category,
    image_url: input.image_url,
    image_urls: input.image_urls,
    duration_days: clampDurationDays(input.duration_days),
    expires_at: "",
    created_at: now,
    updated_at: now,
  };
  const normalizedPost = normalizePostImages(post)
  normalizedPost.expires_at = getPostExpirationDate(normalizedPost).toISOString()

  state.news_posts.push(normalizedPost);
  writeState(state);
  return normalizedPost;
}

export function updateLocalPost(
  id: string,
  input: Omit<NewsPost, "id" | "created_at" | "updated_at">
) {
  const state = readState();
  const index = state.news_posts.findIndex((post) => post.id === id);
  if (index === -1) return null;

  const current = state.news_posts[index];
  state.news_posts[index] = normalizePostImages({
    ...current,
    title: input.title,
    content: input.content,
    summary: input.summary,
    category: input.category,
    image_url: input.image_url,
    image_urls: input.image_urls,
    duration_days: clampDurationDays(input.duration_days),
    expires_at: "",
    updated_at: new Date().toISOString(),
  });
  state.news_posts[index].expires_at = getPostExpirationDate(state.news_posts[index]).toISOString()

  writeState(state);
  return state.news_posts[index];
}

export function deleteLocalPost(id: string) {
  const state = readState();
  const nextPosts = state.news_posts.filter((post) => post.id !== id);
  if (nextPosts.length === state.news_posts.length) return false;

  state.news_posts = nextPosts;
  writeState(state);
  return true;
}

export function cleanupLocalExpiredPosts() {
  const state = readState();
  const now = Date.now();

  const beforeCount = state.news_posts.length;
  state.news_posts = state.news_posts.filter(
    (post) => getPostExpirationDate(post).getTime() > now
  );
  const deletedCount = beforeCount - state.news_posts.length;

  writeState(state);

  return {
    success: true,
    deletedCount,
    message:
      deletedCount > 0
        ? `Deleted ${deletedCount} expired posts`
        : "No expired posts to delete",
  };
}

export function listLocalAds({
  placement,
  status,
  isAdmin = false,
  includeAnalytics = false,
}: {
  placement?: string | null;
  status?: string | null;
  isAdmin?: boolean;
  includeAnalytics?: boolean;
} = {}) {
  const state = readState();
  const now = Date.now();

  const ads = state.advertisements
    .filter((ad) => !placement || ad.placement === placement)
    .filter((ad) => {
      if (isAdmin) {
        return !status || ad.status === status;
      }

      const startOk = !ad.start_date || new Date(ad.start_date).getTime() <= now;
      const endOk = !ad.end_date || new Date(ad.end_date).getTime() >= now;
      return ad.status === "active" && startOk && endOk;
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  if (!includeAnalytics) return ads;

  const summary = getLocalAdAnalyticsSummary();
  const byId = new Map(summary.summary.map((row) => [row.id, row]));

  return ads.map((ad) => {
    const analytics = byId.get(ad.id || "");
    return {
      ...ad,
      total_impressions: analytics?.impressions || 0,
      total_clicks: analytics?.clicks || 0,
      ctr_percentage: analytics ? Number(analytics.ctr) : 0,
    };
  });
}

export function createLocalAd(input: AdvertisementRecord) {
  const state = readState();
  const now = new Date().toISOString();
  const ad: AdvertisementRecord = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? null,
    image_url: input.image_url,
    click_url: input.click_url,
    placement: input.placement,
    status: input.status,
    priority: input.priority,
    start_date: input.start_date ?? now,
    end_date: input.end_date ?? null,
    target_impressions: input.target_impressions ?? 0,
    target_clicks: input.target_clicks ?? 0,
    created_at: now,
    updated_at: now,
  };

  state.advertisements.push(ad);
  writeState(state);
  return ad;
}

export function getLocalAdById(id: string) {
  const state = readState();
  return state.advertisements.find((ad) => ad.id === id) || null;
}

export function updateLocalAd(id: string, input: Partial<AdvertisementRecord>) {
  const state = readState();
  const index = state.advertisements.findIndex((ad) => ad.id === id);
  if (index === -1) return null;

  state.advertisements[index] = {
    ...state.advertisements[index],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  };

  writeState(state);
  return state.advertisements[index];
}

export function deleteLocalAd(id: string) {
  const state = readState();
  const nextAds = state.advertisements.filter((ad) => ad.id !== id);
  if (nextAds.length === state.advertisements.length) return false;

  state.advertisements = nextAds;
  state.ad_analytics = state.ad_analytics.filter((record) => record.ad_id !== id);
  writeState(state);
  return true;
}

export function trackLocalAdEvent({
  adId,
  eventType,
  userIp,
  userAgent,
  referrer,
}: TrackEventInput) {
  const state = readState();
  const ad = state.advertisements.find((record) => record.id === adId);

  if (!ad) {
    return { ok: false, status: 404, error: "Advertisement not found" };
  }

  const now = new Date();
  const startDate = ad.start_date ? new Date(ad.start_date) : null;
  const endDate = ad.end_date ? new Date(ad.end_date) : null;

  if (ad.status !== "active") {
    return { ok: false, status: 400, error: "Advertisement is not active" };
  }

  if (startDate && startDate > now) {
    return { ok: false, status: 400, error: "Advertisement has not started yet" };
  }

  if (endDate && endDate < now) {
    return { ok: false, status: 400, error: "Advertisement has expired" };
  }

  state.ad_analytics.push({
    id: randomUUID(),
    ad_id: adId,
    event_type: eventType,
    user_ip: userIp ?? null,
    user_agent: userAgent ?? null,
    referrer: referrer ?? null,
    created_at: now.toISOString(),
  });

  writeState(state);
  return { ok: true, ad };
}

export function getLocalAdAnalyticsSummary({
  adId,
  dateFilter,
}: {
  adId?: string | null;
  dateFilter?: string;
} = {}) {
  const state = readState();
  const since = dateFilter ? new Date(dateFilter).getTime() : null;

  const filtered = state.ad_analytics.filter((record) => {
    if (adId && record.ad_id !== adId) return false;
    if (since && new Date(record.created_at).getTime() < since) return false;
    return true;
  });

  const grouped = new Map<string, AnalyticsSummaryRow>();

  filtered.forEach((record) => {
    const ad = state.advertisements.find((item) => item.id === record.ad_id);
    if (!ad || !ad.id) return;

    const current =
      grouped.get(ad.id) ||
      ({
        id: ad.id,
        title: ad.title,
        placement: ad.placement,
        impressions: 0,
        clicks: 0,
        ctr: "0.00",
        latest_activity: null,
      } satisfies AnalyticsSummaryRow);

    if (record.event_type === "impression") current.impressions += 1;
    if (record.event_type === "click") current.clicks += 1;

    if (
      !current.latest_activity ||
      new Date(record.created_at).getTime() > new Date(current.latest_activity).getTime()
    ) {
      current.latest_activity = record.created_at;
    }

    current.ctr =
      current.impressions > 0
        ? ((current.clicks / current.impressions) * 100).toFixed(2)
        : "0.00";

    grouped.set(ad.id, current);
  });

  const summary = [...grouped.values()].sort((a, b) => {
    return new Date(b.latest_activity || 0).getTime() - new Date(a.latest_activity || 0).getTime();
  });

  return {
    summary,
    total_records: filtered.length,
  };
}

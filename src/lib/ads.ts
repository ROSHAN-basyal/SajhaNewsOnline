export interface Advertisement {
  id?: string;
  title: string;
  description?: string;
  image_url: string;
  click_url: string;
  placement: "header" | "sidebar_top" | "in_content" | "sidebar_mid" | "footer";
  status: "active" | "paused" | "expired" | "draft";
  priority: number;
  start_date?: string;
  end_date?: string;
  target_impressions: number;
  target_clicks: number;
  created_at?: string;
  updated_at?: string;
}

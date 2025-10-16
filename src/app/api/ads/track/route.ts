import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { headers } from "next/headers";

// POST /api/ads/track - Track ad impressions and clicks
export async function POST(request: NextRequest) {
  try {
    const { ad_id, event_type } = await request.json();

    // Validate input
    if (!ad_id || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields: ad_id, event_type" },
        { status: 400 }
      );
    }

    if (!["impression", "click"].includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event_type. Must be "impression" or "click"' },
        { status: 400 }
      );
    }

    // Verify the ad exists and is active
    const { data: ad } = await supabase
      .from("advertisements")
      .select("id, title, status, start_date, end_date")
      .eq("id", ad_id)
      .single();

    if (!ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Check if ad is active and within date range
    const now = new Date();
    const startDate = ad.start_date ? new Date(ad.start_date) : null;
    const endDate = ad.end_date ? new Date(ad.end_date) : null;

    if (ad.status !== "active") {
      return NextResponse.json(
        { error: "Advertisement is not active" },
        { status: 400 }
      );
    }

    if (startDate && startDate > now) {
      return NextResponse.json(
        { error: "Advertisement has not started yet" },
        { status: 400 }
      );
    }

    if (endDate && endDate < now) {
      return NextResponse.json(
        { error: "Advertisement has expired" },
        { status: 400 }
      );
    }

    // Get client information for tracking
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || "Unknown";
    const referrer = headersList.get("referer") || null;

    // Get client IP (handling various proxy scenarios)
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = forwarded?.split(",")[0] || realIp || "127.0.0.1";

    // Insert tracking data
    const { data: trackingData, error } = await supabase
      .from("ad_analytics")
      .insert([
        {
          ad_id: ad_id,
          event_type: event_type,
          user_ip: clientIp,
          user_agent: userAgent,
          referrer: referrer,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // For clicks, also redirect to the click URL
    if (event_type === "click") {
      console.log(`🎯 Ad click tracked: ${ad.title} (${ad_id})`);

      // Get the click URL
      const { data: adData } = await supabase
        .from("advertisements")
        .select("click_url")
        .eq("id", ad_id)
        .single();

      return NextResponse.json({
        success: true,
        message: "Click tracked successfully",
        redirect_url: adData?.click_url,
      });
    } else {
      console.log(`👁️ Ad impression tracked: ${ad.title} (${ad_id})`);
      return NextResponse.json({
        success: true,
        message: "Impression tracked successfully",
      });
    }
  } catch (error) {
    console.error("Error tracking ad event:", error);
    return NextResponse.json(
      { error: "Failed to track ad event" },
      { status: 500 }
    );
  }
}

// GET /api/ads/track - Get analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
    // Simple session check (you could make this more robust)
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("ad_id");
    const timeRange = searchParams.get("range") || "7d"; // 1d, 7d, 30d, all

    // Build date filter based on time range
    let dateFilter = "";
    const now = new Date();

    switch (timeRange) {
      case "1d":
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        dateFilter = oneDayAgo.toISOString();
        break;
      case "7d":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
        break;
      case "30d":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString();
        break;
      default:
        dateFilter = ""; // No filter for 'all'
    }

    let query = supabase.from("ad_analytics").select(`
        event_type,
        created_at,
        advertisements!inner(id, title, placement)
      `);

    if (adId) {
      query = query.eq("ad_id", adId);
    }

    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data: analytics, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    // Group analytics by ad and event type
    const summary: { [key: string]: any } = {};

    analytics?.forEach((record) => {
      // Fix: Handle advertisements as an object (not array)
      const ad = record.advertisements as any;
      const adId = ad?.id;
      const adTitle = ad?.title;
      const adPlacement = ad?.placement;

      if (!summary[adId]) {
        summary[adId] = {
          id: adId,
          title: adTitle,
          placement: adPlacement,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          latest_activity: record.created_at,
        };
      }

      if (record.event_type === "impression") {
        summary[adId].impressions++;
      } else if (record.event_type === "click") {
        summary[adId].clicks++;
      }
    });

    // Calculate CTR for each ad
    Object.values(summary).forEach((ad: any) => {
      ad.ctr =
        ad.impressions > 0
          ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
          : "0.00";
    });

    return NextResponse.json({
      summary: Object.values(summary),
      total_records: analytics?.length || 0,
      time_range: timeRange,
    });
  } catch (error) {
    console.error("Error fetching ad analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad analytics" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { cookies } from 'next/headers'

export interface Advertisement {
  id?: string
  title: string
  description?: string
  image_url: string
  click_url: string
  placement: 'header' | 'sidebar_top' | 'in_content' | 'sidebar_mid' | 'footer'
  status: 'active' | 'paused' | 'expired' | 'draft'
  priority: number
  start_date?: string
  end_date?: string
  target_impressions: number
  target_clicks: number
  created_at?: string
  updated_at?: string
}

// Verify admin session
async function verifyAdminSession(request: NextRequest) {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('admin_session')
  
  if (!sessionCookie) {
    return null
  }

  const { data } = await supabase
    .from('admin_sessions')
    .select('user_id, admin_users!inner(username)')
    .eq('session_token', sessionCookie.value)
    .gt('expires_at', new Date().toISOString())
    .single()

  return data
}

// GET /api/ads - Fetch advertisements (admin gets all, public gets active only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get('placement')
    const status = searchParams.get('status')
    const includeAnalytics = searchParams.get('analytics') === 'true'

    // Check if admin is authenticated
    const adminSession = await verifyAdminSession(request)
    const isAdmin = !!adminSession

    let query = supabase.from('advertisements').select('*')

    // Public users only see active ads within date range
    if (!isAdmin) {
      query = query
        .eq('status', 'active')
        .or('start_date.is.null,start_date.lte.' + new Date().toISOString())
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
    }

    // Apply filters
    if (placement) {
      query = query.eq('placement', placement)
    }
    if (status && isAdmin) {
      query = query.eq('status', status)
    }

    // Order by priority and creation date
    query = query.order('priority', { ascending: false }).order('created_at', { ascending: false })

    const { data: ads, error } = await query

    if (error) throw error

    // If admin requests analytics, include performance data
    if (isAdmin && includeAnalytics) {
      const { data: analyticsData } = await supabase
        .from('ad_performance_summary')
        .select('*')

      const adsWithAnalytics = ads?.map(ad => {
        const analytics = analyticsData?.find(a => a.id === ad.id)
        return {
          ...ad,
          total_impressions: analytics?.total_impressions || 0,
          total_clicks: analytics?.total_clicks || 0,
          ctr_percentage: analytics?.ctr_percentage || 0
        }
      })

      return NextResponse.json({ ads: adsWithAnalytics })
    }

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    )
  }
}

// POST /api/ads - Create new advertisement (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminSession = await verifyAdminSession(request)
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adData: Advertisement = await request.json()

    // Validate required fields
    if (!adData.title || !adData.image_url || !adData.click_url || !adData.placement) {
      return NextResponse.json(
        { error: 'Missing required fields: title, image_url, click_url, placement' },
        { status: 400 }
      )
    }

    // Validate placement
    const validPlacements = ['header', 'sidebar_top', 'in_content', 'sidebar_mid', 'footer']
    if (!validPlacements.includes(adData.placement)) {
      return NextResponse.json(
        { error: 'Invalid placement. Must be one of: ' + validPlacements.join(', ') },
        { status: 400 }
      )
    }

    // Set defaults
    const newAd = {
      title: adData.title,
      description: adData.description || null,
      image_url: adData.image_url,
      click_url: adData.click_url,
      placement: adData.placement,
      status: adData.status || 'active',
      priority: adData.priority || 1,
      start_date: adData.start_date || new Date().toISOString(),
      end_date: adData.end_date || null,
      target_impressions: adData.target_impressions || 0,
      target_clicks: adData.target_clicks || 0
    }

    const { data: ad, error } = await supabase
      .from('advertisements')
      .insert([newAd])
      .select()
      .single()

    if (error) throw error

    console.log(`✅ New advertisement created: ${ad.title} for ${ad.placement}`)

    return NextResponse.json({ 
      message: 'Advertisement created successfully', 
      ad 
    })
  } catch (error) {
    console.error('Error creating advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to create advertisement' },
      { status: 500 }
    )
  }
}

// PUT /api/ads - Update advertisement (admin only)
export async function PUT(request: NextRequest) {
  try {
    const adminSession = await verifyAdminSession(request)
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const adId = searchParams.get('id')

    if (!adId) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    delete updateData.id // Remove ID from update data
    delete updateData.created_at // Remove timestamp fields
    delete updateData.updated_at

    const { data: ad, error } = await supabase
      .from('advertisements')
      .update(updateData)
      .eq('id', adId)
      .select()
      .single()

    if (error) throw error

    if (!ad) {
      return NextResponse.json(
        { error: 'Advertisement not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Advertisement updated: ${ad.title}`)

    return NextResponse.json({ 
      message: 'Advertisement updated successfully', 
      ad 
    })
  } catch (error) {
    console.error('Error updating advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to update advertisement' },
      { status: 500 }
    )
  }
}

// DELETE /api/ads - Delete advertisement (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const adminSession = await verifyAdminSession(request)
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const adId = searchParams.get('id')

    if (!adId) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      )
    }

    // First get the ad data for logging
    const { data: ad } = await supabase
      .from('advertisements')
      .select('title, placement')
      .eq('id', adId)
      .single()

    // Delete the advertisement (analytics will be deleted via CASCADE)
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', adId)

    if (error) throw error

    console.log(`🗑️ Advertisement deleted: ${ad?.title} from ${ad?.placement}`)

    return NextResponse.json({ 
      message: 'Advertisement deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to delete advertisement' },
      { status: 500 }
    )
  }
}
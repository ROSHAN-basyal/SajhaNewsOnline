import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../../../lib/supabase'
import { isLocalAdminSession } from '../../../lib/devAdmin'
import { clampDurationDays, getPostExpirationDate } from '../../../lib/cleanup'
import { cleanupLocalExpiredPosts, createLocalPost, listLocalPosts } from '../../../lib/localDb'
import { normalizePostImages } from '../../../lib/postImages'

// Helper function to verify admin session
async function verifyAdminSession(sessionToken: string) {
  if (isLocalAdminSession(sessionToken)) {
    return true
  }

  if (!isSupabaseConfigured) {
    return false
  }

  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  return !error && session
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || undefined

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        posts: listLocalPosts({ page, limit, category })
      })
    }

    // Run automatic cleanup occasionally (every ~100 requests)
    if (Math.random() < 0.01) {
      import('../../../lib/cleanup')
        .then(({ cleanupExpiredPosts }) => cleanupExpiredPosts())
        .catch((error) => {
          console.error('Background cleanup failed:', error)
        })
    }
    const offset = page * limit

    let query = supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts: data })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, summary, category, image_url, image_urls, duration_days } = await request.json()

    if (!title || !content || !summary || !category) {
      return NextResponse.json(
        { error: 'Title, content, summary, and category are required' },
        { status: 400 }
      )
    }

    const normalizedImages = normalizePostImages({
      image_url,
      image_urls,
    })

    const normalizedDurationDays = clampDurationDays(duration_days)
    const expiresAt = getPostExpirationDate({
      created_at: new Date().toISOString(),
      duration_days: normalizedDurationDays,
    }).toISOString()

    if (!isSupabaseConfigured) {
      const post = createLocalPost({
        title,
        content,
        summary,
        category,
        image_url: normalizedImages.image_url,
        image_urls: normalizedImages.image_urls,
        duration_days: normalizedDurationDays,
        expires_at: expiresAt,
      })

      return NextResponse.json({
        post,
        message: 'Post created successfully!',
      })
    }

    const { data: post, error } = await supabase
      .from('news_posts')
      .insert({
        title,
        content,
        summary,
        category,
        image_url: normalizedImages.image_url,
        image_urls: normalizedImages.image_urls,
        duration_days: normalizedDurationDays,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({
      post,
      message: 'Post created successfully!',
    })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { cleanupExpiredPosts } from '../../../lib/cleanup'

// Helper function to verify admin session
async function verifyAdminSession(sessionToken: string) {
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
    // Run automatic cleanup occasionally (every ~100 requests)
    if (Math.random() < 0.01) {
      cleanupExpiredPosts().catch((error) => {
        console.error('Background cleanup failed:', error)
      })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = page * limit

    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

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

    const { title, content, summary, category, image_url } = await request.json()

    if (!title || !content || !summary || !category) {
      return NextResponse.json(
        { error: 'Title, content, summary, and category are required' },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from('news_posts')
      .insert({
        title,
        content,
        summary,
        category,
        image_url,
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

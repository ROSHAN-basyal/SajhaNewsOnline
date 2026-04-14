import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../../../../lib/supabase'
import { isLocalAdminSession } from '../../../../lib/devAdmin'
import { clampDurationDays, getPostExpirationDate } from '../../../../lib/cleanup'
import { deleteLocalPost, getLocalPostById, updateLocalPost } from '../../../../lib/localDb'
import { normalizePostImages } from '../../../../lib/postImages'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured) {
      const post = getLocalPostById(params.id)
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ post })
    }

    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    const existingPost = !isSupabaseConfigured ? getLocalPostById(params.id) : null
    const createdAtForExpiry = existingPost?.created_at || new Date().toISOString()
    const expiresAt = getPostExpirationDate({
      created_at: createdAtForExpiry,
      duration_days: normalizedDurationDays,
    }).toISOString()

    if (!isSupabaseConfigured) {
      const post = updateLocalPost(params.id, {
        title,
        content,
        summary,
        category,
        image_url: normalizedImages.image_url,
        image_urls: normalizedImages.image_urls,
        duration_days: normalizedDurationDays,
        expires_at: expiresAt,
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ post })
    }

    const { data, error } = await supabase
      .from('news_posts')
      .update({
        title,
        content,
        summary,
        category,
        image_url: normalizedImages.image_url,
        image_urls: normalizedImages.image_urls,
        duration_days: normalizedDurationDays,
        expires_at: expiresAt,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post: data })

  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!isSupabaseConfigured) {
      const deleted = deleteLocalPost(params.id)

      if (!deleted) {
        return NextResponse.json(
          { error: 'Failed to delete post' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from('news_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { cleanupExpiredPosts } from '../../../lib/cleanup'
import emailService from '../../../lib/emailService'

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
      console.log('🔄 Running automatic cleanup...')
      cleanupExpiredPosts().catch(error => {
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
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts: data })

  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
        image_url
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Auto-send newsletter to subscribers for new posts
    try {
      const { data: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('active', true)

      if (subscribers && subscribers.length > 0) {
        const subscriberEmails = subscribers.map(s => s.email)
        console.log(`📧 Auto-sending newsletter for new post "${post.title}" to ${subscriberEmails.length} subscribers`)
        
        // Send newsletter in background (don't wait for it)
        emailService.sendNewsletterToSubscribers(post, subscriberEmails)
          .then(result => {
            console.log(`✅ Newsletter auto-sent: ${result.sent} emails sent`)
            if (result.errors) {
              console.error('Newsletter errors:', result.errors)
            }
          })
          .catch(error => {
            console.error('❌ Newsletter auto-send failed:', error)
          })
      } else {
        console.log('📧 No active newsletter subscribers found')
      }
    } catch (newsletterError) {
      // Don't fail post creation if newsletter fails
      console.error('Newsletter auto-send error (non-fatal):', newsletterError)
    }

    return NextResponse.json({ 
      post: post,
      message: 'Post created successfully! Newsletter will be sent to subscribers.'
    })

  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
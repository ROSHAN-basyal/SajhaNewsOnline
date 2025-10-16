import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
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

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get the post details
    const { data: post, error: postError } = await supabase
      .from('news_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get active newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('active', true)

    if (subscribersError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    const subscriberEmails = subscribers?.map(s => s.email) || []

    if (subscriberEmails.length === 0) {
      return NextResponse.json(
        { message: 'No active subscribers found' },
        { status: 200 }
      )
    }

    // Send emails using the email service
    const result = await emailService.sendNewsletterToSubscribers(post, subscriberEmails)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to send newsletter',
        errors: result.errors
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${result.sent} subscribers`,
      sentCount: result.sent,
      errors: result.errors
    })

  } catch (error) {
    console.error('Send newsletter error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Auto-send newsletter when new posts are created
export async function PUT(request: NextRequest) {
  try {
    // This endpoint can be called automatically when a new post is published
    const { postId } = await request.json()
    
    // Check if post was created in the last 5 minutes (recently created)
    const { data: post } = await supabase
      .from('news_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (post) {
      const createdAt = new Date(post.created_at)
      const now = new Date()
      const timeDiff = now.getTime() - createdAt.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      if (minutesDiff <= 5) {
        // Auto-send newsletter for new posts
        const { data: subscribers } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('active', true)

        if (subscribers && subscribers.length > 0) {
          const subscriberEmails = subscribers.map(s => s.email)
          await emailService.sendNewsletterToSubscribers(post, subscriberEmails)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auto-send newsletter error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
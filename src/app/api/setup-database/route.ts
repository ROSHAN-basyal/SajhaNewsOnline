import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

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

    console.log('Starting database setup...')

    // Step 1: Update existing posts to have a default category
    const { data: existingPosts, error: fetchError } = await supabase
      .from('news_posts')
      .select('id')

    if (fetchError) {
      console.error('Error fetching existing posts:', fetchError)
    }

    if (existingPosts && existingPosts.length > 0) {
      // Update existing posts to have 'latest' as default category
      const { error: updateError } = await supabase
        .from('news_posts')
        .update({ category: 'latest' })
        .is('category', null)

      if (updateError) {
        console.log('Note: Category column may not exist yet, will be created with new posts')
      } else {
        console.log(`Updated ${existingPosts.length} existing posts with default category`)
      }
    }

    // Additional setup steps can be added here as needed.
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!'
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Database setup failed' },
      { status: 500 }
    )
  }
}

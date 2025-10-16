import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { cleanupExpiredPosts } from '../../../lib/cleanup'

// Verify admin session
async function verifyAdminSession(sessionToken: string) {
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  return !error && data
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication for manual cleanup
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !await verifyAdminSession(sessionToken)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    console.log('🔧 Manual cleanup initiated by admin')
    const result = await cleanupExpiredPosts()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for automatic cleanup (can be called by cron jobs)
export async function GET(request: NextRequest) {
  try {
    // Check for cleanup secret key to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cleanupSecret = process.env.CLEANUP_SECRET || 'your-secret-cleanup-key'
    
    if (authHeader !== `Bearer ${cleanupSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🤖 Automatic cleanup initiated')
    const result = await cleanupExpiredPosts()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Auto-cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
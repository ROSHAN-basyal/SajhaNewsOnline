import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../../../lib/supabase'
import { isLocalAdminSession } from '../../../lib/devAdmin'
import { cleanupLocalExpiredPosts } from '../../../lib/localDb'

export const dynamic = 'force-dynamic'

// Verify admin session
async function verifyAdminSession(sessionToken: string) {
  if (isLocalAdminSession(sessionToken)) {
    return true
  }

  if (!isSupabaseConfigured) {
    return false
  }

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

    if (!isSupabaseConfigured) {
      return NextResponse.json(cleanupLocalExpiredPosts())
    }

    console.log('🔧 Manual cleanup initiated by admin')
    const { cleanupExpiredPosts } = await import('../../../lib/cleanup')
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
    const cleanupSecret =
      process.env.CRON_SECRET ||
      process.env.CLEANUP_SECRET ||
      'your-secret-cleanup-key'
    
    if (authHeader !== `Bearer ${cleanupSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(cleanupLocalExpiredPosts())
    }

    console.log('🤖 Automatic cleanup initiated')
    const { cleanupExpiredPosts } = await import('../../../lib/cleanup')
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

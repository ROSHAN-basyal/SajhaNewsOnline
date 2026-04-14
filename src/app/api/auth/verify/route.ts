import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../../../../lib/supabase'
import { getLocalAdminUser, isLocalAdminSession } from '../../../../lib/devAdmin'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    if (isLocalAdminSession(sessionToken)) {
      return NextResponse.json({
        authenticated: true,
        user: getLocalAdminUser()
      })
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { authenticated: false, error: getSupabaseConfigError() },
        { status: 503 }
      )
    }

    // Check if session is valid
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admin_users (id, username)
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: session.admin_users
    })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json()
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    if (isLocalAdminSession(sessionToken)) {
      return NextResponse.json({
        authenticated: true,
        user: getLocalAdminUser()
      })
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { authenticated: false, error: getSupabaseConfigError() },
        { status: 503 }
      )
    }

    // Check if session is valid (simplified for existing schema)
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admin_users (id, username)
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: session.admin_users
    })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../../../../lib/supabase'
import {
  getLocalAdminUser,
  matchesLocalAdminCredentials,
  setAdminSessionCookie,
  setLocalAdminSessionCookie,
} from '../../../../lib/devAdmin'

export async function POST(request: NextRequest) {
  try {
    const { username, password, deviceId } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (matchesLocalAdminCredentials(username, password)) {
      const response = NextResponse.json({
        success: true,
        user: getLocalAdminUser(),
        message: 'Local development login successful'
      })

      setLocalAdminSessionCookie(response)
      return response
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: getSupabaseConfigError() },
        { status: 503 }
      )
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session (simplified for existing schema)
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
      message: 'Login successful'
    })

    // Set HTTP-only cookie
    setAdminSessionCookie(response, sessionToken)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

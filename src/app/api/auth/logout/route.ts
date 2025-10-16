import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (sessionToken) {
      // Delete the session from database
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)
    }

    const response = NextResponse.json({ success: true })
    
    // Clear cookie
    response.cookies.delete('admin_session')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

async function verifyAdminSession(sessionToken: string) {
  try {
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    return !error && session
  } catch (error) {
    console.error('Session verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !(await verifyAdminSession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Check if columns already exist
    const { data: tableInfo } = await supabase
      .rpc('get_table_columns', { table_name: 'admin_sessions' })

    const existingColumns = tableInfo?.map((col: any) => col.column_name) || []
    
    const needsDeviceId = !existingColumns.includes('device_id')
    const needsLastActivity = !existingColumns.includes('last_activity')
    const needsCreatedAt = !existingColumns.includes('created_at')

    if (needsDeviceId || needsLastActivity || needsCreatedAt) {
      // Add missing columns using raw SQL
      const alterCommands = []
      
      if (needsDeviceId) {
        alterCommands.push('ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS device_id TEXT;')
      }
      
      if (needsLastActivity) {
        alterCommands.push('ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
      }
      
      if (needsCreatedAt) {
        alterCommands.push('ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
      }

      // Execute all commands
      for (const command of alterCommands) {
        const { error } = await supabase.rpc('exec_sql', { sql_command: command })
        if (error) {
          console.error('Migration error:', error)
          return NextResponse.json(
            { error: `Migration failed: ${error.message}` },
            { status: 500 }
          )
        }
      }

      // Update existing sessions with default values
      await supabase
        .from('admin_sessions')
        .update({
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          device_id: 'legacy_device_' + Math.random().toString(36).substr(2, 9)
        })
        .is('device_id', null)

      return NextResponse.json({
        success: true,
        message: 'Session table migration completed successfully!',
        migrated: { device_id: needsDeviceId, last_activity: needsLastActivity, created_at: needsCreatedAt }
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Session table is already up to date!',
        migrated: false
      })
    }

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}
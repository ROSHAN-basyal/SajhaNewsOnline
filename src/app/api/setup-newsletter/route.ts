import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up newsletter subscribers table...')

    // Create the newsletter_subscribers table using raw SQL
    const createTableSQL = `
      -- Create newsletter_subscribers table
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Add indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(active);
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);
    `

    // Execute the SQL to create the table
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL })

    if (error) {
      console.error('Error creating newsletter_subscribers table:', error)
      return NextResponse.json(
        { error: 'Failed to create newsletter_subscribers table', details: error.message },
        { status: 500 }
      )
    }

    // Test if table was created by trying to read from it
    const { data: testData, error: testError } = await supabase
      .from('newsletter_subscribers')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('Table creation verification failed:', testError)
      return NextResponse.json(
        { error: 'Table creation verification failed', details: testError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter subscribers table created successfully!'
    })

  } catch (error) {
    console.error('Newsletter setup error:', error)
    return NextResponse.json(
      { error: 'Newsletter setup failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}
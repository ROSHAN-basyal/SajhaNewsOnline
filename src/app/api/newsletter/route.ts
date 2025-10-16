import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

async function ensureNewsletterTableExists() {
  // Try to create the table structure using a test insert that will fail gracefully
  try {
    // First, try to select from the table to see if it exists
    const { data: testSelect, error: selectError } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .limit(1)
    
    if (selectError && selectError.code === 'PGRST116') {
      // Table doesn't exist, need to create it
      console.log('Newsletter subscribers table does not exist. Please create it manually.')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking newsletter table:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Ensure table exists
    const tableExists = await ensureNewsletterTableExists()
    if (!tableExists) {
      return NextResponse.json(
        { 
          error: 'Newsletter service is not properly configured. Please contact the administrator.',
          setupRequired: true
        },
        { status: 503 }
      )
    }

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing subscriber:', checkError)
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email is already subscribed' },
        { status: 400 }
      )
    }

    // Add new subscriber
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Newsletter subscription error:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed to newsletter!'
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, subscribed_at')
      .eq('active', true)
      .order('subscribed_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      subscribers: data,
      count: data.length
    })

  } catch (error) {
    console.error('Fetch subscribers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
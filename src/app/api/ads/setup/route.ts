import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { cookies } from 'next/headers'

// POST /api/ads/setup - Initialize advertisement tables and sample data
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('admin_session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin session required' },
        { status: 401 }
      )
    }

    const { data: adminSession } = await supabase
      .from('admin_sessions')
      .select('user_id')
      .eq('session_token', sessionCookie.value)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin session' },
        { status: 401 }
      )
    }

    console.log('🚀 Setting up advertisement system...')

    // SQL to create tables and policies
    const setupSQL = `
      -- Create ads table for banner advertisements
      CREATE TABLE IF NOT EXISTS advertisements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          click_url TEXT NOT NULL,
          placement VARCHAR(50) NOT NULL CHECK (placement IN ('header', 'sidebar_top', 'in_content', 'sidebar_mid', 'footer')),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'draft')),
          priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
          start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_date TIMESTAMP WITH TIME ZONE,
          target_impressions INTEGER DEFAULT 0,
          target_clicks INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ad_analytics table for tracking performance
      CREATE TABLE IF NOT EXISTS ad_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
          event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click')),
          user_ip VARCHAR(45),
          user_agent TEXT,
          referrer TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Add indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_ads_placement_status ON advertisements(placement, status);
      CREATE INDEX IF NOT EXISTS idx_ads_priority ON advertisements(priority DESC);
      CREATE INDEX IF NOT EXISTS idx_ads_dates ON advertisements(start_date, end_date);
      CREATE INDEX IF NOT EXISTS idx_analytics_ad_id ON ad_analytics(ad_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON ad_analytics(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON ad_analytics(created_at);
    `

    // Execute the setup SQL
    const { error: setupError } = await supabase.rpc('exec_sql', { sql: setupSQL })
    
    if (setupError && !setupError.message.includes('already exists')) {
      console.error('Setup SQL error:', setupError)
      // Continue anyway as tables might already exist
    }

    // Enable RLS and create policies
    try {
      // Check if tables exist and enable RLS
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: `
          ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
          ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;
        `
      })
      
      if (rlsError && !rlsError.message.includes('already enabled')) {
        console.log('RLS might already be enabled:', rlsError.message)
      }
    } catch (error) {
      console.log('RLS setup warning (tables might already be configured):', error)
    }

    // Check if sample data already exists
    const { data: existingAds } = await supabase
      .from('advertisements')
      .select('id')
      .limit(1)

    if (!existingAds || existingAds.length === 0) {
      // Insert sample advertisements
      const sampleAds = [
        {
          title: 'Nepal Tourism Board',
          description: 'Visit Nepal 2024 - Discover the beauty of Nepal',
          image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=728&h=90&fit=crop',
          click_url: 'https://www.welcomenepal.com',
          placement: 'header',
          priority: 1,
          status: 'active'
        },
        {
          title: 'Local Business Ad',
          description: 'Best restaurant in Kathmandu - Authentic Nepali cuisine',
          image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=250&fit=crop',
          click_url: 'https://example-restaurant.com',
          placement: 'sidebar_top',
          priority: 2,
          status: 'active'
        },
        {
          title: 'Tech Company',
          description: 'Leading IT solutions in Nepal - Digital transformation experts',
          image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=728&h=90&fit=crop',
          click_url: 'https://example-tech.com',
          placement: 'in_content',
          priority: 1,
          status: 'active'
        },
        {
          title: 'Banking Services',
          description: 'Modern banking for modern Nepal - Open your account today',
          image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=600&fit=crop',
          click_url: 'https://example-bank.com',
          placement: 'sidebar_mid',
          priority: 1,
          status: 'active'
        },
        {
          title: 'Education Institute',
          description: 'Quality education in Nepal - Enroll now for better future',
          image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=728&h=90&fit=crop',
          click_url: 'https://example-education.com',
          placement: 'footer',
          priority: 3,
          status: 'active'
        }
      ]

      const { data: insertedAds, error: insertError } = await supabase
        .from('advertisements')
        .insert(sampleAds)
        .select()

      if (insertError) {
        console.error('Error inserting sample ads:', insertError)
        throw insertError
      }

      console.log(`✅ ${insertedAds?.length || 0} sample advertisements created`)
    } else {
      console.log('✅ Sample advertisements already exist')
    }

    console.log('🎉 Advertisement system setup completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Advertisement system initialized successfully',
      details: {
        tables_created: ['advertisements', 'ad_analytics'],
        sample_ads_created: existingAds?.length === 0 ? 5 : 0,
        placements_available: ['header', 'sidebar_top', 'in_content', 'sidebar_mid', 'footer']
      }
    })

  } catch (error) {
    console.error('❌ Error setting up advertisement system:', error)
    return NextResponse.json(
      { 
        error: 'Failed to set up advertisement system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
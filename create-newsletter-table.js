// Simple script to create the newsletter_subscribers table in Supabase
// Run this with: node create-newsletter-table.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createNewsletterTable() {
  console.log('Creating newsletter_subscribers table...')

  // For a more robust approach, we'll use the SQL editor method
  // This would typically require admin privileges
  
  // Try to create via the REST API first by inserting a dummy record to auto-create the schema
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: 'test@example.com',
        subscribed_at: new Date().toISOString(),
        active: true
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes('table') || error.message.includes('relation')) {
        console.error('❌ Newsletter table does not exist in your Supabase database.')
        console.log('\n📋 Please manually create the table by following these steps:')
        console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
        console.log('2. Select your project: newznepal')
        console.log('3. Go to SQL Editor')
        console.log('4. Copy and paste the SQL from setup_newsletter_table.sql')
        console.log('5. Click "Run" to execute the SQL')
        console.log('\nOnce you\'ve created the table, the newsletter feature will work properly!')
        return false
      }
      throw error
    }

    // Remove the test record
    await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', 'test@example.com')

    console.log('✅ Newsletter table exists and is working!')
    return true

  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

createNewsletterTable().then(success => {
  if (success) {
    console.log('\n🎉 Newsletter setup completed successfully!')
  } else {
    console.log('\n⚠️  Manual setup required. Please see instructions above.')
  }
  process.exit(success ? 0 : 1)
})
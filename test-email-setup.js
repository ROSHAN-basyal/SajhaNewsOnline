// Quick test to verify email configuration
// Run with: node test-email-setup.js

const nodemailer = require('nodemailer')
require('dotenv').config({ path: '.env.local' })

async function testEmailSetup() {
  console.log('🧪 Testing Email Configuration...\n')

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM
  }

  console.log('Current Configuration:')
  console.log('SMTP_HOST:', config.host || 'NOT SET')
  console.log('SMTP_PORT:', config.port)
  console.log('SMTP_USER:', config.user || 'NOT SET')
  console.log('SMTP_PASS:', config.pass ? 'SET (hidden)' : 'NOT SET')
  console.log('EMAIL_FROM:', config.from)

  if (!config.host || !config.user || !config.pass) {
    console.log('\n❌ SMTP configuration incomplete!')
    console.log('\n📝 To fix this:')
    console.log('1. Edit .env.local file')
    console.log('2. Uncomment and fill in the SMTP_* variables')
    console.log('3. For Gmail: Use an App Password, not your regular password')
    console.log('\nExample for Gmail:')
    console.log('SMTP_HOST=smtp.gmail.com')
    console.log('SMTP_PORT=587')
    console.log('SMTP_USER=yourname@gmail.com')
    console.log('SMTP_PASS=your-app-password')
    console.log('EMAIL_FROM=NewzNepal <yourname@gmail.com>')
    return false
  }

  // Test connection
  console.log('\n🔄 Testing SMTP connection...')
  try {
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })

    await transporter.verify()
    console.log('✅ SMTP connection successful!')

    // Send test email
    console.log('\n📧 Sending test email...')
    const result = await transporter.sendMail({
      from: config.from,
      to: config.user, // Send to yourself
      subject: '📰 NewzNepal Newsletter Test',
      html: `
        <h1>🎉 Email Configuration Success!</h1>
        <p>Your NewzNepal newsletter email service is working correctly.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>SMTP Host: ${config.host}</li>
          <li>Port: ${config.port}</li>
          <li>Time: ${new Date().toISOString()}</li>
        </ul>
        <p>You can now receive newsletters when new posts are published!</p>
      `,
      text: `
        NewzNepal Newsletter Test
        
        Your email configuration is working correctly!
        SMTP Host: ${config.host}
        Port: ${config.port}
        Time: ${new Date().toISOString()}
        
        You can now receive newsletters when new posts are published!
      `
    })

    console.log('✅ Test email sent successfully!')
    console.log('📬 Check your inbox for the test email')
    console.log('Message ID:', result.messageId)
    return true

  } catch (error) {
    console.log('❌ Email test failed:', error.message)
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Tip: For Gmail, make sure to use an App Password, not your regular password')
      console.log('Generate one at: https://myaccount.google.com/apppasswords')
    }
    
    return false
  }
}

testEmailSetup().then(success => {
  console.log('\n' + '='.repeat(50))
  if (success) {
    console.log('🎉 EMAIL SETUP COMPLETE!')
    console.log('Your newsletter will now send real emails to subscribers.')
  } else {
    console.log('⚠️  Email setup incomplete. Please fix the configuration.')
    console.log('Newsletter will continue using console logging until fixed.')
  }
  process.exit(success ? 0 : 1)
})
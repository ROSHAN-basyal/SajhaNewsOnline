# Newsletter Setup Guide

This guide will help you set up the newsletter feature for your NewzNepal website.

## 🚀 Quick Setup

### Step 1: Create the Database Table

The newsletter feature requires a `newsletter_subscribers` table in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `newznepal`
3. Go to **SQL Editor**
4. Copy and paste the contents of `setup_newsletter_table.sql`
5. Click **Run** to execute the SQL

**Option B: Run the setup script**
```bash
node create-newsletter-table.js
```

### Step 2: Configure Email Service (Optional)

For production use, configure SMTP settings in your `.env.local` file:

```env
# Gmail Example (recommended for small scale)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=NewzNepal <your-email@gmail.com>
```

**Note**: If you don't configure SMTP, emails will be logged to the console (development mode).

## 📧 How It Works

1. **Subscription**: Users can subscribe via the newsletter form
2. **Auto-sending**: When new posts are created, newsletters are automatically sent to all active subscribers
3. **Email Format**: Professional HTML emails with post summary and call-to-action

## 🔧 Features

### Newsletter Subscription
- ✅ Email validation
- ✅ Duplicate prevention
- ✅ Active/inactive status management
- ✅ Responsive form component

### Email Service
- ✅ Professional HTML email templates
- ✅ Plain text fallback
- ✅ Batch sending (10 emails per batch)
- ✅ Rate limiting protection
- ✅ Error handling and logging

### Auto-Newsletter
- ✅ Automatically sends newsletters when new posts are created
- ✅ Background processing (doesn't slow down post creation)
- ✅ Comprehensive error handling

## 📝 Usage

### For Users (Frontend)
The newsletter form is already integrated into your website. Users can simply:
1. Enter their email address
2. Click "Subscribe"
3. Receive confirmation message

### For Admins (Backend)
- **Creating Posts**: New posts automatically trigger newsletter sending
- **Manual Send**: Use `/api/send-newsletter` endpoint for manual sending
- **Subscriber Management**: Access subscriber data via `/api/newsletter` GET endpoint

## 🔍 Testing

### Test Newsletter Subscription
1. Go to your website
2. Find the newsletter subscription form
3. Enter a test email address
4. Check the console logs for confirmation

### Test Email Sending
```bash
# This will test the email service (development mode)
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🛠️ Troubleshooting

### Error: "Newsletter service is not properly configured"
- The `newsletter_subscribers` table doesn't exist
- Run the SQL from `setup_newsletter_table.sql` in your Supabase dashboard

### Error: "Failed to subscribe"
- Check your Supabase connection
- Verify the table exists and has proper permissions
- Check the server console logs for detailed error messages

### Emails not sending in production
- Verify your SMTP configuration in `.env.local`
- Check that your email provider allows SMTP access
- For Gmail: Use an App Password, not your regular password

### Newsletter not auto-sending
- Check that the `newsletter_subscribers` table exists
- Verify there are active subscribers in the database
- Check server logs when creating new posts

## 📊 Email Service Providers

### Gmail (Recommended for small scale)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate this in Gmail settings
```

### Other Providers
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

## 🔐 Security Notes

- Newsletter subscriptions don't require authentication (public endpoint)
- Admin functions (manual newsletter sending) require admin authentication
- Email addresses are stored securely in Supabase
- SMTP credentials are stored in environment variables

## 📈 Scaling Considerations

### For High Volume (1000+ subscribers):
1. Consider using a dedicated email service (SendGrid, Mailgun, etc.)
2. Implement proper queue system for email sending
3. Add unsubscribe functionality
4. Monitor email delivery rates and spam reports

### Current Limitations:
- Batch size: 10 emails per batch
- Rate limiting: 2-second delay between batches
- No unsubscribe link (can be added if needed)
- No email open/click tracking

## 📁 File Structure

```
src/
├── app/api/
│   ├── newsletter/route.ts          # Subscription endpoint
│   ├── send-newsletter/route.ts     # Manual sending endpoint
│   └── posts/route.ts              # Auto-send on post creation
├── lib/
│   └── emailService.ts             # Email service implementation
├── components/
│   └── NewsletterForm.tsx          # Frontend form component
└── ...

setup_newsletter_table.sql          # Database setup
create-newsletter-table.js          # Setup verification script
.env.local                          # Environment variables
```

## ✅ Success Checklist

- [ ] Database table created successfully
- [ ] Newsletter form accepts subscriptions
- [ ] Email service configured (or using development mode)
- [ ] New posts trigger newsletter sending
- [ ] Console logs show email activity
- [ ] Test subscription works end-to-end

---

🎉 **You're all set!** Your newsletter system is now ready to engage your readers with every new post you publish.

For additional support or customization, check the code comments in the relevant files.
import nodemailer from 'nodemailer'

export interface EmailConfig {
  host?: string
  port?: number
  user?: string
  pass?: string
  from?: string
}

export interface NewsPost {
  id: string
  title: string
  summary: string
  content: string
  category: string
  image_url?: string
  created_at: string
  updated_at: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM || 'NewzNepal <noreply@newznepal.com>'
    }

    this.initializeTransporter()
  }

  private initializeTransporter() {
    // Only create real transporter if SMTP config is provided
    if (this.config.host && this.config.user && this.config.pass) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465, // true for 465, false for other ports
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      })
    } else {
      console.log('📧 Email service running in development mode (console logging only)')
      console.log('💡 Configure SMTP_* environment variables for real email sending')
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email service verification failed:', error)
      return false
    }
  }

  private generateNewsletterHTML(post: NewsPost): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NewzNepal Newsletter</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f4f4f4;
              }
              .header {
                  background-color: #1e40af;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
              }
              .content {
                  background-color: white;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
              }
              .article-title {
                  color: #1e40af;
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 15px;
              }
              .article-meta {
                  color: #666;
                  font-size: 14px;
                  margin-bottom: 20px;
                  text-transform: uppercase;
              }
              .article-image {
                  width: 100%;
                  height: 200px;
                  object-fit: cover;
                  border-radius: 8px;
                  margin-bottom: 20px;
              }
              .article-summary {
                  font-size: 16px;
                  color: #555;
                  margin-bottom: 25px;
                  padding: 15px;
                  background-color: #f8f9fa;
                  border-radius: 6px;
                  border-left: 4px solid #1e40af;
              }
              .read-more-btn {
                  display: inline-block;
                  background-color: #1e40af;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin-top: 20px;
              }
              .footer {
                  text-align: center;
                  color: #666;
                  font-size: 12px;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>📰 NewzNepal Newsletter</h1>
              <p>Stay informed with the latest news from Nepal</p>
          </div>
          
          <div class="content">
              <div class="article-meta">${post.category.toUpperCase()} • ${new Date(post.created_at).toLocaleDateString()}</div>
              
              <h2 class="article-title">${post.title}</h2>
              
              ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="article-image">` : ''}
              
              <div class="article-summary">
                  <strong>Summary:</strong><br>
                  ${post.summary}
              </div>
              
              <p>A new article has been published on NewzNepal.com. Click the button below to read the full story.</p>
              
              <a href="https://newznepal.com" class="read-more-btn">Read Full Article →</a>
              
              <div class="footer">
                  <p>You received this email because you subscribed to NewzNepal newsletter.</p>
                  <p>© ${new Date().getFullYear()} NewzNepal.com - All rights reserved.</p>
                  <p><small>NewzNepal.com | Bringing you the latest news from Nepal</small></p>
              </div>
          </div>
      </body>
      </html>
    `
  }

  private generatePlainTextNewsletter(post: NewsPost): string {
    return `
NewzNepal Newsletter
===================

${post.category.toUpperCase()} • ${new Date(post.created_at).toLocaleDateString()}

${post.title}
${'='.repeat(post.title.length)}

Summary:
${post.summary}

A new article has been published on NewzNepal.com.

Read the full article at: https://newznepal.com

---
You received this email because you subscribed to NewzNepal newsletter.
© ${new Date().getFullYear()} NewzNepal.com - All rights reserved.
    `.trim()
  }

  async sendNewsletterToSubscribers(post: NewsPost, subscriberEmails: string[]): Promise<{ success: boolean; sent: number; errors?: string[] }> {
    if (!this.transporter) {
      // Development mode - just log to console
      console.log('\n📧 ===============================================')
      console.log('📧 NEWSLETTER EMAIL (Development Mode)')
      console.log('📧 ===============================================')
      console.log(`📧 Subject: New Article: ${post.title}`)
      console.log(`📧 Recipients: ${subscriberEmails.length} subscribers`)
      console.log(`📧 To: ${subscriberEmails.join(', ')}`)
      console.log('📧 ===============================================')
      console.log(this.generatePlainTextNewsletter(post))
      console.log('📧 ===============================================\n')

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, sent: subscriberEmails.length }
    }

    // Real email sending
    const errors: string[] = []
    let sentCount = 0

    const mailOptions = {
      from: this.config.from,
      subject: `📰 New Article: ${post.title}`,
      html: this.generateNewsletterHTML(post),
      text: this.generatePlainTextNewsletter(post),
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    const batches = []
    
    for (let i = 0; i < subscriberEmails.length; i += batchSize) {
      batches.push(subscriberEmails.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const promises = batch.map(async (email) => {
        try {
          await this.transporter!.sendMail({
            ...mailOptions,
            to: email
          })
          sentCount++
          console.log(`✅ Newsletter sent to: ${email}`)
        } catch (error) {
          const errorMsg = `Failed to send to ${email}: ${(error as Error).message}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      })

      await Promise.all(promises)
      
      // Add delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return {
      success: sentCount > 0,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  async sendTestEmail(toEmail: string): Promise<boolean> {
    const testPost: NewsPost = {
      id: 'test',
      title: 'Test Newsletter - NewzNepal Email Service',
      summary: 'This is a test email to verify that your newsletter email service is working correctly.',
      content: 'Test content',
      category: 'latest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const result = await this.sendNewsletterToSubscribers(testPost, [toEmail])
      return result.success
    } catch (error) {
      console.error('Test email failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService
'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address')
      setIsSuccess(false)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed!')
        setIsSuccess(true)
        setEmail('')
      } else {
        setMessage(data.error || 'Failed to subscribe')
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage('Failed to subscribe. Please try again.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="newsletter-form-container">
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="newsletter-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit"
          className="newsletter-btn"
          disabled={loading || !email}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      
      {message && (
        <div className={`newsletter-message ${isSuccess ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  )
}
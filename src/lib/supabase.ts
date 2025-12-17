import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface NewsPost {
  id: string
  title: string
  content: string
  summary: string
  category: string
  image_url?: string
  created_at: string
  updated_at: string
}

export const NEWS_CATEGORIES = ['latest', 'breaking', 'politics', 'sports', 'business', 'entertainment'] as const

export type NewsCategory = typeof NEWS_CATEGORIES[number]

export type ConsumerLocale = 'en' | 'ne'

export const CATEGORY_LABELS_EN: Record<NewsCategory, string> = {
  latest: 'Latest',
  breaking: 'Breaking',
  politics: 'Politics',
  sports: 'Sports',
  business: 'Business',
  entertainment: 'Entertainment',
}

export const CATEGORY_LABELS_NE: Record<NewsCategory, string> = {
  latest: 'ताजा',
  breaking: 'तत्काल',
  politics: 'राजनीति',
  sports: 'खेलकुद',
  business: 'अर्थ/व्यापार',
  entertainment: 'मनोरञ्जन',
}

export const getCategoryLabel = (category: NewsCategory | 'all', locale: ConsumerLocale = 'en'): string => {
  if (category === 'all') return locale === 'ne' ? 'सबै' : 'All'
  const labels = locale === 'ne' ? CATEGORY_LABELS_NE : CATEGORY_LABELS_EN
  return labels[category] || category
}

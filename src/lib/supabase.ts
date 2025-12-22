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

export const NEWS_CATEGORIES = ['health', 'latest', 'international', 'cooperative', 'miscellaneous', 'sports', 'education'] as const

export type NewsCategory = typeof NEWS_CATEGORIES[number]

export type ConsumerLocale = 'en' | 'ne'

export const CATEGORY_LABELS_EN: Record<NewsCategory, string> = {
  health: 'Health',
  latest: 'Latest News',
  international: 'International',
  cooperative: 'Cooperative',
  miscellaneous: 'Miscellaneous',
  sports: 'Sports',
  education: 'Education',
}

export const CATEGORY_LABELS_NE: Record<NewsCategory, string> = {
  health: 'स्वास्थ्य',
  latest: 'ताजा समाचार',
  international: 'अन्तर्राष्ट्रिय',
  cooperative: 'सहकारी',
  miscellaneous: 'विविध',
  sports: 'खेलकुद',
  education: 'शिक्षा',
}

export const getCategoryLabel = (category: NewsCategory | 'all', locale: ConsumerLocale = 'en'): string => {
  if (category === 'all') return locale === 'ne' ? '\u0938\u092c\u0948' : 'All'
  const labels = locale === 'ne' ? CATEGORY_LABELS_NE : CATEGORY_LABELS_EN
  return labels[category] || category
}

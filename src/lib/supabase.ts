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

export const NEWS_CATEGORIES = [
  'latest',
  'breaking',
  'politics',
  'sports', 
  'business',
  'entertainment'
] as const

export type NewsCategory = typeof NEWS_CATEGORIES[number]

// Nepali translations for categories
export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  'latest': 'ताजा समाचार',
  'breaking': 'ब्रेकिङ न्यूज',
  'politics': 'राजनीति',
  'sports': 'खेलकुद',
  'business': 'व्यापार',
  'entertainment': 'मनोरञ्जन'
}

// Helper function to get Nepali label for category
export const getCategoryLabel = (category: NewsCategory | 'all'): string => {
  if (category === 'all') return 'सबै समाचार'
  return CATEGORY_LABELS[category] || category
}
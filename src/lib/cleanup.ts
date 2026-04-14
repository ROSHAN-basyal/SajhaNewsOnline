import { supabase } from './supabase'
import type { NewsPost } from './supabase'

const DEFAULT_POST_DURATION_DAYS = 30

export function clampDurationDays(value?: number | null): number {
  if (!Number.isFinite(value)) return DEFAULT_POST_DURATION_DAYS
  return Math.min(300, Math.max(1, Math.round(value as number)))
}

export function getPostDurationDays(post: Pick<NewsPost, 'duration_days'> | number | null | undefined): number {
  if (typeof post === 'number') return clampDurationDays(post)
  return clampDurationDays(post?.duration_days)
}

export function getPostExpirationDate(
  post: Pick<NewsPost, 'created_at' | 'duration_days' | 'expires_at'>
): Date {
  if (post.expires_at) {
    const parsedExpiry = new Date(post.expires_at)
    if (!Number.isNaN(parsedExpiry.getTime())) return parsedExpiry
  }

  const created = new Date(post.created_at)
  const expiry = new Date(created)
  expiry.setDate(expiry.getDate() + getPostDurationDays(post))
  return expiry
}

/**
 * Deletes news posts that have passed their expiry date
 * Also deletes associated images from storage
 */
export async function cleanupExpiredPosts() {
  try {
    const now = new Date()
    
    console.log(`🧹 Cleaning up posts expired before ${now.toISOString()}`)
    
    // First, get all posts and calculate expiry per post.
    const { data: expiredPosts, error: fetchError } = await supabase
      .from('news_posts')
      .select('id, title, image_url, image_urls, created_at, expires_at, duration_days')
    
    if (fetchError) {
      console.error('❌ Error fetching expired posts:', fetchError)
      return { success: false, error: fetchError.message }
    }

    const postsToDelete = (expiredPosts || []).filter((post) => {
      return getPostExpirationDate(post).getTime() <= now.getTime()
    })
    
    if (postsToDelete.length === 0) {
      console.log('✅ No expired posts found')
      return { success: true, deletedCount: 0, message: 'No expired posts to delete' }
    }
    
    console.log(`📝 Found ${postsToDelete.length} expired posts to delete`)
    
    // Delete associated images from storage
    const imageUrls = Array.from(
      new Set(
        postsToDelete.flatMap((post) => {
          const urls = [
            post.image_url,
            ...(Array.isArray((post as { image_urls?: string[] }).image_urls)
              ? (post as { image_urls?: string[] }).image_urls || []
              : []),
          ];

          return urls.filter((value): value is string => Boolean(value));
        })
      )
    )
    
    if (imageUrls.length > 0) {
      console.log(`🖼️ Deleting ${imageUrls.length} associated images`)
      
      // Extract file names from URLs
      const fileNames = imageUrls.map(url => {
        if (!url) return null
        // Extract filename from Supabase storage URL
        const matches = url.match(/\/news-images\/(.+)$/)
        return matches ? matches[1] : null
      }).filter(Boolean) as string[]
      
      if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('news-images')
          .remove(fileNames)
        
        if (storageError) {
          console.warn('⚠️ Some images could not be deleted:', storageError.message)
        } else {
          console.log(`✅ Successfully deleted ${fileNames.length} images`)
        }
      }
    }
    
    // Delete the posts from database
    const postIds = postsToDelete.map((post) => post.id)
    const { error: deleteError, count } = await supabase
      .from('news_posts')
      .delete({ count: 'exact' as const })
      .in('id', postIds)
    
    if (deleteError) {
      console.error('❌ Error deleting expired posts:', deleteError)
      return { success: false, error: deleteError.message }
    }
    
    const deletedCount = count || 0
    console.log(`✅ Successfully deleted ${deletedCount} expired posts`)
    
    return { 
      success: true, 
      deletedCount, 
      message: `Deleted ${deletedCount} expired posts` 
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Gets the age of a post in days
 */
export function getPostAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - created.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Checks if a post is expired based on its configured duration
 */
export function isPostExpired(post: Pick<NewsPost, 'created_at' | 'duration_days' | 'expires_at'>): boolean {
  return getPostExpirationDate(post).getTime() <= Date.now()
}

/**
 * Gets days remaining before post expires
 */
export function getDaysUntilExpiration(post: Pick<NewsPost, 'created_at' | 'duration_days' | 'expires_at'>): number {
  const now = Date.now()
  const expiry = getPostExpirationDate(post).getTime()
  const diff = expiry - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

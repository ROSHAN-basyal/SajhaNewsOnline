import { supabase } from './supabase'

/**
 * Deletes news posts that are older than 30 days
 * Also deletes associated images from storage
 */
export async function cleanupExpiredPosts() {
  try {
    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    console.log(`🧹 Cleaning up posts older than ${thirtyDaysAgo.toISOString()}`)
    
    // First, get all posts that are older than 30 days to delete their images
    const { data: expiredPosts, error: fetchError } = await supabase
      .from('news_posts')
      .select('id, title, image_url, created_at')
      .lt('created_at', thirtyDaysAgo.toISOString())
    
    if (fetchError) {
      console.error('❌ Error fetching expired posts:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    if (!expiredPosts || expiredPosts.length === 0) {
      console.log('✅ No expired posts found')
      return { success: true, deletedCount: 0, message: 'No expired posts to delete' }
    }
    
    console.log(`📝 Found ${expiredPosts.length} expired posts to delete`)
    
    // Delete associated images from storage
    const imageUrls = expiredPosts
      .filter(post => post.image_url)
      .map(post => post.image_url)
    
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
    const { error: deleteError, count } = await supabase
      .from('news_posts')
      .delete({ count: 'exact' })
      .lt('created_at', thirtyDaysAgo.toISOString())
    
    if (deleteError) {
      console.error('❌ Error deleting expired posts:', deleteError)
      return { success: false, error: deleteError.message }
    }
    
    const deletedCount = count || 0
    console.log(`✅ Successfully deleted ${deletedCount} expired posts`)
    
    return { 
      success: true, 
      deletedCount, 
      message: `Deleted ${deletedCount} posts older than 30 days` 
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
 * Checks if a post is expired (older than 30 days)
 */
export function isPostExpired(createdAt: string): boolean {
  return getPostAge(createdAt) >= 30
}

/**
 * Gets days remaining before post expires
 */
export function getDaysUntilExpiration(createdAt: string): number {
  const age = getPostAge(createdAt)
  return Math.max(0, 30 - age)
}
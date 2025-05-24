// Simple in-memory cache
export const cache = new Map<string, { data: any; timestamp: number }>()
export const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

// Cache cleanup every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}, 1000 * 60 * 60) // Every hour

/**
 * Security utilities for sanitizing and validating data
 */

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    // In development, show full error for debugging
    return error instanceof Error ? error.message : 'Unknown error'
  }
  
  // In production, return generic error messages
  if (error instanceof Error) {
    // Only expose safe error messages
    const safeErrors = [
      'Invalid credentials',
      'User not found',
      'Email already exists',
      'Invalid YouTube URL',
      'Video already exists',
      'Unauthorized',
      'Active subscription required',
      'Admin access required'
    ]
    
    if (safeErrors.includes(error.message)) {
      return error.message
    }
  }
  
  return 'Internal server error'
}

/**
 * Validate and sanitize string input
 */
export function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type')
  }
  
  // Remove null bytes and excessive whitespace
  const cleaned = input.replace(/\0/g, '').trim()
  
  if (cleaned.length > maxLength) {
    throw new Error(`Input too long (max ${maxLength} characters)`)
  }
  
  return cleaned
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 6 characters for demo purposes
  // In production, consider stronger requirements
  return password.length >= 6 && password.length <= 128
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)
  
  if (!userLimit) {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now })
    return true
  }
  
  // Reset if window has passed
  if (now - userLimit.lastRequest > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now })
    return true
  }
  
  // Increment count
  userLimit.count++
  userLimit.lastRequest = now
  
  return userLimit.count <= maxRequests
}

/**
 * Clean up rate limit map periodically
 */
setInterval(() => {
  const now = Date.now()
  const windowMs = 60000
  
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastRequest > windowMs) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute
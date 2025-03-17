import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Skip Redis in dev mode
const redis = process.env.NODE_ENV === 'production' 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null

// 10 requests per 10s window
const ratelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'

  // Rate limit API routes in production
  if (process.env.NODE_ENV === 'production' && ratelimit && request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)
      
      if (!success) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            limit,
            reset,
            remaining
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString()
            }
          }
        )
      }
    } catch (error) {
      // Continue if Redis fails
      console.error('Rate limiting error:', error)
    }
  }

  const response = NextResponse.next()

  // Security headers
  const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Content-Security-Policy', ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim())
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  return response
}

// Apply middleware to API and auth routes only
export const config = {
  matcher: [
    '/api/:path*',
    '/auth/:path*',
  ],
} 
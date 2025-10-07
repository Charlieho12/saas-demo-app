import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token?.role || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Protect dashboard routes (basic auth check is handled by withAuth)
    // Additional subscription checks are handled in the page components
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes
        if (pathname.startsWith('/auth/') || 
            pathname === '/' ||
            pathname.startsWith('/api/auth/') ||
            pathname.startsWith('/api/webhooks/')) {
          return true
        }

        // Protected routes require authentication
        if (pathname.startsWith('/dashboard') || 
            pathname.startsWith('/admin') ||
            pathname.startsWith('/subscribe')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
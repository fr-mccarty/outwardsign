import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      cookieOptions: {
        httpOnly: true, // Prevent XSS from accessing session cookies
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to public pages without authentication
  const publicPaths = ['/', '/login', '/signup', '/accept-invitation', '/auth/callback']
  const publicPathPrefixes = ['/api/invitations']

  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path) ||
    publicPathPrefixes.some(prefix => request.nextUrl.pathname.startsWith(prefix))

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Add security headers
  setSecurityHeaders(supabaseResponse)

  return supabaseResponse
}

/**
 * Set security headers on the response
 * @see https://owasp.org/www-project-secure-headers/
 */
function setSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Restrict browser features/APIs
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  // Note: 'unsafe-inline' is needed for Tailwind and React inline styles
  // 'unsafe-eval' is needed for Next.js development mode
  const csp = [
    "default-src 'self'",
    // Scripts: self + unsafe-inline for Next.js + unsafe-eval for dev
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
    // Styles: self + unsafe-inline for Tailwind/inline styles
    "style-src 'self' 'unsafe-inline'",
    // Images: self + data URIs + Supabase storage + blob for uploads
    "img-src 'self' data: blob: https://*.supabase.co",
    // Fonts: self + data URIs
    "font-src 'self' data:",
    // Connect: self + Supabase APIs
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    // Frames: none (we don't embed external content)
    "frame-src 'none'",
    // Form actions: self only
    "form-action 'self'",
    // Base URI: self only
    "base-uri 'self'",
    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
}
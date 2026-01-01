import { NextRequest, NextResponse } from 'next/server'
import { validateMagicLink } from '@/lib/parishioner-auth/actions'
import { getParishById } from '@/lib/parishioner-auth/parish-lookup'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const slug = searchParams.get('slug')

  if (!token) {
    // Redirect to a generic error page since we don't know the parish
    return NextResponse.redirect(new URL('/parishioner/login-error?error=no_token', request.url))
  }

  const result = await validateMagicLink(token)

  if (!result.success) {
    // Try to redirect to the parish login with error, or generic error page
    if (slug) {
      return NextResponse.redirect(
        new URL(`/parishioner/${slug}/login?error=${encodeURIComponent(result.error || 'Invalid link')}`, request.url)
      )
    }
    return NextResponse.redirect(
      new URL(`/parishioner/login-error?error=${encodeURIComponent(result.error || 'Invalid link')}`, request.url)
    )
  }

  // Get parish slug for redirect
  let parishSlug = slug
  if (!parishSlug && result.parishId) {
    const parish = await getParishById(result.parishId)
    parishSlug = parish?.slug || null
  }

  if (!parishSlug) {
    return NextResponse.redirect(new URL('/parishioner/login-error?error=parish_not_found', request.url))
  }

  // Successfully authenticated, redirect to the parish portal calendar
  return NextResponse.redirect(new URL(`/parishioner/${parishSlug}/calendar`, request.url))
}

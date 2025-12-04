import { NextRequest, NextResponse } from 'next/server'
import { validateMagicLink } from '@/lib/parishioner-auth/actions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/parishioner/login?error=no_token', request.url))
  }

  const result = await validateMagicLink(token)

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/parishioner/login?error=${encodeURIComponent(result.error || 'Invalid link')}`, request.url)
    )
  }

  // Successfully authenticated, redirect to calendar
  return NextResponse.redirect(new URL('/parishioner/calendar', request.url))
}

import { NextResponse } from 'next/server'
import { logoutParishioner, getParishionerSession } from '@/lib/parishioner-auth/actions'
import { getParishById } from '@/lib/parishioner-auth/parish-lookup'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Get session before logout to know which parish to redirect to
  const session = await getParishionerSession()
  let parishSlug: string | null = null

  if (session) {
    const parish = await getParishById(session.parishId)
    parishSlug = parish?.slug || null
  }

  await logoutParishioner()

  // Redirect to parish-specific login if known, otherwise to logged out page
  if (parishSlug) {
    return NextResponse.redirect(new URL(`/parishioner/${parishSlug}/login`, process.env.NEXT_PUBLIC_APP_URL))
  }
  return NextResponse.redirect(new URL('/parishioner/logged-out', process.env.NEXT_PUBLIC_APP_URL))
}

export async function POST() {
  // Get session before logout to know which parish to redirect to
  const session = await getParishionerSession()
  let parishSlug: string | null = null

  if (session) {
    const parish = await getParishById(session.parishId)
    parishSlug = parish?.slug || null
  }

  await logoutParishioner()

  // Redirect to parish-specific login if known, otherwise to logged out page
  if (parishSlug) {
    return NextResponse.redirect(new URL(`/parishioner/${parishSlug}/login`, process.env.NEXT_PUBLIC_APP_URL))
  }
  return NextResponse.redirect(new URL('/parishioner/logged-out', process.env.NEXT_PUBLIC_APP_URL))
}

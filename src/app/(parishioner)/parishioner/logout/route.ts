import { NextResponse } from 'next/server'
import { logoutParishioner } from '@/lib/parishioner-auth/actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  await logoutParishioner()
  return NextResponse.redirect(new URL('/parishioner/login', process.env.NEXT_PUBLIC_APP_URL))
}

export async function POST() {
  await logoutParishioner()
  return NextResponse.redirect(new URL('/parishioner/login', process.env.NEXT_PUBLIC_APP_URL))
}

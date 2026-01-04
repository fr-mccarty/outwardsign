import { NextRequest, NextResponse } from 'next/server'

// Redirect /authorize to /api/oauth/authorize
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/oauth/authorize'
  return NextResponse.redirect(url)
}

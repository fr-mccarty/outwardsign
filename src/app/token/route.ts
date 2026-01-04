import { NextRequest, NextResponse } from 'next/server'

// Redirect /token to /api/oauth/token
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/oauth/token'

  // For POST requests, we need to forward the request properly
  // Using rewrite instead of redirect to preserve the POST body
  return NextResponse.rewrite(url)
}

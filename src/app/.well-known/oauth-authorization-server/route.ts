import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  // Get the site URL dynamically
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

  // OAuth 2.0 Authorization Server Metadata (RFC 8414)
  const metadata = {
    issuer: siteUrl,
    authorization_endpoint: `${siteUrl}/api/oauth/authorize`,
    token_endpoint: `${siteUrl}/api/oauth/token`,
    revocation_endpoint: `${siteUrl}/api/oauth/revoke`,
    userinfo_endpoint: `${siteUrl}/api/oauth/userinfo`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: ['read', 'write', 'delete', 'profile'],
  }

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

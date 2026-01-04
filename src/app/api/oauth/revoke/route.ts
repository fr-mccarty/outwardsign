/**
 * OAuth2 Token Revocation Endpoint
 *
 * POST /api/oauth/revoke
 *
 * Implements RFC 7009 - OAuth 2.0 Token Revocation.
 *
 * Request body (application/x-www-form-urlencoded):
 * - token: The token to revoke
 * - token_type_hint: Optional, 'access_token' or 'refresh_token'
 * - client_id: The client ID
 * - client_secret: The client secret (for confidential clients)
 *
 * Per RFC 7009, this endpoint always returns 200 OK, even if the
 * token was already revoked or invalid.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revokeToken } from '@/lib/actions/oauth'

export async function POST(request: NextRequest) {
  // Parse form data
  let formData: URLSearchParams
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    formData = new URLSearchParams(text)
  } else if (contentType.includes('application/json')) {
    const json = await request.json()
    formData = new URLSearchParams(json)
  } else {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Content-Type must be application/x-www-form-urlencoded or application/json' },
      { status: 400 }
    )
  }

  const token = formData.get('token')
  const tokenTypeHint = formData.get('token_type_hint') as 'access_token' | 'refresh_token' | null
  const clientId = formData.get('client_id')
  const clientSecret = formData.get('client_secret') || undefined

  // Validate required parameters
  if (!token) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'token is required' },
      { status: 400 }
    )
  }

  if (!clientId) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'client_id is required' },
      { status: 400 }
    )
  }

  const result = await revokeToken({
    token,
    tokenTypeHint: tokenTypeHint || undefined,
    clientId,
    clientSecret,
  })

  if ('error' in result && result.error === 'invalid_client') {
    return NextResponse.json(
      { error: 'invalid_client' },
      { status: 401 }
    )
  }

  // Per RFC 7009, always return 200 OK
  return new NextResponse(null, { status: 200 })
}

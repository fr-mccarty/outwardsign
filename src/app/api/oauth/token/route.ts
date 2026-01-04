/**
 * OAuth2 Token Endpoint
 *
 * POST /api/oauth/token
 *
 * Handles token requests:
 * - authorization_code: Exchange auth code for tokens
 * - refresh_token: Refresh an access token
 *
 * Request body (application/x-www-form-urlencoded):
 * - grant_type: 'authorization_code' or 'refresh_token'
 * - client_id: The client ID
 * - client_secret: The client secret (for confidential clients)
 *
 * For authorization_code:
 * - code: The authorization code
 * - redirect_uri: Must match the original request
 * - code_verifier: PKCE verifier (if code_challenge was used)
 *
 * For refresh_token:
 * - refresh_token: The refresh token
 * - scope: Optional narrowed scope
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, refreshAccessToken } from '@/lib/actions/oauth'

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

  const grantType = formData.get('grant_type')
  const clientId = formData.get('client_id')
  const clientSecret = formData.get('client_secret') || undefined

  // Validate required parameters
  if (!grantType) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'grant_type is required' },
      { status: 400 }
    )
  }

  if (!clientId) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'client_id is required' },
      { status: 400 }
    )
  }

  // Handle authorization_code grant
  if (grantType === 'authorization_code') {
    const code = formData.get('code')
    const redirectUri = formData.get('redirect_uri')
    const codeVerifier = formData.get('code_verifier') || undefined

    if (!code) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'code is required' },
        { status: 400 }
      )
    }

    if (!redirectUri) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'redirect_uri is required' },
        { status: 400 }
      )
    }

    const result = await exchangeCodeForTokens({
      code,
      clientId,
      clientSecret,
      redirectUri,
      codeVerifier,
    })

    if ('error' in result) {
      const status = result.error === 'invalid_client' ? 401 : 400
      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    })
  }

  // Handle refresh_token grant
  if (grantType === 'refresh_token') {
    const refreshToken = formData.get('refresh_token')
    const scope = formData.get('scope') || undefined

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'refresh_token is required' },
        { status: 400 }
      )
    }

    const result = await refreshAccessToken({
      refreshToken,
      clientId,
      clientSecret,
      scope,
    })

    if ('error' in result) {
      const status = result.error === 'invalid_client' ? 401 : 400
      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    })
  }

  // Unsupported grant type
  return NextResponse.json(
    { error: 'unsupported_grant_type', error_description: 'Only authorization_code and refresh_token are supported' },
    { status: 400 }
  )
}

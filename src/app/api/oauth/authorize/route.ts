/**
 * OAuth2 Authorization Endpoint
 *
 * GET /api/oauth/authorize
 *
 * Handles OAuth2 authorization requests. Validates the request parameters
 * and redirects to the consent screen.
 *
 * Required Parameters:
 * - response_type: Must be 'code'
 * - client_id: The registered client ID
 * - redirect_uri: Must match a registered redirect URI
 * - scope: Space-separated list of requested scopes
 *
 * Optional Parameters:
 * - state: CSRF protection token (recommended)
 * - code_challenge: PKCE code challenge
 * - code_challenge_method: 'S256' or 'plain'
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuthClient, validateRedirectUri } from '@/lib/actions/oauth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Extract OAuth parameters
  const responseType = searchParams.get('response_type')
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const scope = searchParams.get('scope') || ''
  const state = searchParams.get('state')
  const codeChallenge = searchParams.get('code_challenge')
  const codeChallengeMethod = searchParams.get('code_challenge_method') as 'S256' | 'plain' | null

  // Build error redirect helper
  const errorRedirect = (error: string, description: string, redirectTo?: string) => {
    if (redirectTo) {
      const url = new URL(redirectTo)
      url.searchParams.set('error', error)
      url.searchParams.set('error_description', description)
      if (state) url.searchParams.set('state', state)
      return NextResponse.redirect(url)
    }
    // If no valid redirect URI, show error page
    return NextResponse.json(
      { error, error_description: description },
      { status: 400 }
    )
  }

  // Validate required parameters
  if (!responseType || responseType !== 'code') {
    return errorRedirect(
      'unsupported_response_type',
      'Only response_type=code is supported'
    )
  }

  if (!clientId) {
    return errorRedirect('invalid_request', 'client_id is required')
  }

  if (!redirectUri) {
    return errorRedirect('invalid_request', 'redirect_uri is required')
  }

  // Validate client exists
  const client = await getOAuthClient(clientId)
  if (!client) {
    return errorRedirect('invalid_client', 'Client not found or inactive')
  }

  // Validate redirect URI
  const isValidRedirect = await validateRedirectUri(clientId, redirectUri)
  if (!isValidRedirect) {
    return errorRedirect(
      'invalid_request',
      'redirect_uri is not registered for this client'
    )
  }

  // Validate PKCE method if provided
  if (codeChallengeMethod && !['S256', 'plain'].includes(codeChallengeMethod)) {
    return errorRedirect(
      'invalid_request',
      'code_challenge_method must be S256 or plain',
      redirectUri
    )
  }

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Store OAuth params in session and redirect to login
    const returnUrl = request.nextUrl.toString()
    const loginUrl = new URL('/login', request.nextUrl.origin)
    loginUrl.searchParams.set('returnTo', returnUrl)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated, redirect to consent screen
  const consentUrl = new URL('/oauth/authorize', request.nextUrl.origin)
  consentUrl.searchParams.set('client_id', clientId)
  consentUrl.searchParams.set('redirect_uri', redirectUri)
  consentUrl.searchParams.set('scope', scope)
  if (state) consentUrl.searchParams.set('state', state)
  if (codeChallenge) consentUrl.searchParams.set('code_challenge', codeChallenge)
  if (codeChallengeMethod) consentUrl.searchParams.set('code_challenge_method', codeChallengeMethod)

  return NextResponse.redirect(consentUrl)
}

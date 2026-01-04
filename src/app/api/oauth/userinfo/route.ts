/**
 * OAuth2 UserInfo Endpoint
 *
 * GET /api/oauth/userinfo
 *
 * Returns user profile information. Requires a valid access token
 * with the 'profile' scope.
 *
 * Authorization: Bearer <access_token>
 *
 * Response:
 * - sub: User ID
 * - email: User email (if available)
 * - name: User display name (if available)
 * - parish_id: The parish ID the token is scoped to
 * - parish_name: The parish name
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateAccessToken, hasScope } from '@/lib/oauth/server'

export async function GET(request: NextRequest) {
  // Extract bearer token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json(
      { error: 'invalid_token', error_description: 'Bearer token required' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    )
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Validate access token
  const context = await validateAccessToken(token)
  if (!context) {
    return NextResponse.json(
      { error: 'invalid_token', error_description: 'Token is invalid, expired, or revoked' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' } }
    )
  }

  // Check for profile scope
  if (!hasScope(context, 'profile')) {
    return NextResponse.json(
      { error: 'insufficient_scope', error_description: 'profile scope is required' },
      { status: 403, headers: { 'WWW-Authenticate': 'Bearer error="insufficient_scope", scope="profile"' } }
    )
  }

  // Get parish info
  const supabase = createAdminClient()
  const { data: parish } = await supabase
    .from('parishes')
    .select('name')
    .eq('id', context.parishId)
    .single()

  // Get user info
  const { data: userData } = await supabase.auth.admin.getUserById(context.userId)
  const user = userData?.user

  // Build response
  const response = {
    sub: context.userId,
    email: context.userEmail || user?.email || undefined,
    name: user?.user_metadata?.name || user?.user_metadata?.full_name || undefined,
    parish_id: context.parishId,
    parish_name: parish?.name || undefined,
  }

  // Remove undefined fields
  const cleanResponse = Object.fromEntries(
    Object.entries(response).filter(([, v]) => v !== undefined)
  )

  return NextResponse.json(cleanResponse, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

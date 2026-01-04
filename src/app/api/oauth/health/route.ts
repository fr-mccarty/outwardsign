import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; data?: unknown }> = {}

  // Get site URL
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

  checks.site_url = { status: 'ok', data: siteUrl }

  // Check database connection
  const supabase = await createClient()

  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      checks.auth = { status: 'error', message: authError.message }
    } else if (user) {
      checks.auth = { status: 'ok', data: { user_id: user.id, email: user.email } }
    } else {
      checks.auth = { status: 'ok', message: 'Not authenticated' }
    }
  } catch (e) {
    checks.auth = { status: 'error', message: String(e) }
  }

  // Check oauth_clients table exists and has data
  try {
    const { data: clients, error: clientsError } = await supabase
      .from('oauth_clients')
      .select('client_id, name, is_active, parish_id, redirect_uris')
      .limit(10)

    if (clientsError) {
      checks.oauth_clients = { status: 'error', message: clientsError.message }
    } else {
      checks.oauth_clients = {
        status: 'ok',
        data: clients?.map(c => ({
          client_id: c.client_id,
          name: c.name,
          is_active: c.is_active,
          has_parish: !!c.parish_id,
          redirect_uris: c.redirect_uris
        })) || []
      }
    }
  } catch (e) {
    checks.oauth_clients = { status: 'error', message: String(e) }
  }

  // Check parish_settings for OAuth enabled
  try {
    const { data: settings, error: settingsError } = await supabase
      .from('parish_settings')
      .select('parish_id, oauth_enabled, oauth_default_user_scopes')
      .limit(10)

    if (settingsError) {
      checks.parish_settings = { status: 'error', message: settingsError.message }
    } else {
      checks.parish_settings = {
        status: 'ok',
        data: settings?.map(s => ({
          parish_id: s.parish_id,
          oauth_enabled: s.oauth_enabled,
          default_scopes: s.oauth_default_user_scopes
        })) || []
      }
    }
  } catch (e) {
    checks.parish_settings = { status: 'error', message: String(e) }
  }

  // Check oauth_user_permissions
  try {
    const { data: perms, error: permsError } = await supabase
      .from('oauth_user_permissions')
      .select('user_id, oauth_enabled, allowed_scopes')
      .limit(10)

    if (permsError) {
      checks.oauth_user_permissions = { status: 'error', message: permsError.message }
    } else {
      checks.oauth_user_permissions = { status: 'ok', data: perms || [] }
    }
  } catch (e) {
    checks.oauth_user_permissions = { status: 'error', message: String(e) }
  }

  // Test a specific client_id if provided
  const testClientId = request.nextUrl.searchParams.get('client_id')
  if (testClientId) {
    try {
      const { data: client, error: clientError } = await supabase
        .from('oauth_clients')
        .select('*')
        .eq('client_id', testClientId)
        .single()

      if (clientError) {
        checks.test_client = { status: 'error', message: clientError.message }
      } else if (client) {
        checks.test_client = {
          status: 'ok',
          data: {
            client_id: client.client_id,
            name: client.name,
            is_active: client.is_active,
            is_confidential: client.is_confidential,
            redirect_uris: client.redirect_uris,
            allowed_scopes: client.allowed_scopes,
            parish_id: client.parish_id
          }
        }
      } else {
        checks.test_client = { status: 'error', message: 'Client not found' }
      }
    } catch (e) {
      checks.test_client = { status: 'error', message: String(e) }
    }
  }

  // Summary
  const hasErrors = Object.values(checks).some(c => c.status === 'error')

  return NextResponse.json({
    status: hasErrors ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      discovery: `${siteUrl}/.well-known/oauth-authorization-server`,
      authorize: `${siteUrl}/api/oauth/authorize`,
      token: `${siteUrl}/api/oauth/token`,
      revoke: `${siteUrl}/api/oauth/revoke`,
      userinfo: `${siteUrl}/api/oauth/userinfo`,
    },
    checks,
  }, {
    status: hasErrors ? 500 : 200,
  })
}

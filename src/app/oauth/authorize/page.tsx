import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildConsentContext, getExistingConsent, grantConsent } from '@/lib/actions/oauth'
import { ConsentClient } from './consent-client'

export const dynamic = 'force-dynamic'

interface OAuthAuthorizePageProps {
  searchParams: Promise<{
    client_id?: string
    redirect_uri?: string
    scope?: string
    state?: string
    code_challenge?: string
    code_challenge_method?: string
  }>
}

export default async function OAuthAuthorizePage({ searchParams }: OAuthAuthorizePageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Build return URL with all OAuth params
    const returnUrl = new URL('/api/oauth/authorize', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    returnUrl.searchParams.set('response_type', 'code')
    if (params.client_id) returnUrl.searchParams.set('client_id', params.client_id)
    if (params.redirect_uri) returnUrl.searchParams.set('redirect_uri', params.redirect_uri)
    if (params.scope) returnUrl.searchParams.set('scope', params.scope)
    if (params.state) returnUrl.searchParams.set('state', params.state)
    if (params.code_challenge) returnUrl.searchParams.set('code_challenge', params.code_challenge)
    if (params.code_challenge_method) returnUrl.searchParams.set('code_challenge_method', params.code_challenge_method)

    redirect(`/login?returnTo=${encodeURIComponent(returnUrl.toString())}`)
  }

  // Validate required params
  if (!params.client_id || !params.redirect_uri) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Invalid Request</h1>
          <p className="text-muted-foreground mt-2">Missing required OAuth parameters.</p>
        </div>
      </div>
    )
  }

  // Build consent context
  const context = await buildConsentContext({
    clientId: params.client_id,
    redirectUri: params.redirect_uri,
    scope: params.scope || '',
    state: params.state || null,
    codeChallenge: params.code_challenge || null,
    codeChallengeMethod: (params.code_challenge_method as 'S256' | 'plain') || null,
  })

  // Handle errors
  if ('error' in context) {
    // If error, redirect back with error
    const errorUrl = new URL(params.redirect_uri)
    errorUrl.searchParams.set('error', 'access_denied')
    errorUrl.searchParams.set('error_description', context.error)
    if (params.state) errorUrl.searchParams.set('state', params.state)
    redirect(errorUrl.toString())
  }

  // Check for existing consent with matching or broader scopes
  const existingConsent = await getExistingConsent(params.client_id)
  if (existingConsent) {
    const existingScopes = new Set(existingConsent.granted_scopes)
    const allScopesCovered = context.allowedScopes.every((s) => existingScopes.has(s))

    if (allScopesCovered) {
      // Auto-approve with existing consent
      const result = await grantConsent({
        clientId: params.client_id,
        redirectUri: params.redirect_uri,
        grantedScopes: context.allowedScopes,
        state: params.state || null,
        codeChallenge: params.code_challenge || null,
        codeChallengeMethod: (params.code_challenge_method as 'S256' | 'plain') || null,
      })

      if ('code' in result) {
        const successUrl = new URL(params.redirect_uri)
        successUrl.searchParams.set('code', result.code)
        if (result.state) successUrl.searchParams.set('state', result.state)
        redirect(successUrl.toString())
      }
    }
  }

  return <ConsentClient context={context} />
}

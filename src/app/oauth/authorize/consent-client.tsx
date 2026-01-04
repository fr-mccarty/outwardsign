'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, X, Shield, Eye, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/content-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Logo } from '@/components/logo'
import { APP_NAME } from '@/lib/constants'
import { grantConsent } from '@/lib/actions/oauth'
import type { ConsentContext, OAuthScope } from '@/lib/oauth/types'
import { SCOPE_DESCRIPTIONS } from '@/lib/oauth/types'

interface ConsentClientProps {
  context: ConsentContext
}

const SCOPE_ICONS: Record<OAuthScope, React.ReactNode> = {
  read: <Eye className="h-4 w-4" />,
  write: <Pencil className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  profile: <User className="h-4 w-4" />,
}

export function ConsentClient({ context }: ConsentClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedScopes, setSelectedScopes] = useState<Set<OAuthScope>>(
    new Set(context.allowedScopes)
  )

  const handleScopeToggle = (scope: OAuthScope) => {
    const newScopes = new Set(selectedScopes)
    if (newScopes.has(scope)) {
      newScopes.delete(scope)
    } else {
      newScopes.add(scope)
    }
    setSelectedScopes(newScopes)
  }

  const handleAuthorize = async () => {
    setLoading(true)

    const result = await grantConsent({
      clientId: context.client.client_id,
      redirectUri: context.redirectUri,
      grantedScopes: Array.from(selectedScopes),
      state: context.state,
      codeChallenge: context.codeChallenge,
      codeChallengeMethod: context.codeChallengeMethod,
    })

    if ('error' in result) {
      // Redirect with error
      const errorUrl = new URL(context.redirectUri)
      errorUrl.searchParams.set('error', 'access_denied')
      errorUrl.searchParams.set('error_description', result.error)
      if (context.state) errorUrl.searchParams.set('state', context.state)
      router.push(errorUrl.toString())
      return
    }

    // Redirect with authorization code
    const successUrl = new URL(context.redirectUri)
    successUrl.searchParams.set('code', result.code)
    if (result.state) successUrl.searchParams.set('state', result.state)
    router.push(successUrl.toString())
  }

  const handleDeny = () => {
    const errorUrl = new URL(context.redirectUri)
    errorUrl.searchParams.set('error', 'access_denied')
    errorUrl.searchParams.set('error_description', 'User denied the authorization request')
    if (context.state) errorUrl.searchParams.set('state', context.state)
    router.push(errorUrl.toString())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-4">
            <Logo size="large" />
            <div className="font-semibold text-2xl text-foreground">{APP_NAME}</div>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            {/* Client Logo */}
            {context.client.logo_url && (
              <div className="flex justify-center mb-4">
                <Image
                  src={context.client.logo_url}
                  alt={context.client.name}
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
              </div>
            )}
            <CardTitle>{context.client.name}</CardTitle>
            <CardDescription>
              {context.client.description || 'wants to access your account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Security Notice */}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This will allow <strong>{context.client.name}</strong> to access your {APP_NAME} data.
                You can revoke access at any time from your settings.
              </p>
            </div>

            {/* Requested Permissions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Requested permissions:</h3>
              <div className="space-y-2">
                {context.allowedScopes.map((scope) => (
                  <label
                    key={scope}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      checked={selectedScopes.has(scope)}
                      onCheckedChange={() => handleScopeToggle(scope)}
                    />
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-muted-foreground mt-0.5">
                        {SCOPE_ICONS[scope]}
                      </span>
                      <div>
                        <div className="font-medium text-sm capitalize">{scope}</div>
                        <div className="text-xs text-muted-foreground">
                          {SCOPE_DESCRIPTIONS[scope]}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Warning for elevated permissions */}
            {(selectedScopes.has('write') || selectedScopes.has('delete')) && (
              <div className="p-3 bg-warning/10 border border-warning rounded-lg">
                <p className="text-sm text-warning">
                  {selectedScopes.has('delete')
                    ? 'This application will be able to delete data from your parish.'
                    : 'This application will be able to modify data in your parish.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDeny}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Deny
              </Button>
              <Button
                className="flex-1"
                onClick={handleAuthorize}
                disabled={loading || selectedScopes.size === 0}
              >
                {loading ? (
                  'Authorizing...'
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Authorize
                  </>
                )}
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-center text-muted-foreground">
              By authorizing, you agree to allow {context.client.name} to use your information
              in accordance with their terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

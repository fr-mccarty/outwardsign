'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { ListCard } from '@/components/list-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { Shield, ExternalLink } from 'lucide-react'
import { revokeConsent, getUserConsents } from '@/lib/actions/oauth'
import { toast } from 'sonner'
import { formatDatePretty, formatDateRelative } from '@/lib/utils/formatters'
import type { OAuthUserConsent } from '@/lib/oauth/types'
import { SCOPE_DESCRIPTIONS } from '@/lib/oauth/types'

interface AuthorizedAppsClientProps {
  initialConsents: Array<OAuthUserConsent & { client_name: string }>
}

export function AuthorizedAppsClient({ initialConsents }: AuthorizedAppsClientProps) {
  const [consents, setConsents] = useState(initialConsents)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [consentToRevoke, setConsentToRevoke] = useState<(OAuthUserConsent & { client_name: string }) | null>(null)

  async function loadConsents() {
    try {
      const newConsents = await getUserConsents()
      setConsents(newConsents)
    } catch (error) {
      console.error('Error loading consents:', error)
      toast.error('Failed to load authorized apps')
    }
  }

  const handleOpenRevokeDialog = (consent: OAuthUserConsent & { client_name: string }) => {
    setConsentToRevoke(consent)
    setRevokeDialogOpen(true)
  }

  const handleConfirmRevoke = async () => {
    if (!consentToRevoke) return

    try {
      await revokeConsent(consentToRevoke.client_id)
      toast.success(`Revoked access for ${consentToRevoke.client_name}`)
      setConsentToRevoke(null)
      await loadConsents()
    } catch (error) {
      console.error('Error revoking consent:', error)
      toast.error('Failed to revoke access')
      throw error
    }
  }

  const getScopeVariant = (scope: string): 'default' | 'secondary' | 'destructive' => {
    switch (scope) {
      case 'read':
      case 'profile':
        return 'secondary'
      case 'write':
        return 'default'
      case 'delete':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const renderConsentItem = (consent: OAuthUserConsent & { client_name: string }) => {
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{consent.client_name}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(consent.granted_scopes as string[]).map((scope) => (
              <Badge
                key={scope}
                variant={getScopeVariant(scope)}
                className="text-xs"
                title={SCOPE_DESCRIPTIONS[scope as keyof typeof SCOPE_DESCRIPTIONS]}
              >
                {scope}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Authorized {formatDatePretty(consent.granted_at)}
            {' • '}
            {formatDateRelative(consent.granted_at)}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenRevokeDialog(consent)}
          className="text-destructive hover:text-destructive"
        >
          Revoke
        </Button>
      </div>
    )
  }

  return (
    <>
      <PageContainer
        title="Authorized Apps"
        description="Manage applications that have access to your Outward Sign data. You can revoke access at any time."
      >
        {/* Info Card */}
        <div className="p-4 bg-muted rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">About Authorized Apps</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When you authorize an application, it can access your parish data within the scopes
                you granted. Revoking access will immediately prevent the application from
                accessing your data.
              </p>
            </div>
          </div>
        </div>

        {/* Authorized Apps List */}
        <ListCard
          title={`Authorized Apps (${consents.length})`}
          description="Applications with access to your parish data"
          items={consents}
          renderItem={renderConsentItem}
          getItemId={(consent) => consent.id}
          emptyMessage="No applications have been authorized to access your data."
        />
      </PageContainer>

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revoke Access"
        itemName={consentToRevoke?.client_name}
        confirmLabel="Revoke Access"
        onConfirm={handleConfirmRevoke}
      >
        <p className="text-sm text-muted-foreground">
          This will immediately revoke all access for <strong>{consentToRevoke?.client_name}</strong>.
          Any active sessions will be terminated and the application will need to request
          authorization again to access your data.
        </p>
      </ConfirmationDialog>
    </>
  )
}

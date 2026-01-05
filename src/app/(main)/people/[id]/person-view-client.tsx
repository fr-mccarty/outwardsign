"use client"

import { useState, useEffect } from 'react'
import { deletePerson, getPersonAvatarSignedUrl } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { LinkButton } from '@/components/link-button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Printer, FileText, FileDown, File, Send, ShieldOff, Loader2 } from 'lucide-react'
import { getPersonFilename, formatDateRelative } from '@/lib/utils/formatters'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  toggleParishionerPortalAccess,
  sendParishionerMagicLink,
  revokeParishionerSessions,
  getPersonSessionCount,
} from '@/lib/actions/parishioner-portal'

interface PersonViewClientProps {
  person: Person
}

export function PersonViewClient({ person }: PersonViewClientProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [portalEnabled, setPortalEnabled] = useState(person.parishioner_portal_enabled || false)
  const [isTogglingPortal, setIsTogglingPortal] = useState(false)
  const [isSendingLink, setIsSendingLink] = useState(false)
  const [isRevokingSessions, setIsRevokingSessions] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  // Fetch signed URL for avatar on mount
  useEffect(() => {
    async function fetchAvatarUrl() {
      if (person.avatar_url) {
        try {
          const url = await getPersonAvatarSignedUrl(person.avatar_url)
          setAvatarUrl(url)
        } catch (error) {
          console.error('Failed to get avatar URL:', error)
        }
      }
    }
    fetchAvatarUrl()
  }, [person.avatar_url])

  // Fetch session count on mount
  useEffect(() => {
    async function fetchSessionCount() {
      const count = await getPersonSessionCount(person.id)
      setSessionCount(count)
    }
    fetchSessionCount()
  }, [person.id])

  // Handle portal toggle
  const handlePortalToggle = async (enabled: boolean) => {
    setIsTogglingPortal(true)
    try {
      const result = await toggleParishionerPortalAccess(person.id, enabled)
      if (result.success) {
        setPortalEnabled(enabled)
        if (!enabled) {
          setSessionCount(0) // Sessions were revoked
        }
        toast.success(enabled ? 'Portal access enabled' : 'Portal access disabled')
      } else {
        toast.error(result.error || 'Failed to update portal access')
      }
    } catch {
      toast.error('Failed to update portal access')
    } finally {
      setIsTogglingPortal(false)
    }
  }

  // Handle send magic link
  const handleSendMagicLink = async () => {
    setIsSendingLink(true)
    try {
      const result = await sendParishionerMagicLink(person.id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to send magic link')
    } finally {
      setIsSendingLink(false)
    }
  }

  // Handle revoke sessions
  const handleRevokeSessions = async () => {
    setIsRevokingSessions(true)
    try {
      const result = await revokeParishionerSessions(person.id)
      if (result.success) {
        setSessionCount(0)
        toast.success(`Revoked ${result.count} session${result.count !== 1 ? 's' : ''}`)
      } else {
        toast.error(result.error || 'Failed to revoke sessions')
      }
    } catch {
      toast.error('Failed to revoke sessions')
    } finally {
      setIsRevokingSessions(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = person.first_name?.charAt(0) || ''
    const last = person.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || '?'
  }
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getPersonFilename(person, extension)
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <LinkButton href={`/people/${person.id}/edit`} className="w-full">
        <Edit className="h-4 w-4 mr-2" />
        Edit Person
      </LinkButton>
      <LinkButton href={`/print/people/${person.id}`} variant="outline" className="w-full" target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print View
      </LinkButton>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <LinkButton href={`/api/people/${person.id}/pdf?filename=${generateFilename('pdf')}`} variant="default" className="w-full" target="_blank">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </LinkButton>
      <LinkButton href={`/api/people/${person.id}/word?filename=${generateFilename('docx')}`} variant="default" className="w-full">
        <FileDown className="h-4 w-4 mr-2" />
        Download Word
      </LinkButton>
      <LinkButton href={`/api/people/${person.id}/txt?filename=${generateFilename('txt')}`} variant="default" className="w-full">
        <File className="h-4 w-4 mr-2" />
        Download Text
      </LinkButton>
    </>
  )

  // Check if pronunciation data exists
  const hasPronunciation = person.first_name_pronunciation || person.last_name_pronunciation

  // Generate details section content
  const details = (
    <>
      {/* Profile Photo */}
      <div className="flex justify-center pb-4">
        <Avatar className="h-32 w-32">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={person.full_name} />}
          <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
        </Avatar>
      </div>

      {hasPronunciation && (
        <div className="border-t pt-2">
          <span className="font-medium">Pronunciation:</span>
          <div className="text-sm text-muted-foreground mt-1">
            {person.first_name_pronunciation && person.last_name_pronunciation
              ? `${person.first_name_pronunciation} ${person.last_name_pronunciation}`
              : person.first_name_pronunciation
              ? `${person.first_name_pronunciation} (first name)`
              : `${person.last_name_pronunciation} (last name)`
            }
          </div>
        </div>
      )}

      {person.email && (
        <div className={hasPronunciation ? "pt-2 border-t" : ""}>
          <span className="font-medium">Email:</span> {person.email}
        </div>
      )}

      {person.phone_number && (
        <div className={(hasPronunciation || person.email) ? "pt-2 border-t" : ""}>
          <span className="font-medium">Phone:</span> {person.phone_number}
        </div>
      )}

      {(person.street || person.city || person.state || person.zipcode) && (
        <div className={(hasPronunciation || person.email || person.phone_number) ? "pt-2 border-t" : ""}>
          <span className="font-medium">Address:</span>
          <div className="text-sm text-muted-foreground mt-1">
            {person.street && <div>{person.street}</div>}
            {(person.city || person.state || person.zipcode) && (
              <div>
                {[person.city, person.state, person.zipcode].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portal Access Section */}
      <div className="pt-4 mt-4 border-t">
        <span className="font-medium">Portal Access</span>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground">Enabled</span>
          <Switch
            checked={portalEnabled}
            onCheckedChange={handlePortalToggle}
            disabled={isTogglingPortal}
          />
        </div>

        {/* Last Access */}
        {person.last_portal_access && (
          <div className="text-sm text-muted-foreground mt-2">
            Last access: {formatDateRelative(person.last_portal_access)}
          </div>
        )}

        {/* Active Sessions */}
        {sessionCount > 0 && (
          <div className="text-sm text-muted-foreground mt-1">
            Active sessions: {sessionCount}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSendMagicLink}
            disabled={isSendingLink || !portalEnabled || !person.email}
          >
            {isSendingLink ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Login Link
          </Button>

          {sessionCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleRevokeSessions}
              disabled={isRevokingSessions}
            >
              {isRevokingSessions ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-2" />
              )}
              Revoke Access
            </Button>
          )}
        </div>

        {/* Helper Text */}
        {!person.email && portalEnabled && (
          <p className="text-xs text-muted-foreground mt-2">
            Add an email address to send login links.
          </p>
        )}
      </div>
    </>
  )

  return (
    <ModuleViewContainer
      entity={person}
      entityType="Person"
      modulePath="people"
      generateFilename={generateFilename}
      buildLiturgy={buildPersonContactCard}
      getTemplateId={() => 'person-contact-card'}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      details={details}
      onDelete={deletePerson}
    />
  )
}

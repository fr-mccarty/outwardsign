"use client"

import { OciaSessionWithRelations, updateOciaSession, deleteOciaSession } from '@/lib/actions/ocia-sessions'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { Edit, Users } from 'lucide-react'
import Link from 'next/link'
import { PersonAvatarGroup } from '@/components/person-avatar-group'
import { useEnrichedEntityWithAvatars } from '@/hooks/use-enriched-entity-with-avatars'
import { useCallback } from 'react'

interface OciaSessionViewClientProps {
  ociaSession: OciaSessionWithRelations
}

export function OciaSessionViewClient({ ociaSession }: OciaSessionViewClientProps) {
  // Extract people (candidates) from entity
  const getPeople = useCallback(
    (session: OciaSessionWithRelations) => session.candidates || [],
    []
  )

  // Enrich entity with signed avatar URLs
  const enrichEntity = useCallback(
    (session: OciaSessionWithRelations, avatarUrls: Record<string, string>) => ({
      ...session,
      candidates: session.candidates?.map(candidate => ({
        ...candidate,
        avatar_url: candidate.id && avatarUrls[candidate.id]
          ? avatarUrls[candidate.id]
          : candidate.avatar_url
      }))
    }),
    []
  )

  // Get entity enriched with signed avatar URLs
  const enrichedOciaSession = useEnrichedEntityWithAvatars(
    ociaSession,
    getPeople,
    enrichEntity
  )

  // Generate filename for downloads (placeholder for future feature)
  const generateFilename = (extension: string) => {
    const name = ociaSession.name.replace(/[^a-zA-Z0-9]/g, '-')
    const date = ociaSession.ocia_event?.start_date || 'no-date'
    return `${name}-${date}-ocia-session.${extension}`
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/ocia-sessions/${ociaSession.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit OCIA Session
        </Link>
      </Button>
    </>
  )

  // Details section content
  const detailsContent = (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Coordinator:</span>
          <p className="text-sm text-muted-foreground">
            {enrichedOciaSession.coordinator?.full_name || 'Not assigned'}
          </p>
        </div>

        <div>
          <span className="font-medium">Status:</span>
          <div className="mt-1">
            <ModuleStatusLabel status={enrichedOciaSession.status} statusType="module" />
          </div>
        </div>

        {enrichedOciaSession.ocia_event && enrichedOciaSession.ocia_event.start_date && (
          <>
            <div>
              <span className="font-medium">Session Date:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(enrichedOciaSession.ocia_event.start_date).toLocaleDateString()}
                {enrichedOciaSession.ocia_event.start_time && (
                  <> at {enrichedOciaSession.ocia_event.start_time}</>
                )}
              </p>
            </div>

            {enrichedOciaSession.ocia_event.location && (
              <div>
                <span className="font-medium">Location:</span>
                <p className="text-sm text-muted-foreground">
                  {enrichedOciaSession.ocia_event.location.name}
                </p>
              </div>
            )}
          </>
        )}

        <div>
          <span className="font-medium">Candidates:</span>
          <p className="text-sm text-muted-foreground">
            {enrichedOciaSession.candidates?.length || 0} candidate{enrichedOciaSession.candidates?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {enrichedOciaSession.candidates && enrichedOciaSession.candidates.length > 0 && (
          <div className="lg:col-span-2">
            <span className="font-medium block mb-2">Candidate Roster:</span>
            <PersonAvatarGroup
              people={enrichedOciaSession.candidates.map(candidate => ({
                id: candidate.id,
                first_name: candidate.first_name || '',
                last_name: candidate.last_name || '',
                full_name: candidate.full_name,
                avatar_url: candidate.avatar_url
              }))}
              type="group"
              maxDisplay={10}
              size="md"
            />
          </div>
        )}
      </div>

      {enrichedOciaSession.note && (
        <div className="pt-2 border-t">
          <span className="font-medium">Notes:</span>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{enrichedOciaSession.note}</p>
        </div>
      )}
    </>
  )

  // Get candidate count for cascade delete message
  const candidateCount = enrichedOciaSession.candidates?.length || 0

  return (
    <ModuleViewContainer
      entity={enrichedOciaSession}
      entityType="OCIA Session"
      modulePath="ocia-sessions"
      actionButtons={actionButtons}
      details={detailsContent}
      onDelete={deleteOciaSession}
      cascadeDelete={{
        label: 'Also delete all linked candidates',
        description: `Delete this OCIA session and all ${candidateCount} linked candidate${candidateCount !== 1 ? 's' : ''}. The people records will be permanently deleted.`,
      }}
    >
      {null}
    </ModuleViewContainer>
  )
}

"use client"

import { useState } from 'react'
import { addCandidateToSession, removeCandidateFromSession } from '@/lib/actions/ocia-sessions'
import type { OciaSessionWithRelations } from '@/lib/actions/ocia-sessions'
import { ListCard, CardListItem } from '@/components/list-card'
import { PeoplePicker } from '@/components/people-picker'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CandidatesSectionProps {
  ociaSession: OciaSessionWithRelations
}

export function CandidatesSection({ ociaSession }: CandidatesSectionProps) {
  const router = useRouter()
  const [showCandidatePicker, setShowCandidatePicker] = useState(false)

  const handleAddCandidate = async (person: any) => {
    try {
      await addCandidateToSession(ociaSession.id, person.id)
      toast.success('Candidate added to session')
      router.refresh()
      setShowCandidatePicker(false)
    } catch (error: any) {
      console.error('Failed to add candidate:', error)
      toast.error(error.message || 'Failed to add candidate to session')
    }
  }

  const handleRemoveCandidate = async (personId: string) => {
    try {
      await removeCandidateFromSession(personId)
      toast.success('Candidate removed from session')
      router.refresh()
    } catch (error: any) {
      console.error('Failed to remove candidate:', error)
      toast.error(error.message || 'Failed to remove candidate from session')
    }
  }

  return (
    <>
      <div data-testid="ocia-candidates-list">
        <ListCard
          title="Candidates in This Session"
          description={`${ociaSession.candidates?.length || 0} ${ociaSession.candidates?.length === 1 ? 'candidate' : 'candidates'} in this OCIA session`}
          items={ociaSession.candidates || []}
          getItemId={(candidate) => candidate.id}
          onAdd={() => setShowCandidatePicker(true)}
          addButtonLabel="Add Candidate"
          emptyMessage="No candidates in this session yet. Click 'Add Candidate' to add an existing person."
          renderItem={(candidate) => {
          const candidateName = candidate.full_name || 'No name assigned'

          return (
            <CardListItem
              id={candidate.id}
              onDelete={() => handleRemoveCandidate(candidate.id)}
              deleteConfirmTitle="Remove Candidate from Session?"
              deleteConfirmDescription={`Are you sure you want to remove ${candidateName} from this OCIA session? The person record will remain in the system and can be re-added to this or another session later.`}
              deleteActionLabel="Remove from Session"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/people/${candidate.id}`}
                  className="font-medium hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {candidateName}
                </Link>
                {candidate.email && (
                  <p className="text-sm text-muted-foreground">
                    {candidate.email}
                  </p>
                )}
                {candidate.phone_number && (
                  <p className="text-sm text-muted-foreground">
                    {candidate.phone_number}
                  </p>
                )}
              </div>
            </CardListItem>
          )
        }}
        />
      </div>

      {/* Candidate Picker Dialog */}
      <PeoplePicker
        open={showCandidatePicker}
        onOpenChange={setShowCandidatePicker}
        onSelect={handleAddCandidate}
      />
    </>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { deletePerson, getPersonAvatarSignedUrl } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { getPersonFilename } from '@/lib/utils/formatters'

interface PersonViewClientProps {
  person: Person
}

export function PersonViewClient({ person }: PersonViewClientProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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
      <Button asChild className="w-full">
        <Link href={`/people/${person.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Person
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/people/${person.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/people/${person.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/people/${person.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
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

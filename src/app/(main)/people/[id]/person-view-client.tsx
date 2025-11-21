"use client"

import { deletePerson } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { Button } from '@/components/ui/button'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { getPersonFilename } from '@/lib/utils/formatters'

interface PersonViewClientProps {
  person: Person
}

export function PersonViewClient({ person }: PersonViewClientProps) {
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

  // Generate details section content
  const details = (
    <>
      {person.email && (
        <div>
          <span className="font-medium">Email:</span> {person.email}
        </div>
      )}

      {person.phone_number && (
        <div className={person.email ? "pt-2 border-t" : ""}>
          <span className="font-medium">Phone:</span> {person.phone_number}
        </div>
      )}

      {(person.street || person.city || person.state || person.zipcode) && (
        <div className={(person.email || person.phone_number) ? "pt-2 border-t" : ""}>
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

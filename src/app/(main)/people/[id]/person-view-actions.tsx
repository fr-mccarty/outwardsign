'use client'

import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/components/delete-button"
import Link from "next/link"
import { Edit, Copy } from "lucide-react"
import type { Person } from "@/lib/types"
import { toast } from 'sonner'

interface PersonViewActionsProps {
  person: Person
  onDelete: (id: string) => Promise<void>
}

export function PersonViewActions({ person, onDelete }: PersonViewActionsProps) {
  const handleCopyInfo = () => {
    const info = `${person.first_name} ${person.last_name}${person.email ? `\nEmail: ${person.email}` : ''}${person.phone_number ? `\nPhone: ${person.phone_number}` : ''}${person.street ? `\nAddress: ${person.street}` : ''}${person.city || person.state || person.zipcode ? `\n${person.city}${person.city && (person.state || person.zipcode) ? ', ' : ''}${person.state} ${person.zipcode}` : ''}${person.note ? `\n\nNotes: ${person.note}` : ''}`
    navigator.clipboard.writeText(info)
    toast.success('Person information copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={handleCopyInfo}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/people/${person.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <DeleteButton
        entityId={person.id}
        entityType="Person"
        modulePath="people"
        onDelete={onDelete}
      />
    </div>
  )
}

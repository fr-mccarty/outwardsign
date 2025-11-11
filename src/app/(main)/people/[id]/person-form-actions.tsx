'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Edit, Copy, Trash2 } from "lucide-react"
import { deletePerson } from "@/lib/actions/people"
import type { Person } from "@/lib/types"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PersonFormActionsProps {
  person: Person
}

export function PersonFormActions({ person }: PersonFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePerson(person.id)
      toast.success('Person deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/people')
    } catch (error) {
      console.error('Failed to delete person:', error)
      toast.error('Failed to delete person. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Person</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this person? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

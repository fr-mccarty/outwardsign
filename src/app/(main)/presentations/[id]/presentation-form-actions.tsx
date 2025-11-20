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
} from "@/components/ui/dialog"
import { DialogButton } from "@/components/dialog-button"
import Link from "next/link"
import { Edit, Copy, Trash2 } from "lucide-react"
import { deletePresentation, type PresentationWithRelations } from "@/lib/actions/presentations"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PresentationFormActionsProps {
  presentation: PresentationWithRelations
}

export function PresentationFormActions({ presentation }: PresentationFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePresentation(presentation.id)
      toast.success('Presentation deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/presentations')
    } catch (error) {
      console.error('Failed to delete presentation:', error)
      toast.error('Failed to delete presentation. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const childName = presentation.child ? `${presentation.child.first_name} ${presentation.child.last_name}` : 'Not specified'
    const childSex = presentation.child?.sex || 'Not specified'
    const motherName = presentation.mother ? `${presentation.mother.first_name} ${presentation.mother.last_name}` : 'Not specified'
    const fatherName = presentation.father ? `${presentation.father.first_name} ${presentation.father.last_name}` : 'Not specified'

    const info = `Child: ${childName}\nSex: ${childSex}\nMother: ${motherName}\nFather: ${fatherName}\nBaptized: ${presentation.is_baptized ? 'Yes' : 'No'}${presentation.note ? `\n\nNotes: ${presentation.note}` : ''}`
    navigator.clipboard.writeText(info)
    toast.success('Presentation information copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={handleCopyInfo}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/presentations/${presentation.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogButton variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DialogButton>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Presentation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this presentation? This action cannot be undone.
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

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
import { deletePresentation } from "@/lib/actions/presentations"
import type { Presentation } from "@/lib/types"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PresentationFormActionsProps {
  presentation: Presentation
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
    const info = `Child: ${presentation.child_name}\nSex: ${presentation.child_sex}\nMother: ${presentation.mother_name}\nFather: ${presentation.father_name}${presentation.godparents_names ? `\nGodparents: ${presentation.godparents_names}` : ''}\nBaptized: ${presentation.is_baptized ? 'Yes' : 'No'}\nLanguage: ${presentation.language}${presentation.notes ? `\n\nNotes: ${presentation.notes}` : ''}`
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
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
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

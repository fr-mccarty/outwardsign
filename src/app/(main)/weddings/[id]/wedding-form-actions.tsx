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
import { deleteWedding } from "@/lib/actions/weddings"
import type { Wedding } from "@/lib/types"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface WeddingFormActionsProps {
  wedding: Wedding
}

export function WeddingFormActions({ wedding }: WeddingFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteWedding(wedding.id)
      toast.success('Wedding deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/weddings')
    } catch (error) {
      console.error('Failed to delete wedding:', error)
      toast.error('Failed to delete wedding. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const info = `Wedding Details\nStatus: ${wedding.status || 'N/A'}${wedding.notes ? `\n\nNotes: ${wedding.notes}` : ''}${wedding.announcements ? `\n\nAnnouncements: ${wedding.announcements}` : ''}`
    navigator.clipboard.writeText(info)
    toast.success('Wedding information copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button variant="outline" onClick={handleCopyInfo}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/weddings/${wedding.id}/edit`}>
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
            <DialogTitle>Delete Wedding</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wedding? This action cannot be undone.
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

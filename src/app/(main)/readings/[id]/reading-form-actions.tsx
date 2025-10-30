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
import { deleteReading, type Reading } from "@/lib/actions/readings"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReadingFormActionsProps {
  reading: Reading
}

export function ReadingFormActions({ reading }: ReadingFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteReading(reading.id)
      toast.success('Reading deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/readings')
    } catch (error) {
      console.error('Failed to delete reading:', error)
      toast.error('Failed to delete reading. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyText = () => {
    const fullText = `${reading.pericope}\n\n${reading.text}`
    navigator.clipboard.writeText(fullText)
    toast.success('Reading text copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={handleCopyText}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Text
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/readings/${reading.id}/edit`}>
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
            <DialogTitle>Delete Reading</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reading? This action cannot be undone.
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

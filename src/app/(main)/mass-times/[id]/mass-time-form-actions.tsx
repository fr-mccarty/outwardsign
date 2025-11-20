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
import { deleteMassTime } from "@/lib/actions/mass-times"
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MassTimeFormActionsProps {
  massTime: MassTimeWithRelations
}

export function MassTimeFormActions({ massTime }: MassTimeFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMassTime(massTime.id)
      toast.success('Template deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/mass-times')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const info = `Mass Times Template
Name: ${massTime.name}${massTime.description ? `\nDescription: ${massTime.description}` : ''}
Status: ${massTime.is_active ? 'Active' : 'Inactive'}`

    navigator.clipboard.writeText(info)
    toast.success('Template information copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button variant="outline" onClick={handleCopyInfo}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/mass-times/${massTime.id}/edit`}>
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
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mass times template? This action cannot be undone.
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

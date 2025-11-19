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
      toast.success('Mass time deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/mass-times')
    } catch (error) {
      console.error('Failed to delete mass time:', error)
      toast.error('Failed to delete mass time. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const massType = massTime.mass_type?.label_en || 'Unknown Type'
    const scheduleItems = massTime.schedule_items
      .map(item => `${item.day}: ${item.time}`)
      .join('\n')

    const info = `Mass Time Details
Mass Type: ${massType}
Schedule:
${scheduleItems}${massTime.special_designation ? `\nSpecial: ${massTime.special_designation}` : ''}${massTime.notes ? `\n\nNotes: ${massTime.notes}` : ''}`

    navigator.clipboard.writeText(info)
    toast.success('Mass time information copied to clipboard')
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
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mass Time</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mass time schedule? This action cannot be undone.
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

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteButtonProps {
  /**
   * The ID of the entity to delete
   */
  entityId: string

  /**
   * Display name of the entity type (e.g., "Wedding", "Funeral")
   */
  entityType: string

  /**
   * Module path for redirect after deletion (e.g., "weddings", "funerals")
   */
  modulePath: string

  /**
   * Server action to delete the entity
   */
  onDelete: (id: string) => Promise<void>

  /**
   * Optional custom confirmation message
   */
  confirmMessage?: string
}

export function DeleteButton({
  entityId,
  entityType,
  modulePath,
  onDelete,
  confirmMessage,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(entityId)
      toast.success(`${entityType} deleted successfully`)
      setDeleteDialogOpen(false)
      router.push(`/${modulePath}`)
    } catch (error) {
      console.error(`Failed to delete ${entityType.toLowerCase()}:`, error)
      toast.error(`Failed to delete ${entityType.toLowerCase()}. Please try again.`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete {entityType}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {entityType}</DialogTitle>
          <DialogDescription>
            {confirmMessage || `Are you sure you want to delete this ${entityType.toLowerCase()}? This action cannot be undone.`}
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
  )
}

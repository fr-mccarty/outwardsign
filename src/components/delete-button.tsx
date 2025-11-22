'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
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

/**
 * DeleteButton Component
 *
 * A convenience wrapper around DeleteConfirmationDialog that:
 * - Provides a trigger button with icon
 * - Handles the delete operation
 * - Shows success/error toasts
 * - Automatically redirects after successful deletion
 *
 * Used primarily in ModuleViewPanel for entity deletion.
 */
export function DeleteButton({
  entityId,
  entityType,
  modulePath,
  onDelete,
  confirmMessage,
}: DeleteButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await onDelete(entityId)
      toast.success(`${entityType} deleted successfully`)
      router.push(`/${modulePath}`)
    } catch (error) {
      console.error(`Failed to delete ${entityType.toLowerCase()}:`, error)
      toast.error(`Failed to delete ${entityType.toLowerCase()}. Please try again.`)
      throw error // Re-throw so DeleteConfirmationDialog knows it failed
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete {entityType}
      </Button>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={`Delete ${entityType}`}
        description={confirmMessage || `Are you sure you want to delete this ${entityType.toLowerCase()}? This action cannot be undone.`}
        actionLabel="Delete"
      />
    </>
  )
}

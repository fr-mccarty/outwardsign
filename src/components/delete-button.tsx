'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  onDelete: (id: string, options?: any) => Promise<void>

  /**
   * Optional custom confirmation message
   */
  confirmMessage?: string

  /**
   * Optional cascade delete configuration for entities with children
   */
  cascadeDelete?: {
    /**
     * Label for the checkbox (e.g., "Also delete all linked baptisms")
     */
    label: string
    /**
     * Description shown below the checkbox
     */
    description?: string
  }
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
  cascadeDelete,
}: DeleteButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteCascade, setDeleteCascade] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      // Pass cascade option if configured
      if (cascadeDelete) {
        await onDelete(entityId, { deleteLinkedBaptisms: deleteCascade })
      } else {
        await onDelete(entityId)
      }
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
      >
        {cascadeDelete && (
          <div className="px-6 py-4 space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="delete-cascade"
                checked={deleteCascade}
                onCheckedChange={(checked) => setDeleteCascade(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="delete-cascade"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {cascadeDelete.label}
                </Label>
                {cascadeDelete.description && (
                  <p className="text-sm text-muted-foreground">
                    {cascadeDelete.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DeleteConfirmationDialog>
    </>
  )
}

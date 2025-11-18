"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MassRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { deleteMassRole } from "@/lib/actions/mass-roles"

interface MassRoleFormActionsProps {
  massRole: MassRole
}

export function MassRoleFormActions({ massRole }: MassRoleFormActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/mass-roles/${massRole.id}/edit`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMassRole(massRole.id)
      toast.success('Mass role deleted successfully')
      router.push('/mass-roles')
    } catch (error) {
      console.error('Error deleting mass role:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete mass role'
      toast.error(errorMessage)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={handleEdit} variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="outline"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mass Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{massRole.name}&quot;? This mass role cannot
              be deleted if it is being used in any templates or assigned to any masses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Mass Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

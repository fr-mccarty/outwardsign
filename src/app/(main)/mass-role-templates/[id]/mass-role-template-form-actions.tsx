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
import { deleteMassRoleTemplate, type MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MassRoleTemplateFormActionsProps {
  template: MassRoleTemplate
}

export function MassRoleTemplateFormActions({ template }: MassRoleTemplateFormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMassRoleTemplate(template.id)
      toast.success('Template deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/mass-role-templates')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const info = `Mass Role Template
Name: ${template.name}
${template.description ? `Description: ${template.description}\n` : ''}${template.note ? `Note: ${template.note}\n` : ''}`
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
        <Link href={`/mass-role-templates/${template.id}/edit`}>
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
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Mass role template? This action cannot be undone.
              Any Masses using this template will no longer have a template reference.
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

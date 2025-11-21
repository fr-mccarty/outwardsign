'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createMassType, updateMassType, type MassType } from '@/lib/actions/mass-types'

interface MassTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  massType?: MassType
  onSuccess: () => void
}

export function MassTypeFormDialog({
  open,
  onOpenChange,
  massType,
  onSuccess,
}: MassTypeFormDialogProps) {
  const isEditing = !!massType

  // Form state
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [active, setActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog opens/closes or massType changes
  useEffect(() => {
    if (open) {
      if (massType) {
        setKey(massType.key)
        setName(massType.name)
        setDescription(massType.description || '')
        setDisplayOrder(String(massType.display_order))
        setActive(massType.active)
      } else {
        // Reset to defaults for create
        setKey('')
        setName('')
        setDescription('')
        setDisplayOrder('0')
        setActive(true)
      }
    }
  }, [open, massType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      if (!name.trim()) {
        toast.error('Name is required')
        setIsLoading(false)
        return
      }

      const data = {
        key: key.trim() || name.toUpperCase().replace(/\s+/g, '_'),
        name: name.trim(),
        description: description.trim() || undefined,
        display_order: parseInt(displayOrder) || 0,
        active,
      }

      if (isEditing) {
        await updateMassType(massType.id, data)
        toast.success('Mass type updated successfully')
      } else {
        await createMassType(data)
        toast.success('Mass type created successfully')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving mass type:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save mass type'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Mass Type' : 'Create Mass Type'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the mass type details below.'
                : 'Create a new mass type category for your parish.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekend, Daily, Adoration"
                required
              />
            </div>

            {/* Key (optional, auto-generated from name) */}
            <div className="space-y-2">
              <Label htmlFor="key">
                Key <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Auto-generated from name"
                className="font-mono text-sm"
                disabled={isEditing && massType?.is_system}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (uppercase, underscores). Leave blank to auto-generate.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this mass type"
                rows={2}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in dropdowns
              </p>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={active}
                onCheckedChange={(checked) => setActive(checked as boolean)}
              />
              <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                Active (show in mass times forms)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

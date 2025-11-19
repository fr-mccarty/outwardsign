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
  const [labelEn, setLabelEn] = useState('')
  const [labelEs, setLabelEs] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [active, setActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog opens/closes or massType changes
  useEffect(() => {
    if (open) {
      if (massType) {
        setKey(massType.key)
        setLabelEn(massType.label_en)
        setLabelEs(massType.label_es)
        setDescription(massType.description || '')
        setColor(massType.color || '')
        setDisplayOrder(String(massType.display_order))
        setActive(massType.active)
      } else {
        // Reset to defaults for create
        setKey('')
        setLabelEn('')
        setLabelEs('')
        setDescription('')
        setColor('')
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
      if (!labelEn.trim()) {
        toast.error('English label is required')
        setIsLoading(false)
        return
      }

      if (!labelEs.trim()) {
        toast.error('Spanish label is required')
        setIsLoading(false)
        return
      }

      const data = {
        key: key.trim() || labelEn.toUpperCase().replace(/\s+/g, '_'),
        label_en: labelEn.trim(),
        label_es: labelEs.trim(),
        description: description.trim() || undefined,
        color: color.trim() || undefined,
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
            {/* English Label */}
            <div className="space-y-2">
              <Label htmlFor="label_en">English Label *</Label>
              <Input
                id="label_en"
                value={labelEn}
                onChange={(e) => setLabelEn(e.target.value)}
                placeholder="e.g., Weekend, Daily, Adoration"
                required
              />
            </div>

            {/* Spanish Label */}
            <div className="space-y-2">
              <Label htmlFor="label_es">Spanish Label *</Label>
              <Input
                id="label_es"
                value={labelEs}
                onChange={(e) => setLabelEs(e.target.value)}
                placeholder="e.g., Fin de Semana, Diaria, Adoración"
                required
              />
            </div>

            {/* Key (optional, auto-generated from English label) */}
            <div className="space-y-2">
              <Label htmlFor="key">
                Key <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Auto-generated from English label"
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

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">
                Color <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color || '#3b82f6'}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 font-mono text-sm"
                />
              </div>
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

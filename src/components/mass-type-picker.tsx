'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { getMassTypes, createMassType, type MassType } from '@/lib/actions/mass-types'

interface MassTypePickerProps {
  value?: string
  onChange: (massTypeId: string) => void
  disabled?: boolean
}

export function MassTypePicker({ value, onChange, disabled }: MassTypePickerProps) {
  const [massTypes, setMassTypes] = useState<MassType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Create form state
  const [labelEn, setLabelEn] = useState('')
  const [labelEs, setLabelEs] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Fetch mass types on mount
  useEffect(() => {
    loadMassTypes()
  }, [])

  const loadMassTypes = async () => {
    try {
      const types = await getMassTypes()
      setMassTypes(types)
    } catch (error) {
      console.error('Failed to fetch mass types:', error)
      toast.error('Failed to load mass types')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!labelEn.trim()) {
      toast.error('English label is required')
      return
    }

    if (!labelEs.trim()) {
      toast.error('Spanish label is required')
      return
    }

    setIsCreating(true)
    try {
      const newMassType = await createMassType({
        label_en: labelEn.trim(),
        label_es: labelEs.trim(),
        key: labelEn.toUpperCase().replace(/\s+/g, '_'),
      })

      toast.success('Mass type created successfully')

      // Reset form
      setLabelEn('')
      setLabelEs('')
      setShowCreateDialog(false)

      // Reload mass types and auto-select the new one
      await loadMassTypes()
      onChange(newMassType.id)
    } catch (error) {
      console.error('Failed to create mass type:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create mass type'
      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{isLoading ? 'Loading...' : 'Select mass type'}</option>
          {massTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label_en}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled}
          title="Create new mass type"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Mass Type Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Mass Type</DialogTitle>
              <DialogDescription>
                Create a new mass type category for your parish.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create_label_en">English Label *</Label>
                <Input
                  id="create_label_en"
                  value={labelEn}
                  onChange={(e) => setLabelEn(e.target.value)}
                  placeholder="e.g., Weekend, Daily, Adoration"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create_label_es">Spanish Label *</Label>
                <Input
                  id="create_label_es"
                  value={labelEs}
                  onChange={(e) => setLabelEs(e.target.value)}
                  placeholder="e.g., Fin de Semana, Diaria, Adoración"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCustomListItems } from '@/lib/actions/custom-list-items'
import type { CustomListItem } from '@/lib/types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ListItemPickerFieldProps {
  label: string
  listId: string
  value: string | null
  onValueChange: (itemId: string | null, item: CustomListItem | null) => void
  description?: string
  placeholder?: string
  required?: boolean
  testId?: string
}

export function ListItemPickerField({
  label,
  listId,
  value,
  onValueChange,
  description,
  placeholder = 'Select an option',
  required = false,
  testId,
}: ListItemPickerFieldProps) {
  const [items, setItems] = useState<CustomListItem[]>([])
  const [loading, setLoading] = useState(false)
  const labelId = testId || label.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    if (listId) {
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadItems is stable, only re-run when listId changes
  }, [listId])

  const loadItems = async () => {
    try {
      setLoading(true)
      const result = await getCustomListItems(listId)
      setItems(result)
    } catch (error) {
      console.error('Error loading list items:', error)
      toast.error('Failed to load list options')
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (itemId: string) => {
    if (itemId === '__clear__') {
      onValueChange(null, null)
    } else {
      const item = items.find(i => i.id === itemId) || null
      onValueChange(itemId, item)
    }
  }

  const selectedItem = value ? items.find(i => i.id === value) : null

  return (
    <div className="space-y-2">
      <Label htmlFor={labelId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Select
        value={value || undefined}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger
          id={labelId}
          data-testid={`${labelId}-trigger`}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder}>
              {selectedItem?.value || placeholder}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="__clear__">
              <span className="text-muted-foreground">Clear selection</span>
            </SelectItem>
          )}
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.value}
            </SelectItem>
          ))}
          {items.length === 0 && !loading && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No options available
            </div>
          )}
        </SelectContent>
      </Select>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

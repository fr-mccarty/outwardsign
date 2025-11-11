'use client'

import {
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
  CommandItem,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PickerListWrapperProps<T> {
  loading: boolean
  items: T[]
  emptyMessage: string
  emptyIcon: LucideIcon
  onAddNew: () => void
  addNewLabel: string
  addNewIcon: LucideIcon
  renderItem: (item: T) => ReactNode
  groupHeading?: string
}

export function PickerListWrapper<T>({
  loading,
  items,
  emptyMessage,
  emptyIcon: EmptyIcon,
  onAddNew,
  addNewLabel,
  addNewIcon: AddNewIcon,
  renderItem,
  groupHeading = "Results",
}: PickerListWrapperProps<T>) {
  return (
    <CommandList className="max-h-[400px]">
      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            Searching...
          </div>
        </div>
      )}

      {!loading && items.length === 0 && (
        <CommandEmpty className="py-6 text-center text-sm">
          <div className="flex flex-col items-center gap-2">
            <EmptyIcon className="h-8 w-8 text-muted-foreground" />
            <div>{emptyMessage}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddNew}
              className="mt-2"
            >
              <AddNewIcon className="h-4 w-4 mr-2" />
              {addNewLabel}
            </Button>
          </div>
        </CommandEmpty>
      )}

      {!loading && items.length > 0 && (
        <>
          <CommandGroup heading={groupHeading}>
            {items.map(renderItem)}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup>
            <CommandItem
              onSelect={onAddNew}
              className="flex items-center gap-2 px-3 py-3 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <AddNewIcon className="h-4 w-4" />
              <span>{addNewLabel}</span>
            </CommandItem>
          </CommandGroup>
        </>
      )}
    </CommandList>
  )
}

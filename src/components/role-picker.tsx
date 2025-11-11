'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserCog, Plus, Save } from 'lucide-react'
import { getRoles, createRole } from '@/lib/actions/roles'
import type { Role } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Zod schema for inline "Add New Role" form
const newRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  note: z.string().optional(),
})

type NewRoleFormData = z.infer<typeof newRoleSchema>

interface RolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (role: Role) => void
  placeholder?: string
  emptyMessage?: string
  selectedRoleId?: string
  className?: string
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function RolePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = "Search for a role...",
  emptyMessage = "No roles found.",
  selectedRoleId,
  className,
}: RolePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<NewRoleFormData>({
    resolver: zodResolver(newRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      note: '',
    },
  })

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const loadRolesCallback = useCallback(async () => {
    try {
      setLoading(true)
      const results = await getRoles()
      setRoles(results)
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load roles when dialog opens
  useEffect(() => {
    if (open && roles.length === 0) {
      loadRolesCallback()
    }
  }, [open, roles.length, loadRolesCallback])

  // Filter roles client-side based on search query
  const filteredRoles = roles.filter((role) => {
    if (!debouncedSearchQuery) return true
    const query = debouncedSearchQuery.toLowerCase()
    return (
      role.name.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query)
    )
  })

  const handleRoleSelect = (role: Role) => {
    onSelect(role)
    onOpenChange(false)
    setSearchQuery('')
    setShowAddForm(false)
  }

  const handleAddNewRole = () => {
    setShowAddForm(true)
  }

  const onSubmitNewRole = async (data: NewRoleFormData) => {
    try {
      const newRole = await createRole({
        name: data.name,
        description: data.description || undefined,
        note: data.note || undefined
      })

      toast.success('Role created successfully')

      // Reset form
      reset()
      setShowAddForm(false)

      // Refresh roles list
      await loadRolesCallback()

      // Select the newly created role (this will close the picker)
      handleRoleSelect(newRole)
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to add role')
    }
  }

  const handleCancelAddRole = () => {
    setShowAddForm(false)
    reset()
  }

  const isRoleSelected = (role: Role) => {
    return selectedRoleId === role.id
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">Select Role</DialogTitle>
        <Command className={cn("rounded-lg border shadow-md", className)} shouldFilter={false}>
          <div className="flex items-center border-b px-3" onClick={(e) => e.stopPropagation()}>
            <CommandInput
              placeholder={placeholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <CommandList className="max-h-[400px]">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Loading roles...
                </div>
              </div>
            )}

            {!loading && filteredRoles.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm">
                <div className="flex flex-col items-center gap-2">
                  <UserCog className="h-8 w-8 text-muted-foreground" />
                  <div>{emptyMessage}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewRole}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Role
                  </Button>
                </div>
              </CommandEmpty>
            )}

            {!loading && filteredRoles.length > 0 && (
              <>
                <CommandGroup heading="Roles">
                  {filteredRoles.map((role) => (
                    <CommandItem
                      key={role.id}
                      value={role.id}
                      onSelect={() => handleRoleSelect(role)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 cursor-pointer",
                        isRoleSelected(role) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <UserCog className="h-5 w-5 text-muted-foreground" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {role.name}
                          </span>
                          {isRoleSelected(role) && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>

                        {role.description && (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {role.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup>
                  <CommandItem
                    onSelect={handleAddNewRole}
                    className="flex items-center gap-2 px-3 py-3 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Role</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      {/* New Role Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Create a new liturgical role for your parish.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitNewRole)} className="flex flex-col flex-1 min-h-0">
            <div className="grid gap-4 py-4 overflow-y-auto flex-1 -mx-6 px-6">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="name" className="text-right pt-2">
                  Name *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={watch('name')}
                    onChange={(e) => setValue('name', e.target.value)}
                    className={cn(errors.name && "border-red-500")}
                    placeholder="Lector"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={watch('description') || ''}
                  onChange={(e) => setValue('description', e.target.value)}
                  className="col-span-3"
                  placeholder="Proclaims the Word of God"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note" className="text-right">
                  Note
                </Label>
                <Textarea
                  id="note"
                  value={watch('note') || ''}
                  onChange={(e) => setValue('note', e.target.value)}
                  className="col-span-3"
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelAddRole}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Role
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Hook to use the role picker
export function useRolePicker() {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (role: Role) => {
    setSelectedRole(role)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedRole(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedRole,
    handleSelect,
    clearSelection,
    setOpen,
  }
}

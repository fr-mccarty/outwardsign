'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getMassRoles } from '@/lib/actions/mass-roles'
import type { MassRole } from '@/lib/types'
import { createTemplateItem } from '@/lib/actions/mass-role-template-items'
import { AddRoleModal } from './add-role-modal'
import { toast } from 'sonner'

interface RoleSelectorProps {
  templateId: string
  existingRoleIds: string[]
  onRoleAdded: () => void
  onCancel: () => void
}

export function RoleSelector({
  templateId,
  existingRoleIds,
  onRoleAdded,
  onCancel
}: RoleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<MassRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setIsLoading(true)
      const data = await getMassRoles()
      setRoles(data)
    } catch (error) {
      console.error('Failed to load mass roles:', error)
      toast.error('Failed to load mass roles')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter out roles already in template
  const availableRoles = roles.filter(role => !existingRoleIds.includes(role.id))

  const handleSelectRole = async (roleId: string) => {
    try {
      setIsAdding(true)
      await createTemplateItem({
        template_id: templateId,
        mass_role_id: roleId,
        count: 1
      })
      toast.success('Mass role added to template')
      setOpen(false)
      onRoleAdded()
    } catch (error) {
      console.error('Failed to add mass role:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add mass role'
      toast.error(errorMessage)
    } finally {
      setIsAdding(false)
    }
  }

  const handleNewRoleCreated = async (newRole: MassRole) => {
    setShowAddRoleModal(false)
    // Reload roles to include the new one
    await loadRoles()
    // Automatically add the new role to the template
    await handleSelectRole(newRole.id)
  }

  return (
    <>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
              disabled={isAdding}
            >
              Select a mass role...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search mass roles..." />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? 'Loading mass roles...' : 'No mass roles found.'}
                </CommandEmpty>
                {availableRoles.length > 0 && (
                  <CommandGroup heading="Available Mass Roles">
                    {availableRoles.map((role) => (
                      <CommandItem
                        key={role.id}
                        value={role.name}
                        onSelect={() => handleSelectRole(role.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{role.name}</p>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowAddRoleModal(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add New Mass Role...</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <AddRoleModal
        open={showAddRoleModal}
        onOpenChange={setShowAddRoleModal}
        onRoleCreated={handleNewRoleCreated}
      />
    </>
  )
}

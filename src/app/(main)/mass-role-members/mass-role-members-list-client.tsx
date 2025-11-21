'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogButton } from '@/components/dialog-button'
import { SearchCard } from '@/components/search-card'
import { Search, User, Mail, Phone, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Person, MassRole } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { PersonPickerField } from '@/components/person-picker-field'
import { MassRolePickerField } from '@/components/mass-role-picker-field'
import { createMassRolePreference } from '@/lib/actions/mass-role-members-compat'
import { toast } from 'sonner'
import type { PersonWithMassRoles } from '@/lib/actions/mass-role-members-compat'

interface MassRoleMembersListClientProps {
  initialData: PersonWithMassRoles[]
  massRoles: MassRole[]
  allPeople: Person[]
}

export function MassRoleMembersListClient({
  initialData,
  massRoles,
  allPeople
}: MassRoleMembersListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<MassRole | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams()
    if (value) {
      params.set('search', value)
    }
    router.push(`/mass-role-members${value ? `?${params.toString()}` : ''}`)
  }

  const filteredPeople = search
    ? initialData.filter(person =>
        `${person.first_name} ${person.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        person.email?.toLowerCase().includes(search.toLowerCase())
      )
    : initialData

  const handleAddRoleAssignment = async () => {
    if (!selectedRole) {
      toast.error('Please select a mass role')
      return
    }

    if (!selectedPerson) {
      toast.error('Please select a person')
      return
    }

    setIsSaving(true)
    try {
      // Create a mass role preference for this person
      await createMassRolePreference({
        person_id: selectedPerson.id,
        mass_role_id: selectedRole.id,
        active: true
      })

      toast.success(`${selectedPerson.first_name} ${selectedPerson.last_name} assigned to ${selectedRole.name}`)
      setIsDialogOpen(false)
      setSelectedRole(null)
      setSelectedPerson(null)
      router.refresh()
    } catch (error) {
      console.error('Error creating role assignment:', error)
      toast.error('Failed to create role assignment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* New Mass Role Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogButton>
          <UserPlus className="h-4 w-4 mr-2" />
          New Mass Role Member
        </DialogButton>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Mass Role Member</DialogTitle>
            <DialogDescription>
              Select a mass role and assign a person to serve in that role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <MassRolePickerField
              label="Mass Role"
              value={selectedRole}
              onValueChange={setSelectedRole}
              showPicker={showRolePicker}
              onShowPickerChange={setShowRolePicker}
              placeholder="Select a mass role..."
              required
            />
            <PersonPickerField
              label="Person"
              value={selectedPerson}
              onValueChange={setSelectedPerson}
              showPicker={showPersonPicker}
              onShowPickerChange={setShowPersonPicker}
              placeholder="Select a person..."
              required
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedRole(null)
                  setSelectedPerson(null)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRoleAssignment}
                disabled={!selectedRole || !selectedPerson || isSaving}
              >
                {isSaving ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <SearchCard modulePlural="Mass Role Members" moduleSingular="Mass Role Member" className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </SearchCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total People</div>
          <div className="text-2xl font-bold">{initialData.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Mass Roles</div>
          <div className="text-2xl font-bold">{massRoles.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Servers</div>
          <div className="text-2xl font-bold">{filteredPeople.length}</div>
        </Card>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPeople.length} of {initialData.length} people
      </div>

      {/* Empty state */}
      {filteredPeople.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No people found</h3>
            <p className="text-muted-foreground">
              {search
                ? 'Try adjusting your search criteria'
                : 'Get started by adding people to your parish'}
            </p>
          </div>
        </Card>
      )}

      {/* People grid */}
      {filteredPeople.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <Link
              key={person.id}
              href={`/mass-role-members/${person.id}`}
            >
              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer h-full">
                <div className="space-y-3">
                  {/* Name */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-lg">
                        {person.first_name} {person.last_name}
                      </h3>
                    </div>
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>

                  {/* Contact info */}
                  <div className="space-y-2 text-sm">
                    {person.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                    {person.phone_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{person.phone_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Role badges */}
                  {person.role_names.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                      {person.role_names.slice(0, 3).map((role, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {person.role_names.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{person.role_names.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

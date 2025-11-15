'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, X } from 'lucide-react'
import { getPeopleWithRolesPaginated, type PersonWithGroupRoles } from '@/lib/actions/people'
import { getMassRoles } from '@/lib/actions/roles'
import type { Person, MassRole } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MassRolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person | null) => void // null = remove assignment
  selectedPersonId?: string
  filterByRoleIds?: string[] // Filter people by these role IDs
  massId?: string // For checking existing assignments
  placeholder?: string
  emptyMessage?: string
  allowEmpty?: boolean // Allow role to be unfilled (default: true)
}

export function MassRolePicker({
  open,
  onOpenChange,
  onSelect,
  selectedPersonId,
  filterByRoleIds = [],
  massId,
  placeholder = 'Search for a person...',
  emptyMessage = 'No people found.',
  allowEmpty = true,
}: MassRolePickerProps) {
  const [people, setPeople] = useState<PersonWithGroupRoles[]>([])
  const [allRoles, setAllRoles] = useState<MassRole[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('')
  const PAGE_SIZE = 10

  // Load all roles for filter dropdown
  useEffect(() => {
    if (open) {
      loadRoles()
    }
  }, [open])

  // Load people when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadPeople(currentPage, searchQuery)
    }
  }, [open, currentPage, searchQuery])

  const loadRoles = async () => {
    try {
      const rolesData = await getMassRoles()
      setAllRoles(rolesData)
    } catch (error) {
      console.error('Error loading mass roles:', error)
      toast.error('Failed to load mass roles')
    }
  }

  const loadPeople = async (page: number, search: string) => {
    try {
      setLoading(true)
      const result = await getPeopleWithRolesPaginated({
        page,
        limit: PAGE_SIZE,
        search,
      })
      setPeople(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading people:', error)
      toast.error('Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  // Filter people by selected role (client-side filtering after fetch)
  const filteredPeople = useMemo(() => {
    if (!selectedRoleFilter) {
      return people
    }

    // Find the role name from the role ID
    const selectedRole = allRoles.find(r => r.id === selectedRoleFilter)
    if (!selectedRole) {
      return people
    }

    // Filter people who have this role in ANY of their group memberships
    return people.filter(person => {
      return person.group_members?.some(gm =>
        gm.roles?.includes(selectedRole.name)
      )
    })
  }, [people, selectedRoleFilter, allRoles])

  const getPersonDisplayName = (person: Person) => {
    return `${person.first_name} ${person.last_name}`.trim()
  }

  const getPersonInitials = (person: Person) => {
    const firstInitial = person.first_name?.[0] || ''
    const lastInitial = person.last_name?.[0] || ''
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  const handleClearFilter = () => {
    setSelectedRoleFilter('')
  }

  const handleSelect = (person: PersonWithGroupRoles) => {
    onSelect(person)
    onOpenChange(false)
  }

  const handleClear = () => {
    if (allowEmpty) {
      onSelect(null)
      onOpenChange(false)
    }
  }

  const renderPersonItem = (person: PersonWithGroupRoles) => {
    const isSelected = person.id === selectedPersonId

    // Get unique roles from all group memberships
    const personRoles = new Set<string>()
    person.group_members?.forEach(gm => {
      gm.roles?.forEach(role => personRoles.add(role))
    })

    return (
      <div
        key={person.id}
        onClick={() => handleSelect(person)}
        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent/50'
        }`}
      >
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="text-sm">
            {getPersonInitials(person)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{getPersonDisplayName(person)}</div>
          {person.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
          {person.phone_number && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{person.phone_number}</span>
            </div>
          )}
          {personRoles.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(personRoles).map(role => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <CorePicker<PersonWithGroupRoles>
      open={open}
      onOpenChange={onOpenChange}
      items={filteredPeople}
      selectedItem={people.find(p => p.id === selectedPersonId)}
      onSelect={handleSelect}
      title="Select Person for Role"
      searchPlaceholder={placeholder}
      searchFields={['first_name', 'last_name', 'email', 'phone_number']}
      getItemLabel={getPersonDisplayName}
      getItemId={(person) => person.id}
      renderItem={renderPersonItem}
      emptyMessage={emptyMessage}
      noResultsMessage="No people found matching your search and filters."
      isLoading={loading}
      enablePagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={setCurrentPage}
      onSearch={setSearchQuery}
    >
      {/* Custom filter controls */}
      <div className="space-y-3 p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by role..." />
            </SelectTrigger>
            <SelectContent>
              {allRoles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRoleFilter && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilter}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filter
            </Button>
          )}
        </div>
        {allowEmpty && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="w-full"
          >
            Clear Assignment
          </Button>
        )}
      </div>
    </CorePicker>
  )
}

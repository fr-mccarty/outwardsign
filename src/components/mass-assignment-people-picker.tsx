'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserPlus, CheckCircle2, Settings, Users2, AlertTriangle } from 'lucide-react'
import { getPeoplePaginated, createPerson, updatePerson } from '@/lib/actions/people'
import type { PaginatedResult } from '@/lib/actions/server-action-utils'
import { getFamilyMembershipsForPeople, getFamilyBlackoutDatesForPeople } from '@/lib/actions/families'
import {
  createMassRoleMember,
  deleteMassRoleMember,
  getMassRoleMembersByPerson,
  getMassRoleMembersWithDetails,
  type MassRoleMemberWithDetails
} from '@/lib/actions/mass-role-members'
import { getMassTimesWithItems } from '@/lib/actions/mass-times-templates'
import type { Person } from '@/lib/types'
import type { MassTimesTemplateWithItems } from '@/lib/actions/mass-times-templates'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'
import { SEX_VALUES, SEX_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatTime } from '@/lib/utils/formatters'

interface FamilyMembershipInfo {
  family_id: string
  family_name: string
  relationship: string | null
  is_primary_contact: boolean
  other_members: Array<{
    person_id: string
    full_name: string
    relationship: string | null
  }>
}

interface FamilyBlackoutInfo {
  person_id: string
  full_name: string
  relationship: string | null
  blackout_reason: string | null
}

interface PersonWithPreference extends Person {
  isPreferredTime: boolean
  isMassRoleMember: boolean
  families?: FamilyMembershipInfo[]
  familyBlackouts?: FamilyBlackoutInfo[]
}

interface MassAssignmentPeoplePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
  placeholder?: string
  emptyMessage?: string
  selectedPersonId?: string
  className?: string
  massRoleId: string // Required: The role we're assigning for
  massRoleName: string // Required: The role name (for UI display)
  massTimesTemplateItemId?: string // Optional: The specific mass time
  massDate?: string // Optional: The date of the mass (YYYY-MM-DD) for blackout checking
  allMassRoles?: Array<{ id: string; name: string }> // All mass roles in the system (for management)
}

// Default visible fields
const DEFAULT_VISIBLE_FIELDS = ['email', 'phone_number', 'sex', 'note']

export function MassAssignmentPeoplePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a person...',
  emptyMessage = 'No people found.',
  selectedPersonId,
  massRoleId,
  massRoleName,
  massTimesTemplateItemId,
  massDate,
  allMassRoles = [],
}: MassAssignmentPeoplePickerProps) {
  const [people, setPeople] = useState<PersonWithPreference[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [addingRoleForPersonId, setAddingRoleForPersonId] = useState<string | null>(null)

  // Settings dialog state
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [settingsPerson, setSettingsPerson] = useState<PersonWithPreference | null>(null)
  const [personRoleMemberships, setPersonRoleMemberships] = useState<MassRoleMemberWithDetails[]>([])
  const [allPersonRoleMemberships, setAllPersonRoleMemberships] = useState<Map<string, MassRoleMemberWithDetails[]>>(new Map())
  const [massTimesTemplates, setMassTimesTemplates] = useState<MassTimesTemplateWithItems[]>([])
  const [selectedMassTimeIds, setSelectedMassTimeIds] = useState<string[]>([])
  const [savingSettings, setSavingSettings] = useState(false)

  // Filter state
  const [showOnlyMembers, setShowOnlyMembers] = useState(false)
  const [showOnlyPreferredTime, setShowOnlyPreferredTime] = useState(false)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [showOnlyWithFamily, setShowOnlyWithFamily] = useState(false)

  // Family data - stored for potential future use (e.g., blackout date coordination)
  const [, setFamilyMemberships] = useState<Map<string, FamilyMembershipInfo[]>>(new Map())

  const PAGE_SIZE = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load people when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadPeople(currentPage, debouncedSearchQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentPage, debouncedSearchQuery]) // loadPeople is stable

  // Load mass times templates when settings dialog opens
  useEffect(() => {
    if (settingsDialogOpen) {
      loadMassTimesTemplates()
    }
  }, [settingsDialogOpen])

  const loadPeople = async (page: number, search: string) => {
    try {
      setLoading(true)

      // Get ALL people
      const offset = (page - 1) * PAGE_SIZE
      const result: PaginatedResult<Person> = await getPeoplePaginated({
        offset,
        limit: PAGE_SIZE,
        search,
      })

      // Get people who ARE members of this mass role
      const membersResult: PaginatedResult<Person> = await getPeoplePaginated({
        offset: 0,
        limit: 1000,
        massRoleId: massRoleId,
      })
      const memberIds = new Set(membersResult.items.map(p => p.id))

      // Get ALL mass role memberships for all people
      const allMemberships = await getMassRoleMembersWithDetails()

      // Group memberships by person ID
      const membershipsByPerson = new Map<string, MassRoleMemberWithDetails[]>()
      allMemberships.forEach(membership => {
        const existing = membershipsByPerson.get(membership.person_id) || []
        membershipsByPerson.set(membership.person_id, [...existing, membership])
      })
      setAllPersonRoleMemberships(membershipsByPerson)

      // Get family memberships for all people
      const personIds = result.items.map(p => p.id)
      let familyMap = new Map<string, FamilyMembershipInfo[]>()
      let familyBlackoutMap = new Map<string, FamilyBlackoutInfo[]>()
      try {
        familyMap = await getFamilyMembershipsForPeople(personIds)
        setFamilyMemberships(familyMap)

        // If we have a mass date, fetch family blackout info
        if (massDate) {
          familyBlackoutMap = await getFamilyBlackoutDatesForPeople(personIds, massDate)
        }
      } catch (error) {
        console.error('Error loading family memberships:', error)
      }

      // Enrich people with preference, membership, and family info
      const enrichedPeople: PersonWithPreference[] = result.items.map(person => {
        const isPreferredTime = massTimesTemplateItemId
          ? person.mass_times_template_item_ids?.includes(massTimesTemplateItemId) ?? false
          : false

        const isMassRoleMember = memberIds.has(person.id)
        const families = familyMap.get(person.id) || []
        const familyBlackouts = familyBlackoutMap.get(person.id) || []

        return {
          ...person,
          isPreferredTime,
          isMassRoleMember,
          families,
          familyBlackouts,
        }
      })

      // Sort by: Members first, then preferred time, then alphabetically
      enrichedPeople.sort((a, b) => {
        if (a.isMassRoleMember && !b.isMassRoleMember) return -1
        if (!a.isMassRoleMember && b.isMassRoleMember) return 1
        if (a.isPreferredTime && !b.isPreferredTime) return -1
        if (!a.isPreferredTime && b.isPreferredTime) return 1
        const aName = `${a.first_name} ${a.last_name}`.toLowerCase()
        const bName = `${b.first_name} ${b.last_name}`.toLowerCase()
        return aName.localeCompare(bName)
      })

      setPeople(enrichedPeople)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading people:', error)
      toast.error('Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  const loadMassTimesTemplates = async () => {
    try {
      const templates = await getMassTimesWithItems()
      setMassTimesTemplates(templates)
    } catch (error) {
      console.error('Error loading mass times templates:', error)
      toast.error('Failed to load mass times')
    }
  }

  const getPersonDisplayName = (person: Person) => {
    return `${person.first_name} ${person.last_name}`.trim()
  }

  const getPersonInitials = (person: Person) => {
    const firstName = person.first_name?.charAt(0) || ''
    const lastName = person.last_name?.charAt(0) || ''
    return (firstName + lastName).toUpperCase()
  }

  const selectedPerson = selectedPersonId
    ? people.find((p) => p.id === selectedPersonId)
    : null

  // Apply filters
  const filteredPeople = useMemo(() => {
    let filtered = [...people]

    if (showOnlyMembers) {
      filtered = filtered.filter(p => p.isMassRoleMember)
    }

    if (showOnlyPreferredTime) {
      filtered = filtered.filter(p => p.isPreferredTime)
    }

    if (showOnlyAvailable) {
      filtered = filtered.filter(p => p.isMassRoleMember || p.isPreferredTime)
    }

    if (showOnlyWithFamily) {
      filtered = filtered.filter(p => p.families && p.families.length > 0)
    }

    return filtered
  }, [people, showOnlyMembers, showOnlyPreferredTime, showOnlyAvailable, showOnlyWithFamily])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setCurrentPage(1)
  }

  // Handle adding person to mass role on the fly
  const handleAddToRole = async (personId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      setAddingRoleForPersonId(personId)

      await createMassRoleMember({
        person_id: personId,
        mass_role_id: massRoleId,
        membership_type: 'MEMBER',
        active: true,
      })

      // Update people list
      setPeople(prev => prev.map(p =>
        p.id === personId ? { ...p, isMassRoleMember: true } : p
      ))

      // Reload all memberships to update badges
      const allMemberships = await getMassRoleMembersWithDetails()
      const membershipsByPerson = new Map<string, MassRoleMemberWithDetails[]>()
      allMemberships.forEach(membership => {
        const existing = membershipsByPerson.get(membership.person_id) || []
        membershipsByPerson.set(membership.person_id, [...existing, membership])
      })
      setAllPersonRoleMemberships(membershipsByPerson)

      toast.success(`Added to ${massRoleName}`)
    } catch (error) {
      console.error('Error adding person to role:', error)
      toast.error('Failed to add person to role')
    } finally {
      setAddingRoleForPersonId(null)
    }
  }

  // Handle opening settings dialog for a person
  const handleOpenSettings = async (person: PersonWithPreference, e: React.MouseEvent) => {
    e.stopPropagation()

    setSettingsPerson(person)
    setSelectedMassTimeIds(person.mass_times_template_item_ids || [])

    // Load their role memberships
    try {
      const memberships = await getMassRoleMembersByPerson(person.id)
      setPersonRoleMemberships(memberships)
    } catch (error) {
      console.error('Error loading role memberships:', error)
      setPersonRoleMemberships([])
    }

    setSettingsDialogOpen(true)
  }

  // Handle toggling mass time preference
  const handleToggleMassTime = (itemId: string) => {
    setSelectedMassTimeIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Handle toggling role membership
  const handleToggleRole = async (roleId: string, checked: boolean) => {
    if (!settingsPerson) return

    try {
      if (checked) {
        // Add to role
        await createMassRoleMember({
          person_id: settingsPerson.id,
          mass_role_id: roleId,
          membership_type: 'MEMBER',
          active: true,
        })

        const memberships = await getMassRoleMembersByPerson(settingsPerson.id)
        setPersonRoleMemberships(memberships)

        toast.success('Added to role')
      } else {
        // Remove from role
        const membership = personRoleMemberships.find(m => m.mass_role_id === roleId)
        if (membership) {
          await deleteMassRoleMember(membership.id)

          const memberships = await getMassRoleMembersByPerson(settingsPerson.id)
          setPersonRoleMemberships(memberships)

          toast.success('Removed from role')
        }
      }
    } catch (error) {
      console.error('Error updating role membership:', error)
      toast.error('Failed to update role membership')
    }
  }

  // Save settings (mass time preferences)
  const handleSaveSettings = async () => {
    if (!settingsPerson) return

    try {
      setSavingSettings(true)

      await updatePerson(settingsPerson.id, {
        mass_times_template_item_ids: selectedMassTimeIds,
      })

      // Update local state
      setPeople(prev => prev.map(p =>
        p.id === settingsPerson.id
          ? {
              ...p,
              mass_times_template_item_ids: selectedMassTimeIds,
              isPreferredTime: massTimesTemplateItemId
                ? selectedMassTimeIds.includes(massTimesTemplateItemId)
                : false,
            }
          : p
      ))

      toast.success('Settings saved')
      setSettingsDialogOpen(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  // Memoize helper functions
  const isFieldVisible = useCallback(
    (fieldName: string) => checkFieldVisible(fieldName, undefined, DEFAULT_VISIBLE_FIELDS),
    []
  )
  const isFieldRequired = useCallback(
    (fieldName: string) => checkFieldRequired(fieldName, undefined),
    []
  )

  // Build create fields configuration
  const createFields: PickerFieldConfig[] = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      {
        key: 'first_name',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'John',
        validation: z.string().min(1, 'First name is required'),
      },
      {
        key: 'last_name',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Doe',
        validation: z.string().min(1, 'Last name is required'),
      },
    ]

    if (isFieldVisible('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: isFieldRequired('email'),
        placeholder: 'john.doe@example.com',
      })
    }

    if (isFieldVisible('phone_number')) {
      fields.push({
        key: 'phone_number',
        label: 'Phone',
        type: 'tel',
        required: isFieldRequired('phone_number'),
        placeholder: '(555) 123-4567',
      })
    }

    if (isFieldVisible('sex')) {
      fields.push({
        key: 'sex',
        label: 'Sex',
        type: 'select',
        required: isFieldRequired('sex'),
        options: SEX_VALUES.map(value => ({
          value,
          label: SEX_LABELS[value].en
        })),
      })
    }

    if (isFieldVisible('note')) {
      fields.push({
        key: 'note',
        label: 'Note',
        type: 'textarea',
        required: isFieldRequired('note'),
        placeholder: 'Add any notes about this person...',
      })
    }

    return fields
  }, [isFieldVisible, isFieldRequired])

  // Handle creating a new person
  const handleCreatePerson = async (data: any): Promise<PersonWithPreference> => {
    const newPerson = await createPerson({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone_number: data.phone_number || undefined,
      sex: data.sex || undefined,
      note: data.note || undefined,
    })

    // Reload people list to include new person
    await loadPeople(currentPage, debouncedSearchQuery)

    // Return with preference flags
    return {
      ...newPerson,
      isPreferredTime: false,
      isMassRoleMember: false,
    }
  }

  // Handle updating an existing person
  const handleUpdatePerson = async (id: string, data: any): Promise<PersonWithPreference> => {
    const updatedPerson = await updatePerson(id, {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone_number: data.phone_number || undefined,
      sex: data.sex || undefined,
      note: data.note || undefined,
    })

    // Find the person in the list to preserve preference flags
    const existingPerson = people.find(p => p.id === id)

    // Update local list
    setPeople((prev) =>
      prev.map(p => p.id === updatedPerson.id ? { ...p, ...updatedPerson } : p)
    )

    return {
      ...updatedPerson,
      isPreferredTime: existingPerson?.isPreferredTime ?? false,
      isMassRoleMember: existingPerson?.isMassRoleMember ?? false,
    }
  }

  // Custom render for person list items
  const renderPersonItem = (person: PersonWithPreference) => {
    const isSelected = selectedPersonId === person.id
    const isAdding = addingRoleForPersonId === person.id

    // Get this person's mass role memberships
    const personMemberships = allPersonRoleMemberships.get(person.id) || []

    // Get family info
    const personFamilies = person.families || []
    const hasFamily = personFamilies.length > 0

    // Get family blackout info
    const familyBlackouts = person.familyBlackouts || []
    const hasFamilyBlackout = familyBlackouts.length > 0

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getPersonInitials(person)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{getPersonDisplayName(person)}</span>

            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}

            {person.isMassRoleMember && (
              <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Member
              </Badge>
            )}

            {person.isPreferredTime && (
              <Badge variant="outline" className="text-xs border-blue-500 text-blue-700 dark:text-blue-400">
                Preferred Time
              </Badge>
            )}

            {hasFamily && (
              <Badge variant="outline" className="text-xs border-purple-500 text-purple-700 dark:text-purple-400">
                <Users2 className="h-3 w-3 mr-1" />
                {personFamilies[0].family_name}
              </Badge>
            )}

            {hasFamilyBlackout && (
              <Badge variant="outline" className="text-xs border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Family Unavailable
              </Badge>
            )}
          </div>

          {/* Show mass role badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {personMemberships.map(membership => (
              <Badge
                key={membership.id}
                variant="outline"
                className="text-xs"
              >
                {membership.mass_role.name}
              </Badge>
            ))}
          </div>

          {/* Show family members */}
          {hasFamily && personFamilies[0].other_members.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-purple-600 dark:text-purple-400">Family:</span>{' '}
              {personFamilies[0].other_members.slice(0, 3).map((m, i) => (
                <span key={m.person_id}>
                  {i > 0 && ', '}
                  {m.full_name}
                  {m.relationship && ` (${m.relationship})`}
                </span>
              ))}
              {personFamilies[0].other_members.length > 3 && (
                <span> +{personFamilies[0].other_members.length - 3} more</span>
              )}
            </div>
          )}

          {/* Show family blackout warning details */}
          {hasFamilyBlackout && (
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              <span className="font-medium">Unavailable:</span>{' '}
              {familyBlackouts.slice(0, 2).map((b, i) => (
                <span key={b.person_id}>
                  {i > 0 && ', '}
                  {b.full_name}
                  {b.blackout_reason && ` (${b.blackout_reason})`}
                </span>
              ))}
              {familyBlackouts.length > 2 && (
                <span> +{familyBlackouts.length - 2} more</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!person.isMassRoleMember && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAddToRole(person.id, e)}
              disabled={isAdding}
              className="h-8 text-xs whitespace-nowrap"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              {isAdding ? 'Adding...' : `Add to ${massRoleName}`}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleOpenSettings(person, e)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <CorePicker<PersonWithPreference>
        open={open}
        onOpenChange={onOpenChange}
        items={filteredPeople}
        selectedItem={selectedPerson}
        onSelect={onSelect}
        title={`Assign Person to ${massRoleName}`}
        entityName="person"
        searchPlaceholder={placeholder}
        searchFields={['first_name', 'last_name', 'email', 'phone_number']}
        getItemLabel={(person) => getPersonDisplayName(person)}
        getItemId={(person) => person.id}
        renderItem={renderPersonItem}
        enableCreate={true}
        createFields={createFields}
        onCreateSubmit={handleCreatePerson}
        createButtonLabel="Save Person"
        addNewButtonLabel="Add New Person"
        emptyMessage={emptyMessage}
        noResultsMessage="No people match your search"
        isLoading={loading}
        enablePagination={true}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearchChange}
        onUpdateSubmit={handleUpdatePerson}
        updateButtonLabel="Update Person"
      >
        {/* Filter badges */}
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          <Badge
            variant={showOnlyMembers ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              showOnlyMembers
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-accent"
            )}
            onClick={() => setShowOnlyMembers(!showOnlyMembers)}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Role Members Only
          </Badge>

          <Badge
            variant={showOnlyPreferredTime ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              showOnlyPreferredTime
                ? "bg-blue-600 hover:bg-blue-700"
                : "hover:bg-accent"
            )}
            onClick={() => setShowOnlyPreferredTime(!showOnlyPreferredTime)}
          >
            Preferred Time Only
          </Badge>

          <Badge
            variant={showOnlyAvailable ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              showOnlyAvailable && "hover:bg-primary/90"
            )}
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
          >
            Available Only
          </Badge>

          <Badge
            variant={showOnlyWithFamily ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              showOnlyWithFamily
                ? "bg-purple-600 hover:bg-purple-700"
                : "hover:bg-accent"
            )}
            onClick={() => setShowOnlyWithFamily(!showOnlyWithFamily)}
          >
            <Users2 className="h-3 w-3 mr-1" />
            Has Family
          </Badge>
        </div>
      </CorePicker>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Manage {settingsPerson ? getPersonDisplayName(settingsPerson) : 'Person'}
            </DialogTitle>
            <DialogDescription>
              Configure mass role memberships and preferred mass times
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(80vh-180px)] pr-4">
            <div className="space-y-6 py-4">
              {/* Mass Role Memberships */}
              <div>
                <h3 className="font-medium mb-3">Mass Role Memberships</h3>
                <div className="space-y-2">
                  {allMassRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No mass roles available
                    </p>
                  ) : (
                    allMassRoles.map(role => {
                      const isRoleMember = personRoleMemberships.some(m => m.mass_role_id === role.id)

                      return (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={isRoleMember}
                            onCheckedChange={(checked) => handleToggleRole(role.id, checked as boolean)}
                          />
                          <Label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {role.name}
                          </Label>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <Separator />

              {/* Preferred Mass Times */}
              <div>
                <h3 className="font-medium mb-3">Preferred Mass Times</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select which Mass times this person prefers to serve at. They will only be
                  automatically assigned to their preferred times.
                </p>

                {massTimesTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No mass times available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {massTimesTemplates.map(template => (
                      <div key={template.id}>
                        <h4 className="text-sm font-medium mb-2">{template.name}</h4>
                        <div className="space-y-2 pl-4">
                          {template.items?.map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mass-time-${item.id}`}
                                checked={selectedMassTimeIds.includes(item.id)}
                                onCheckedChange={() => handleToggleMassTime(item.id)}
                              />
                              <Label
                                htmlFor={`mass-time-${item.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {formatTime(item.time)}
                                {item.day_type === 'DAY_BEFORE' && ' (Vigil)'}
                              </Label>
                            </div>
                          )) || (
                            <p className="text-sm text-muted-foreground">
                              No times configured
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

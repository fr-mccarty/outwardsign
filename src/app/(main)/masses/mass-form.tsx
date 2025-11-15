"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createMass, updateMass, type CreateMassData, type MassWithRelations, getMassRoles, createMassRole, deleteMassRole, type MassRoleWithRelations } from "@/lib/actions/masses"
import { getRoles } from "@/lib/actions/roles"
import type { Person, Event, Role } from "@/lib/types"
import type { GlobalLiturgicalEvent } from "@/lib/actions/global-liturgical-events"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { LiturgicalEventPickerField } from "@/components/liturgical-event-picker-field"
import { MASS_STATUS_VALUES, MASS_STATUS_LABELS, MASS_TEMPLATE_VALUES, MASS_TEMPLATE_LABELS, MASS_DEFAULT_TEMPLATE } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { usePickerState } from "@/hooks/use-picker-state"
import { MassRolePicker } from "@/components/mass-role-picker"
import { Plus, X } from "lucide-react"

// Zod validation schema
const massSchema = z.object({
  status: z.string().optional(),
  event_id: z.string().optional(),
  presider_id: z.string().optional(),
  homilist_id: z.string().optional(),
  liturgical_event_id: z.string().optional(),
  pre_mass_announcement_id: z.string().optional(),
  pre_mass_announcement_topic: z.string().optional(),
  petitions: z.string().optional(),
  announcements: z.string().optional(),
  note: z.string().optional(),
  mass_template_id: z.string().optional()
})

interface MassFormProps {
  mass?: MassWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassForm({ mass, formId, onLoadingChange }: MassFormProps) {
  const router = useRouter()
  const isEditing = !!mass
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(mass?.status || "PLANNING")
  const [note, setNote] = useState(mass?.note || "")
  const [announcements, setAnnouncements] = useState(mass?.announcements || "")
  const [petitions, setPetitions] = useState(mass?.petitions || "")
  const [massTemplateId, setMassTemplateId] = useState(mass?.mass_template_id || MASS_DEFAULT_TEMPLATE)
  const [preMassAnnouncementTopic, setPreMassAnnouncementTopic] = useState(mass?.pre_mass_announcement_topic || "")

  // Picker states using usePickerState hook
  const event = usePickerState<Event>()
  const presider = usePickerState<Person>()
  const homilist = usePickerState<Person>()
  const preMassAnnouncementPerson = usePickerState<Person>()
  const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

  // Mass role assignments state
  const [massRoles, setMassRoles] = useState<MassRoleWithRelations[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [rolePickerOpen, setRolePickerOpen] = useState(false)
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Initialize form with mass data when editing
  useEffect(() => {
    if (mass) {
      // Set event
      if (mass.event) event.setValue(mass.event)

      // Set people
      if (mass.presider) presider.setValue(mass.presider)
      if (mass.homilist) homilist.setValue(mass.homilist)
      if (mass.pre_mass_announcement_person) preMassAnnouncementPerson.setValue(mass.pre_mass_announcement_person)

      // Set liturgical event
      if (mass.liturgical_event) liturgicalEvent.setValue(mass.liturgical_event)

      // Set mass roles if available
      if (mass.mass_roles) {
        setMassRoles(mass.mass_roles)
      }
    }
  }, [mass])

  // Load all roles for the role assignment section
  useEffect(() => {
    loadAllRoles()
  }, [])

  // Load mass roles when editing an existing mass
  useEffect(() => {
    if (isEditing && mass?.id) {
      loadMassRoles()
    }
  }, [isEditing, mass?.id])

  const loadAllRoles = async () => {
    try {
      const rolesData = await getRoles()
      setAllRoles(rolesData)
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('Failed to load roles')
    }
  }

  const loadMassRoles = async () => {
    if (!mass?.id) return
    try {
      setLoadingRoles(true)
      const roles = await getMassRoles(mass.id)
      setMassRoles(roles)
    } catch (error) {
      console.error('Error loading mass roles:', error)
      toast.error('Failed to load role assignments')
    } finally {
      setLoadingRoles(false)
    }
  }

  // Petition templates (simple default for now)
  const petitionTemplates: PetitionTemplate[] = [
    {
      id: 'mass-sunday-english',
      name: 'Sunday Mass (English)',
      description: 'Standard Sunday Mass petitions in English',
    },
    {
      id: 'mass-weekday-english',
      name: 'Weekday Mass (English)',
      description: 'Standard weekday Mass petitions in English',
    },
  ]

  const handleInsertTemplate = (templateId: string): string[] => {
    // Simple template system - can be expanded later
    if (templateId === 'mass-sunday-english') {
      return [
        'For our Holy Father, Pope Francis, our Bishop, and all the clergy.',
        'For our nation\'s leaders and all who serve in public office.',
        'For peace in our world and protection of the innocent.',
        'For the unemployed and those struggling with financial hardship.',
        'For the sick and those who minister to them.',
        'For our young people and all who guide them.',
        'For our deceased parishioners and all who have gone before us.',
        'For our parish community and all our special intentions.',
      ]
    } else if (templateId === 'mass-weekday-english') {
      return [
        'For our Holy Father, Pope Francis, our Bishop, and all the clergy.',
        'For peace in our world and an end to all violence and hatred.',
        'For the sick, the suffering, and those who care for them.',
        'For our deceased brothers and sisters, especially those who have recently died.',
        'For our community and all our intentions.',
      ]
    }
    return []
  }

  // Mass role assignment handlers
  const handleOpenRolePicker = (roleId: string) => {
    setCurrentRoleId(roleId)
    setRolePickerOpen(true)
  }

  const handleSelectPersonForRole = async (person: Person | null) => {
    if (!isEditing || !mass?.id || !currentRoleId) {
      toast.error('Please save the mass before assigning roles')
      return
    }

    try {
      if (person) {
        // Assign person to role
        const newMassRole = await createMassRole({
          mass_id: mass.id,
          person_id: person.id,
          role_id: currentRoleId,
          status: 'ASSIGNED'
        })

        // Reload mass roles to get the updated list with relations
        await loadMassRoles()
        toast.success('Role assignment added')
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Failed to assign role')
    }
  }

  const handleRemoveRoleAssignment = async (massRoleId: string) => {
    if (!isEditing || !mass?.id) return

    try {
      await deleteMassRole(massRoleId)
      await loadMassRoles()
      toast.success('Role assignment removed')
    } catch (error) {
      console.error('Error removing role assignment:', error)
      toast.error('Failed to remove role assignment')
    }
  }

  // Get role assignments for a specific role
  const getRoleAssignments = (roleId: string) => {
    return massRoles.filter(mr => mr.role_id === roleId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const massData = massSchema.parse({
        status: status || undefined,
        event_id: event.value?.id,
        presider_id: presider.value?.id,
        homilist_id: homilist.value?.id,
        liturgical_event_id: liturgicalEvent.value?.id,
        pre_mass_announcement_id: preMassAnnouncementPerson.value?.id,
        pre_mass_announcement_topic: preMassAnnouncementTopic || undefined,
        petitions: petitions || undefined,
        announcements: announcements || undefined,
        note: note || undefined,
        mass_template_id: massTemplateId || undefined,
      })

      if (isEditing) {
        await updateMass(mass.id, massData)
        toast.success('Mass updated successfully')
        router.push(`/masses/${mass.id}`)
      } else {
        const newMass = await createMass(massData)
        toast.success('Mass created successfully')
        router.push(`/masses/${newMass.id}`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error('Error saving mass:', error)
        toast.error(isEditing ? 'Failed to update mass' : 'Failed to create mass')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Core details for this Mass celebration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EventPickerField
            label="Mass Event"
            description="Date, time, and location of the Mass"
            value={event.value}
            onValueChange={event.setValue}
            showPicker={event.showPicker}
            onShowPickerChange={event.setShowPicker}
            defaultEventType="MASS"
            defaultName="Holy Mass"
            openToNewEvent={!event.value}
          />

          <FormField
            id="status"
            inputType="select"
            label="Status"
            description="Current status of this Mass"
            value={status}
            onChange={setStatus}
            options={MASS_STATUS_VALUES.map((value) => ({
              value,
              label: MASS_STATUS_LABELS[value].en
            }))}
          />

          <LiturgicalEventPickerField
            label="Liturgical Event"
            description="Link this Mass to a liturgical event (feast day, solemnity, etc.)"
            value={liturgicalEvent.value}
            onValueChange={liturgicalEvent.setValue}
            showPicker={liturgicalEvent.showPicker}
            onShowPickerChange={liturgicalEvent.setShowPicker}
          />

          <FormField
            id="template"
            inputType="select"
            label="Template"
            description="Choose the liturgy template for this Mass"
            value={massTemplateId}
            onChange={setMassTemplateId}
            options={MASS_TEMPLATE_VALUES.map((value) => ({
              value,
              label: MASS_TEMPLATE_LABELS[value].en
            }))}
          />
        </CardContent>
      </Card>

      {/* Ministers and Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Ministers</CardTitle>
          <CardDescription>
            People serving in liturgical roles for this Mass
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Presider"
            description="Priest or deacon presiding at this Mass"
            value={presider.value}
            onValueChange={presider.setValue}
            showPicker={presider.showPicker}
            onShowPickerChange={presider.setShowPicker}
            openToNewPerson={!presider.value}
          />

          <PersonPickerField
            label="Homilist"
            description="Person giving the homily (if different from presider)"
            value={homilist.value}
            onValueChange={homilist.setValue}
            showPicker={homilist.showPicker}
            onShowPickerChange={homilist.setShowPicker}
            openToNewPerson={!homilist.value}
          />
        </CardContent>
      </Card>

      {/* Role Assignments */}
      {isEditing && mass?.id && (
        <Card>
          <CardHeader>
            <CardTitle>Role Assignments</CardTitle>
            <CardDescription>
              Assign people to liturgical roles for this Mass
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allRoles.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                No roles defined. Please create roles in the Roles section first.
              </div>
            ) : (
              <div className="space-y-6">
                {allRoles.map(role => {
                  const assignments = getRoleAssignments(role.id)
                  return (
                    <div key={role.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          {role.description && (
                            <div className="text-sm text-muted-foreground">
                              {role.description}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRolePicker(role.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign Person
                        </Button>
                      </div>

                      {/* List of assigned people for this role */}
                      {assignments.length > 0 && (
                        <div className="space-y-2 ml-4 mt-2">
                          {assignments.map(assignment => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-2 bg-accent/50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {assignment.person?.first_name} {assignment.person?.last_name}
                                </span>
                                {assignment.status && assignment.status !== 'ASSIGNED' && (
                                  <Badge variant="secondary" className="text-xs">
                                    {assignment.status}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveRoleAssignment(assignment.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {assignments.length === 0 && (
                        <div className="text-sm text-muted-foreground ml-4">
                          No one assigned yet
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mass Role Picker Modal */}
      {currentRoleId && (
        <MassRolePicker
          open={rolePickerOpen}
          onOpenChange={setRolePickerOpen}
          onSelect={handleSelectPersonForRole}
          massId={mass?.id}
          allowEmpty={false}
        />
      )}

      {/* Pre-Mass Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Mass Announcements</CardTitle>
          <CardDescription>
            Person and topic for announcements made before Mass begins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Announcer"
            description="Person making pre-Mass announcements"
            value={preMassAnnouncementPerson.value}
            onValueChange={preMassAnnouncementPerson.setValue}
            showPicker={preMassAnnouncementPerson.showPicker}
            onShowPickerChange={preMassAnnouncementPerson.setShowPicker}
            openToNewPerson={!preMassAnnouncementPerson.value}
          />

          <FormField
            id="pre_mass_announcement_topic"
            label="Announcement Topic"
            description="Brief topic or title for pre-Mass announcements"
            value={preMassAnnouncementTopic}
            onChange={setPreMassAnnouncementTopic}
            placeholder="Parish events, thank you notes, etc."
          />
        </CardContent>
      </Card>

      {/* Petitions */}
      <Card>
        <CardHeader>
          <CardTitle>Petitions</CardTitle>
          <CardDescription>
            Universal Prayer (Prayer of the Faithful)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PetitionEditor
            value={petitions}
            onChange={setPetitions}
            templates={petitionTemplates}
            onInsertTemplate={handleInsertTemplate}
          />
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Full text of announcements to be read before Mass
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            id="announcements"
            label="Announcement Text"
            inputType="textarea"
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter announcements here..."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Internal notes and reminders (not included in printed liturgy)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            id="note"
            label="Notes"
            inputType="textarea"
            value={note}
            onChange={setNote}
            placeholder="Add any internal notes or reminders..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/masses/${mass.id}` : '/masses'}
        saveLabel={isEditing ? "Save Mass" : "Create Mass"}
      />
    </form>
  )
}

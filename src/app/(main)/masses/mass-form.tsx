"use client"

import { useState, useEffect, useRef } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { FormSectionCard } from "@/components/form-section-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createMass, updateMass, type MassWithRelations, getMassRoles, createMassRole, deleteMassRole, type MassRoleInstanceWithRelations, linkMassIntention, unlinkMassIntention } from "@/lib/actions/masses"
import { getMassRoleTemplates, type MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { getTemplateItems, type MassRoleTemplateItemWithRole } from "@/lib/actions/mass-role-template-items"
import type { Person, Event } from "@/lib/types"
import type { GlobalLiturgicalEvent } from "@/lib/actions/global-liturgical-events"
import type { MassIntentionWithNames } from "@/lib/actions/mass-intentions"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { LiturgicalEventPickerField } from "@/components/liturgical-event-picker-field"
import { MASS_STATUS_VALUES, MASS_STATUS_LABELS, MASS_TEMPLATE_VALUES, MASS_TEMPLATE_LABELS, MASS_DEFAULT_TEMPLATE, MASS_INTENTION_STATUS_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { usePickerState } from "@/hooks/use-picker-state"
import { PeoplePicker } from "@/components/people-picker"
import { MassIntentionPicker } from "@/components/mass-intention-picker"
import { RoleFulfillmentBadge } from "@/components/role-fulfillment-badge"
import { Plus, X, Heart } from "lucide-react"

// Zod validation schema
const massSchema = z.object({
  status: z.string().optional(),
  event_id: z.string().optional(),
  presider_id: z.string().optional(),
  homilist_id: z.string().optional(),
  liturgical_event_id: z.string().optional(),
  mass_roles_template_id: z.string().optional(),
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
  const [status, setStatus] = useState(mass?.status || "ACTIVE")
  const [note, setNote] = useState(mass?.note || "")
  const [announcements, setAnnouncements] = useState(mass?.announcements || "")
  const [petitions, setPetitions] = useState(mass?.petitions || "")
  const [massTemplateId, setMassTemplateId] = useState(mass?.mass_template_id || MASS_DEFAULT_TEMPLATE)

  // Picker states using usePickerState hook
  const event = usePickerState<Event>()
  const presider = usePickerState<Person>()
  const homilist = usePickerState<Person>()
  const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

  // Mass role assignments state
  const [massRoles, setMassRoles] = useState<MassRoleInstanceWithRelations[]>([])
  const [rolePickerOpen, setRolePickerOpen] = useState(false)
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null)

  // Mass intention state
  const [massIntention, setMassIntention] = useState<MassIntentionWithNames | null>(null)
  const [massIntentionPickerOpen, setMassIntentionPickerOpen] = useState(false)

  // Mass role template state
  const [massRolesTemplateId, setMassRolesTemplateId] = useState<string>(mass?.mass_roles_template_id || "")
  const [allTemplates, setAllTemplates] = useState<MassRoleTemplate[]>([])
  const [templateItems, setTemplateItems] = useState<MassRoleTemplateItemWithRole[]>([])

  // Track if we've initialized to prevent infinite loops
  const initializedRef = useRef(false)
  const initializedMassIdRef = useRef<string | null>(null)

  // Initialize form with mass data when editing
  useEffect(() => {
    if (mass && mass.id !== initializedMassIdRef.current) {
      initializedMassIdRef.current = mass.id

      // Set event
      if (mass.event) event.setValue(mass.event)

      // Set people
      if (mass.presider) presider.setValue(mass.presider)
      if (mass.homilist) homilist.setValue(mass.homilist)

      // Set liturgical event
      if (mass.liturgical_event) liturgicalEvent.setValue(mass.liturgical_event)

      // Set mass roles if available
      if (mass.mass_roles) {
        setMassRoles(mass.mass_roles)
      }

      // Set mass intention if available
      if (mass.mass_intention) {
        setMassIntention(mass.mass_intention)
      }

      initializedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mass?.id]) // Only re-run when mass ID changes

  // Load all templates when the form mounts
  useEffect(() => {
    loadAllTemplates()
  }, [])

  // Load template items when template is selected
  useEffect(() => {
    if (massRolesTemplateId) {
      loadTemplateItems(massRolesTemplateId)
    } else {
      setTemplateItems([])
    }
  }, [massRolesTemplateId])

  // Load mass roles when editing an existing mass
  useEffect(() => {
    if (isEditing && mass?.id) {
      loadMassRoles()
    }
  }, [isEditing, mass?.id])

  const loadMassRoles = async () => {
    if (!mass?.id) return
    try {
      const massRoleInstances = await getMassRoles(mass.id)
      setMassRoles(massRoleInstances)
    } catch (error) {
      console.error('Error loading mass roles:', error)
      toast.error('Failed to load mass role assignments')
    }
  }

  const loadAllTemplates = async () => {
    try {
      const templatesData = await getMassRoleTemplates()
      setAllTemplates(templatesData)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load role templates')
    }
  }

  const loadTemplateItems = async (templateId: string) => {
    if (!templateId) {
      setTemplateItems([])
      return
    }
    try {
      const items = await getTemplateItems(templateId)
      setTemplateItems(items)
    } catch (error) {
      console.error('Error loading template items:', error)
      toast.error('Failed to load template items')
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

  // Handle template change - clear existing role assignments if editing
  const handleTemplateChange = async (newTemplateId: string) => {
    setMassRolesTemplateId(newTemplateId)

    // If editing an existing mass, clear all existing mass role assignments
    if (isEditing && mass?.id && massRoles.length > 0) {
      try {
        // Delete all existing mass role assignments
        await Promise.all(massRoles.map(mr => deleteMassRole(mr.id)))
        // Reload mass roles to show empty list
        await loadMassRoles()
        toast.success('Mass role assignments cleared for new template')
      } catch (error) {
        console.error('Error clearing mass role assignments:', error)
        toast.error('Failed to clear existing mass role assignments')
      }
    }
  }

  // Mass role assignment handlers
  const handleOpenRolePicker = (roleId: string) => {
    setCurrentRoleId(roleId)
    setRolePickerOpen(true)
  }

  const handleSelectPersonForRole = async (person: Person) => {
    if (!isEditing || !mass?.id || !currentRoleId) {
      toast.error('Please save the mass before assigning mass roles')
      return
    }

    try {
      // Assign person to mass role
      await createMassRole({
        mass_id: mass.id,
        person_id: person.id,
        mass_roles_template_item_id: currentRoleId
      })

      // Reload mass roles to get the updated list with relations
      await loadMassRoles()
      toast.success('Mass role assignment added')
    } catch (error) {
      console.error('Error assigning mass role:', error)
      toast.error('Failed to assign mass role')
    }
  }

  const handleRemoveRoleAssignment = async (massRoleId: string) => {
    if (!isEditing || !mass?.id) return

    try {
      await deleteMassRole(massRoleId)
      await loadMassRoles()
      toast.success('Mass role assignment removed')
    } catch (error) {
      console.error('Error removing mass role assignment:', error)
      toast.error('Failed to remove mass role assignment')
    }
  }

  // Mass intention handlers
  const handleSelectMassIntention = async (intention: MassIntentionWithNames) => {
    if (!isEditing || !mass?.id) {
      toast.error('Please save the mass before linking a mass intention')
      return
    }

    try {
      await linkMassIntention(mass.id, intention.id)
      setMassIntention(intention)
      setMassIntentionPickerOpen(false)
      toast.success('Mass intention linked')
    } catch (error) {
      console.error('Error linking mass intention:', error)
      toast.error('Failed to link mass intention')
    }
  }

  const handleUnlinkMassIntention = async () => {
    if (!massIntention) return

    try {
      await unlinkMassIntention(massIntention.id)
      setMassIntention(null)
      toast.success('Mass intention unlinked')
    } catch (error) {
      console.error('Error unlinking mass intention:', error)
      toast.error('Failed to unlink mass intention')
    }
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
        mass_roles_template_id: massRolesTemplateId || undefined,
        petitions: petitions || undefined,
        announcements: announcements || undefined,
        note: note || undefined,
        mass_template_id: massTemplateId || undefined,
      })

      if (isEditing) {
        await updateMass(mass.id, massData)
        toast.success('Mass updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newMass = await createMass(massData)
        toast.success('Mass created successfully')
        router.push(`/masses/${newMass.id}/edit`)
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
      <FormSectionCard
        title="Basic Information"
        description="Core details for this Mass celebration"
      >
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
            label="Print Template"
            description="Choose the liturgy template for this Mass"
            value={massTemplateId}
            onChange={setMassTemplateId}
            options={MASS_TEMPLATE_VALUES.map((value) => ({
              value,
              label: MASS_TEMPLATE_LABELS[value].en
            }))}
          />
      </FormSectionCard>

      {/* Ministers and Mass Roles */}
      <FormSectionCard
        title="Ministers"
        description="People serving in liturgical mass roles for this Mass"
      >
        <PersonPickerField
            label="Presider"
            description="Priest or deacon presiding at this Mass"
            value={presider.value}
            onValueChange={presider.setValue}
            showPicker={presider.showPicker}
            onShowPickerChange={presider.setShowPicker}
            autoSetSex="MALE"
          />

          <PersonPickerField
            label="Homilist"
            description="Person giving the homily (if different from presider)"
            value={homilist.value}
            onValueChange={homilist.setValue}
            showPicker={homilist.showPicker}
            onShowPickerChange={homilist.setShowPicker}
            autoSetSex="MALE"
          />
      </FormSectionCard>

      {/* Mass Intention */}
      {isEditing && mass?.id && (
        <FormSectionCard
          title="Mass Intention"
          description="Link a mass intention to this Mass"
          data-testid="mass-intention-card"
        >
          {massIntention ? (
              <div className="border rounded-md p-4 space-y-3" data-testid="mass-intention-display">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-2">
                      <div>
                        <div className="font-medium">
                          {massIntention.mass_offered_for || 'No intention specified'}
                        </div>
                        {massIntention.requested_by && (
                          <div className="text-sm text-muted-foreground">
                            Requested by: {massIntention.requested_by.first_name} {massIntention.requested_by.last_name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {MASS_INTENTION_STATUS_LABELS[massIntention.status as keyof typeof MASS_INTENTION_STATUS_LABELS]?.en || massIntention.status}
                        </Badge>
                        {massIntention.stipend_in_cents && (
                          <div className="text-sm text-muted-foreground">
                            ${(massIntention.stipend_in_cents / 100).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlinkMassIntention}
                    data-testid="unlink-mass-intention-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No mass intention linked yet
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMassIntentionPickerOpen(true)}
                  data-testid="link-mass-intention-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Link Mass Intention
                </Button>
              </div>
            )}
        </FormSectionCard>
      )}

      {/* Mass Role Assignments */}
      {isEditing && mass?.id && (
        <FormSectionCard
          title="Mass Role Assignments"
          description="Assign people to liturgical mass roles for this Mass"
        >
          {allTemplates.length > 0 ? (
              <FormField
                id="mass_roles_template_id"
                inputType="select"
                label="Mass Role Template"
                description="Choose a template to define which mass roles are needed for this Mass"
                value={massRolesTemplateId}
                onChange={handleTemplateChange}
                options={allTemplates.map((template) => ({
                  value: template.id,
                  label: template.name
                }))}
              />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                No mass role templates available. Please create a template first.
              </div>
            )}

            {massRolesTemplateId && templateItems.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">
                This template has no mass roles defined. Please edit the template to add mass roles.
              </div>
            )}

            {massRolesTemplateId && templateItems.length > 0 && (
              <div className="space-y-6">
                {templateItems.map(item => {
                  const assignments = massRoles.filter(mr =>
                    mr.mass_roles_template_item_id === item.id
                  )
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {item.mass_role.name}
                            <RoleFulfillmentBadge
                              countNeeded={item.count}
                              countAssigned={assignments.length}
                            />
                          </div>
                          {item.mass_role.description && (
                            <div className="text-sm text-muted-foreground">
                              {item.mass_role.description}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRolePicker(item.id)}
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

            {!massRolesTemplateId && (
              <div className="text-sm text-muted-foreground text-center py-6">
                Please select a role template to assign people to liturgical roles.
              </div>
            )}
        </FormSectionCard>
      )}

      {/* People Picker Modal for Mass Role Assignment */}
      {currentRoleId && (
        <PeoplePicker
          open={rolePickerOpen}
          onOpenChange={setRolePickerOpen}
          onSelect={handleSelectPersonForRole}
        />
      )}

      {/* Petitions */}
      <PetitionEditor
        value={petitions}
        onChange={setPetitions}
        templates={petitionTemplates}
        onInsertTemplate={handleInsertTemplate}
      />

      {/* Announcements */}
      <FormSectionCard
        title="Announcements"
        description="Full text of announcements to be read before Mass"
      >
        <FormField
            id="announcements"
            label="Announcement Text"
            inputType="textarea"
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter announcements here..."
            rows={6}
          />
      </FormSectionCard>

      {/* Notes */}
      <FormSectionCard
        title="Notes"
        description="Internal notes and reminders (not included in printed liturgy)"
      >
        <FormField
            id="note"
            label="Notes"
            inputType="textarea"
            value={note}
            onChange={setNote}
            placeholder="Add any internal notes or reminders..."
            rows={3}
          />
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/masses/${mass.id}` : '/masses'}
        saveLabel={isEditing ? "Save Mass" : "Create Mass"}
      />

      {/* Mass Intention Picker Modal */}
      <MassIntentionPicker
        open={massIntentionPickerOpen}
        onOpenChange={setMassIntentionPickerOpen}
        onSelect={handleSelectMassIntention}
        selectedMassIntentionId={massIntention?.id}
        openToNewMassIntention={!massIntention}
      />
    </form>
  )
}

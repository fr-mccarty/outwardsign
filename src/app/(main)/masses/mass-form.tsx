"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createMass, updateMass, type CreateMassData, type MassWithRelations } from "@/lib/actions/masses"
import type { Person, Event } from "@/lib/types"
import type { GlobalLiturgicalEvent } from "@/lib/actions/global-liturgical-events"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { LiturgicalEventPickerField } from "@/components/liturgical-event-picker-field"
import { MASS_STATUS_VALUES, MASS_STATUS_LABELS, MASS_TEMPLATE_VALUES, MASS_TEMPLATE_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { usePickerState } from "@/hooks/use-picker-state"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { GlobalLiturgicalEventPicker } from "@/components/global-liturgical-event-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  const [massTemplateId, setMassTemplateId] = useState(mass?.mass_template_id || "mass-full-script-english")
  const [preMassAnnouncementTopic, setPreMassAnnouncementTopic] = useState(mass?.pre_mass_announcement_topic || "")

  // Picker states using usePickerState hook
  const event = usePickerState<Event>()
  const presider = usePickerState<Person>()
  const homilist = usePickerState<Person>()
  const preMassAnnouncementPerson = usePickerState<Person>()
  const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

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
    }
  }, [mass])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const massData: CreateMassData = {
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
      }

      if (isEditing) {
        await updateMass(mass.id, massData)
        toast.success('Mass updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newMass = await createMass(massData)
        toast.success('Mass created successfully')
        router.push(`/masses/${newMass.id}`)
      }
    } catch (error) {
      console.error('Error saving mass:', error)
      toast.error(isEditing ? 'Failed to update mass' : 'Failed to create mass')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      router.push(`/masses/${mass.id}`)
    } else {
      router.push('/masses')
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
            openToNewEvent={!isEditing}
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
            openToNewPerson={!isEditing}
          />

          <PersonPickerField
            label="Homilist"
            description="Person giving the homily (if different from presider)"
            value={homilist.value}
            onValueChange={homilist.setValue}
            showPicker={homilist.showPicker}
            onShowPickerChange={homilist.setShowPicker}
            openToNewPerson={!isEditing}
          />
        </CardContent>
      </Card>

      {/* Announcements and Petitions */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements and Petitions</CardTitle>
          <CardDescription>
            Pre-Mass announcements and Universal Prayer (Prayer of the Faithful)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Pre-Mass Announcement Person"
            description="Person making pre-Mass announcements"
            value={preMassAnnouncementPerson.value}
            onValueChange={preMassAnnouncementPerson.setValue}
            showPicker={preMassAnnouncementPerson.showPicker}
            onShowPickerChange={preMassAnnouncementPerson.setShowPicker}
            openToNewPerson={!isEditing}
          />

          <FormField
            id="pre_mass_announcement_topic"
            label="Pre-Mass Announcement Topic"
            description="Brief topic or title for pre-Mass announcements"
            value={preMassAnnouncementTopic}
            onChange={setPreMassAnnouncementTopic}
            placeholder="Parish events, thank you notes, etc."
          />

          <FormField
            id="announcements"
            label="Announcements"
            description="Full text of announcements to be read before Mass"
            inputType="textarea"
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter announcements here..."
            rows={4}
          />

          <Separator />

          <PetitionEditor
            value={petitions}
            onChange={setPetitions}
            templates={petitionTemplates}
            onInsertTemplate={handleInsertTemplate}
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

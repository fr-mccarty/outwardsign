"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"
import { createWedding, updateWedding, type CreateWeddingData, type WeddingWithRelations } from "@/lib/actions/weddings"
import { getIndividualReadings } from "@/lib/actions/readings"
import type { Person, IndividualReading, Event } from "@/lib/types"
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
import { ReadingPickerModal } from "@/components/reading-picker-modal"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PetitionEditor, type PetitionTemplate } from "@/components/petition-editor"
import { weddingTemplates, buildWeddingPetitions } from "@/lib/petition-templates/wedding"
import { WEDDING_TEMPLATES } from "@/lib/content-builders/wedding"
import { usePickerState } from "@/hooks/use-picker-state"
import { Button } from "@/components/ui/button"

interface WeddingFormProps {
  wedding?: WeddingWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function WeddingForm({ wedding, formId, onLoadingChange }: WeddingFormProps) {
  const router = useRouter()
  const isEditing = !!wedding
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(wedding?.status || "ACTIVE")
  const [notes, setNotes] = useState(wedding?.notes || "")
  const [announcements, setAnnouncements] = useState(wedding?.announcements || "")
  const [petitions, setPetitions] = useState(wedding?.petitions || "")
  const [weddingTemplateId, setWeddingTemplateId] = useState(wedding?.wedding_template_id || "")

  // Boolean states
  const [psalmIsSung, setPsalmIsSung] = useState(wedding?.psalm_is_sung || false)
  const [petitionsReadBySecondReader, setPetitionsReadBySecondReader] = useState(wedding?.petitions_read_by_second_reader || false)

  // Picker states using usePickerState hook - Events
  const weddingEvent = usePickerState<Event>()
  const receptionEvent = usePickerState<Event>()
  const rehearsalEvent = usePickerState<Event>()
  const rehearsalDinnerEvent = usePickerState<Event>()

  // Picker states using usePickerState hook - People
  const bride = usePickerState<Person>()
  const groom = usePickerState<Person>()
  const coordinator = usePickerState<Person>()
  const presider = usePickerState<Person>()
  const homilist = usePickerState<Person>()
  const leadMusician = usePickerState<Person>()
  const cantor = usePickerState<Person>()
  const witness1 = usePickerState<Person>()
  const witness2 = usePickerState<Person>()
  const firstReader = usePickerState<Person>()
  const secondReader = usePickerState<Person>()
  const psalmReader = usePickerState<Person>()
  const gospelReader = usePickerState<Person>()
  const petitionReader = usePickerState<Person>()

  // Reading picker states
  const [showFirstReadingPicker, setShowFirstReadingPicker] = useState(false)
  const [showPsalmPicker, setShowPsalmPicker] = useState(false)
  const [showSecondReadingPicker, setShowSecondReadingPicker] = useState(false)
  const [showGospelReadingPicker, setShowGospelReadingPicker] = useState(false)
  const [readings, setReadings] = useState<IndividualReading[]>([])

  // Selected readings
  const [firstReading, setFirstReading] = useState<IndividualReading | null>(null)
  const [psalm, setPsalm] = useState<IndividualReading | null>(null)
  const [secondReading, setSecondReading] = useState<IndividualReading | null>(null)
  const [gospelReading, setGospelReading] = useState<IndividualReading | null>(null)

  // Load readings on mount
  useEffect(() => {
    const loadReadings = async () => {
      try {
        const allReadings = await getIndividualReadings()
        setReadings(allReadings)
      } catch (error) {
        console.error('Failed to load readings:', error)
        toast.error('Failed to load readings')
      }
    }
    loadReadings()
  }, [])

  // Initialize form with wedding data when editing
  useEffect(() => {
    if (wedding) {
      // Set events
      if (wedding.wedding_event) weddingEvent.setValue(wedding.wedding_event)
      if (wedding.reception_event) receptionEvent.setValue(wedding.reception_event)
      if (wedding.rehearsal_event) rehearsalEvent.setValue(wedding.rehearsal_event)
      if (wedding.rehearsal_dinner_event) rehearsalDinnerEvent.setValue(wedding.rehearsal_dinner_event)

      // Set people
      if (wedding.bride) bride.setValue(wedding.bride)
      if (wedding.groom) groom.setValue(wedding.groom)
      if (wedding.coordinator) coordinator.setValue(wedding.coordinator)
      if (wedding.presider) presider.setValue(wedding.presider)
      if (wedding.homilist) homilist.setValue(wedding.homilist)
      if (wedding.lead_musician) leadMusician.setValue(wedding.lead_musician)
      if (wedding.cantor) cantor.setValue(wedding.cantor)
      if (wedding.witness_1) witness1.setValue(wedding.witness_1)
      if (wedding.witness_2) witness2.setValue(wedding.witness_2)
      if (wedding.first_reader) firstReader.setValue(wedding.first_reader)
      if (wedding.second_reader) secondReader.setValue(wedding.second_reader)
      if (wedding.psalm_reader) psalmReader.setValue(wedding.psalm_reader)
      if (wedding.gospel_reader) gospelReader.setValue(wedding.gospel_reader)
      if (wedding.petition_reader) petitionReader.setValue(wedding.petition_reader)

      // Set readings
      if (wedding.first_reading) setFirstReading(wedding.first_reading)
      if (wedding.psalm) setPsalm(wedding.psalm)
      if (wedding.second_reading) setSecondReading(wedding.second_reading)
      if (wedding.gospel_reading) setGospelReading(wedding.gospel_reading)
    }
  }, [wedding])

  // Handle inserting template petitions
  const handleInsertTemplate = (templateId: string): string[] => {
    const brideName = bride.value?.first_name || ''
    const groomName = groom.value?.first_name || ''

    // Build petitions from selected template
    return buildWeddingPetitions(templateId, brideName, groomName)
  }

  // Get available templates - convert to PetitionTemplate format
  const petitionTemplates: PetitionTemplate[] = weddingTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const weddingData: CreateWeddingData = {
        status: status || undefined,
        wedding_event_id: weddingEvent.value?.id,
        reception_event_id: receptionEvent.value?.id,
        rehearsal_event_id: rehearsalEvent.value?.id,
        rehearsal_dinner_event_id: rehearsalDinnerEvent.value?.id,
        bride_id: bride.value?.id,
        groom_id: groom.value?.id,
        coordinator_id: coordinator.value?.id,
        presider_id: presider.value?.id,
        homilist_id: homilist.value?.id,
        lead_musician_id: leadMusician.value?.id,
        cantor_id: cantor.value?.id,
        witness_1_id: witness1.value?.id,
        witness_2_id: witness2.value?.id,
        first_reader_id: firstReader.value?.id,
        second_reader_id: secondReader.value?.id,
        psalm_reader_id: psalmReader.value?.id,
        gospel_reader_id: gospelReader.value?.id,
        petition_reader_id: petitionReader.value?.id,
        first_reading_id: firstReading?.id,
        psalm_id: psalm?.id,
        second_reading_id: secondReading?.id,
        gospel_reading_id: gospelReading?.id,
        psalm_is_sung: psalmIsSung,
        petitions_read_by_second_reader: petitionsReadBySecondReader,
        petitions: petitions || undefined,
        announcements: announcements || undefined,
        notes: notes || undefined,
        wedding_template_id: weddingTemplateId || undefined,
      }

      if (isEditing) {
        await updateWedding(wedding.id, weddingData)
        toast.success('Wedding updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newWedding = await createWedding(weddingData)
        toast.success('Wedding created successfully!')
        router.push(`/weddings/${newWedding.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} wedding:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} wedding. Please try again.`)
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
          <CardDescription>General details and event times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_STATUS_VALUES.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {MODULE_STATUS_LABELS[statusOption].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EventPickerField
              label="Wedding Ceremony"
              value={weddingEvent.value}
              onValueChange={weddingEvent.setValue}
              showPicker={weddingEvent.showPicker}
              onShowPickerChange={weddingEvent.setShowPicker}
              placeholder="Add Wedding Ceremony"
              openToNewEvent={!isEditing}
              defaultEventType="WEDDING"
              defaultName={EVENT_TYPE_LABELS.WEDDING.en}
              disableSearch={true}
            />
            <EventPickerField
              label="Reception"
              value={receptionEvent.value}
              onValueChange={receptionEvent.setValue}
              showPicker={receptionEvent.showPicker}
              onShowPickerChange={receptionEvent.setShowPicker}
              placeholder="Add Reception"
              openToNewEvent={!isEditing}
              defaultEventType="OTHER"
              defaultName="Reception"
              disableSearch={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EventPickerField
              label="Rehearsal"
              value={rehearsalEvent.value}
              onValueChange={rehearsalEvent.setValue}
              showPicker={rehearsalEvent.showPicker}
              onShowPickerChange={rehearsalEvent.setShowPicker}
              placeholder="Add Rehearsal"
              openToNewEvent={!isEditing}
              defaultEventType="REHEARSAL"
              defaultName="Rehearsal"
              disableSearch={true}
            />
            <EventPickerField
              label="Rehearsal Dinner"
              value={rehearsalDinnerEvent.value}
              onValueChange={rehearsalDinnerEvent.setValue}
              showPicker={rehearsalDinnerEvent.showPicker}
              onShowPickerChange={rehearsalDinnerEvent.setShowPicker}
              placeholder="Add Rehearsal Dinner"
              openToNewEvent={!isEditing}
              defaultEventType="OTHER"
              defaultName="Rehearsal Dinner"
              disableSearch={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Couple */}
      <Card>
        <CardHeader>
          <CardTitle>Couple</CardTitle>
          <CardDescription>Bride and groom information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Bride"
              value={bride.value}
              onValueChange={bride.setValue}
              showPicker={bride.showPicker}
              onShowPickerChange={bride.setShowPicker}
              placeholder="Select Bride"
              openToNewPerson={!isEditing}
            />
            <PersonPickerField
              label="Groom"
              value={groom.value}
              onValueChange={groom.setValue}
              showPicker={groom.showPicker}
              onShowPickerChange={groom.setShowPicker}
              placeholder="Select Groom"
              openToNewPerson={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liturgical Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Liturgical Roles</CardTitle>
          <CardDescription>Ministers and liturgical participants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Presider"
              value={presider.value}
              onValueChange={presider.setValue}
              showPicker={presider.showPicker}
              onShowPickerChange={presider.setShowPicker}
              placeholder="Select Presider"
              openToNewPerson={!isEditing}
            />
            <PersonPickerField
              label="Homilist"
              value={homilist.value}
              onValueChange={homilist.setValue}
              showPicker={homilist.showPicker}
              onShowPickerChange={homilist.setShowPicker}
              placeholder="Select Homilist"
              openToNewPerson={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Music Ministers */}
      <Card>
        <CardHeader>
          <CardTitle>Music Ministers</CardTitle>
          <CardDescription>Musicians and singers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Lead Musician"
              value={leadMusician.value}
              onValueChange={leadMusician.setValue}
              showPicker={leadMusician.showPicker}
              onShowPickerChange={leadMusician.setShowPicker}
              placeholder="Select Lead Musician"
              openToNewPerson={!isEditing}
            />
            <PersonPickerField
              label="Cantor"
              value={cantor.value}
              onValueChange={cantor.setValue}
              showPicker={cantor.showPicker}
              onShowPickerChange={cantor.setShowPicker}
              placeholder="Select Cantor"
              openToNewPerson={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Witnesses */}
      <Card>
        <CardHeader>
          <CardTitle>Witnesses</CardTitle>
          <CardDescription>Official witnesses for the wedding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Witness 1"
              value={witness1.value}
              onValueChange={witness1.setValue}
              showPicker={witness1.showPicker}
              onShowPickerChange={witness1.setShowPicker}
              placeholder="Select Witness 1"
              openToNewPerson={!isEditing}
            />
            <PersonPickerField
              label="Witness 2"
              value={witness2.value}
              onValueChange={witness2.setValue}
              showPicker={witness2.showPicker}
              onShowPickerChange={witness2.setShowPicker}
              placeholder="Select Witness 2"
              openToNewPerson={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coordinator */}
      <Card>
        <CardHeader>
          <CardTitle>Coordination</CardTitle>
          <CardDescription>Wedding coordinator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Coordinator"
            value={coordinator.value}
            onValueChange={coordinator.setValue}
            showPicker={coordinator.showPicker}
            onShowPickerChange={coordinator.setShowPicker}
            placeholder="Select Coordinator"
            openToNewPerson={!isEditing}
          />
        </CardContent>
      </Card>

      {/* Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Readings</CardTitle>
          <CardDescription>Scripture readings for the wedding liturgy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Reading</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowFirstReadingPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {firstReading ? firstReading.pericope : 'Select First Reading'}
              </Button>
            </div>
            <PersonPickerField
              label="First Reader"
              value={firstReader.value}
              onValueChange={firstReader.setValue}
              showPicker={firstReader.showPicker}
              onShowPickerChange={firstReader.setShowPicker}
              placeholder="Select First Reader"
              openToNewPerson={!isEditing}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Responsorial Psalm</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPsalmPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {psalm ? psalm.pericope : 'Select Psalm'}
              </Button>
            </div>
            {!psalmIsSung && (
              <PersonPickerField
                label="Psalm Reader"
                value={psalmReader.value}
                onValueChange={psalmReader.setValue}
                showPicker={psalmReader.showPicker}
                onShowPickerChange={psalmReader.setShowPicker}
                placeholder="Select Psalm Reader"
                openToNewPerson={!isEditing}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="psalm_is_sung"
              checked={psalmIsSung}
              onCheckedChange={(checked) => setPsalmIsSung(checked as boolean)}
            />
            <label
              htmlFor="psalm_is_sung"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Psalm is sung
            </label>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Second Reading</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowSecondReadingPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {secondReading ? secondReading.pericope : 'Select Second Reading'}
              </Button>
            </div>
            <PersonPickerField
              label="Second Reader"
              value={secondReader.value}
              onValueChange={secondReader.setValue}
              showPicker={secondReader.showPicker}
              onShowPickerChange={secondReader.setShowPicker}
              placeholder="Select Second Reader"
              openToNewPerson={!isEditing}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gospel Reading</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGospelReadingPicker(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {gospelReading ? gospelReading.pericope : 'Select Gospel'}
              </Button>
            </div>
            <PersonPickerField
              label="Gospel Reader"
              value={gospelReader.value}
              onValueChange={gospelReader.setValue}
              showPicker={gospelReader.showPicker}
              onShowPickerChange={gospelReader.setShowPicker}
              placeholder="Select Gospel Reader"
              openToNewPerson={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Petitions */}
      <PetitionEditor
        value={petitions}
        onChange={setPetitions}
        onInsertTemplate={handleInsertTemplate}
        templates={petitionTemplates}
      />

      {/* Petition Reader */}
      <Card>
        <CardHeader>
          <CardTitle>Petition Reader</CardTitle>
          <CardDescription>Who will read the petitions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="petitions_read_by_second_reader"
              checked={petitionsReadBySecondReader}
              onCheckedChange={(checked) => setPetitionsReadBySecondReader(checked as boolean)}
            />
            <label
              htmlFor="petitions_read_by_second_reader"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Petitions read by second reader
            </label>
          </div>

          {!petitionsReadBySecondReader && (
            <PersonPickerField
              label="Petition Reader"
              value={petitionReader.value}
              onValueChange={petitionReader.setValue}
              showPicker={petitionReader.showPicker}
              onShowPickerChange={petitionReader.setShowPicker}
              placeholder="Select Petition Reader"
              openToNewPerson={!isEditing}
            />
          )}
        </CardContent>
      </Card>

      {/* Announcements and Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Announcements and notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="announcements"
            label="Announcements"
            description="These announcements will be printed on the last page of the liturgy script"
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter any announcements..."
            inputType="textarea"
            rows={3}
          />

          <FormField
            id="notes"
            label="Note"
            description="These notes are just for reference and will not be printed in the script"
            value={notes}
            onChange={setNotes}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Wedding Template</CardTitle>
          <CardDescription>Select the liturgy template for the wedding ceremony script</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wedding_template_id">Liturgy Template</Label>
            <Select value={weddingTemplateId} onValueChange={setWeddingTemplateId}>
              <SelectTrigger id="wedding_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(WEDDING_TEMPLATES).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
        saveLabel={isEditing ? 'Update Wedding' : 'Save Wedding'}
      />

      {/* Reading Pickers */}
      <ReadingPickerModal
        isOpen={showFirstReadingPicker}
        onClose={() => setShowFirstReadingPicker(false)}
        onSelect={(reading) => setFirstReading(reading)}
        selectedReading={firstReading}
        readings={readings}
        title="Select First Reading"
        preselectedCategories={['First Reading', 'Wedding']}
      />
      <ReadingPickerModal
        isOpen={showPsalmPicker}
        onClose={() => setShowPsalmPicker(false)}
        onSelect={(reading) => setPsalm(reading)}
        selectedReading={psalm}
        readings={readings}
        title="Select Responsorial Psalm"
        preselectedCategories={['Psalm', 'Wedding']}
      />
      <ReadingPickerModal
        isOpen={showSecondReadingPicker}
        onClose={() => setShowSecondReadingPicker(false)}
        onSelect={(reading) => setSecondReading(reading)}
        selectedReading={secondReading}
        readings={readings}
        title="Select Second Reading"
        preselectedCategories={['Second Reading', 'Wedding']}
      />
      <ReadingPickerModal
        isOpen={showGospelReadingPicker}
        onClose={() => setShowGospelReadingPicker(false)}
        onSelect={(reading) => setGospelReading(reading)}
        selectedReading={gospelReading}
        readings={readings}
        title="Select Gospel Reading"
        preselectedCategories={['Gospel', 'Wedding']}
      />
    </form>
  )
}

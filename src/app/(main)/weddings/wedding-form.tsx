"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, BookOpen, Calendar } from "lucide-react"
import { createWedding, updateWedding, type CreateWeddingData } from "@/lib/actions/weddings"
import { getIndividualReadings } from "@/lib/actions/readings"
import type { Wedding, Person, IndividualReading, Event } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PeoplePicker } from "@/components/people-picker"
import { ReadingPickerModal } from "@/components/reading-picker-modal"
import { EventPicker } from "@/components/event-picker"
import { EventDisplay } from "@/components/event-display"
import { WEDDING_STATUS } from "@/lib/constants"
import { SaveButton } from "@/components/save-button"
import { CancelButton } from "@/components/cancel-button"

interface WeddingFormProps {
  wedding?: Wedding
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
  const [status, setStatus] = useState(wedding?.status || "Active")
  const [notes, setNotes] = useState(wedding?.notes || "")
  const [announcements, setAnnouncements] = useState(wedding?.announcements || "")
  const [petitions, setPetitions] = useState(wedding?.petitions || "")

  // Boolean states
  const [psalmIsSung, setPsalmIsSung] = useState(wedding?.psalm_is_sung || false)
  const [petitionsReadBySecondReader, setPetitionsReadBySecondReader] = useState(wedding?.petitions_read_by_second_reader || false)

  // Event picker states
  const [showWeddingEventPicker, setShowWeddingEventPicker] = useState(false)
  const [showReceptionEventPicker, setShowReceptionEventPicker] = useState(false)
  const [showRehearsalEventPicker, setShowRehearsalEventPicker] = useState(false)
  const [showRehearsalDinnerEventPicker, setShowRehearsalDinnerEventPicker] = useState(false)

  // People picker states
  const [showBridePicker, setShowBridePicker] = useState(false)
  const [showGroomPicker, setShowGroomPicker] = useState(false)
  const [showCoordinatorPicker, setShowCoordinatorPicker] = useState(false)
  const [showPresiderPicker, setShowPresiderPicker] = useState(false)
  const [showHomilistPicker, setShowHomilistPicker] = useState(false)
  const [showLeadMusicianPicker, setShowLeadMusicianPicker] = useState(false)
  const [showCantorPicker, setShowCantorPicker] = useState(false)
  const [showWitness1Picker, setShowWitness1Picker] = useState(false)
  const [showWitness2Picker, setShowWitness2Picker] = useState(false)
  const [showFirstReaderPicker, setShowFirstReaderPicker] = useState(false)
  const [showSecondReaderPicker, setShowSecondReaderPicker] = useState(false)
  const [showPsalmReaderPicker, setShowPsalmReaderPicker] = useState(false)
  const [showGospelReaderPicker, setShowGospelReaderPicker] = useState(false)
  const [showPetitionReaderPicker, setShowPetitionReaderPicker] = useState(false)

  // Selected events
  const [weddingEvent, setWeddingEvent] = useState<Event | null>(null)
  const [receptionEvent, setReceptionEvent] = useState<Event | null>(null)
  const [rehearsalEvent, setRehearsalEvent] = useState<Event | null>(null)
  const [rehearsalDinnerEvent, setRehearsalDinnerEvent] = useState<Event | null>(null)

  // Selected people
  const [bride, setBride] = useState<Person | null>(null)
  const [groom, setGroom] = useState<Person | null>(null)
  const [coordinator, setCoordinator] = useState<Person | null>(null)
  const [presider, setPresider] = useState<Person | null>(null)
  const [homilist, setHomilist] = useState<Person | null>(null)
  const [leadMusician, setLeadMusician] = useState<Person | null>(null)
  const [cantor, setCantor] = useState<Person | null>(null)
  const [witness1, setWitness1] = useState<Person | null>(null)
  const [witness2, setWitness2] = useState<Person | null>(null)
  const [firstReader, setFirstReader] = useState<Person | null>(null)
  const [secondReader, setSecondReader] = useState<Person | null>(null)
  const [psalmReader, setPsalmReader] = useState<Person | null>(null)
  const [gospelReader, setGospelReader] = useState<Person | null>(null)
  const [petitionReader, setPetitionReader] = useState<Person | null>(null)

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
      if ((wedding as any).wedding_event) setWeddingEvent((wedding as any).wedding_event)
      if ((wedding as any).reception_event) setReceptionEvent((wedding as any).reception_event)
      if ((wedding as any).rehearsal_event) setRehearsalEvent((wedding as any).rehearsal_event)
      if ((wedding as any).rehearsal_dinner_event) setRehearsalDinnerEvent((wedding as any).rehearsal_dinner_event)

      // Set people
      if ((wedding as any).bride) setBride((wedding as any).bride)
      if ((wedding as any).groom) setGroom((wedding as any).groom)
      if ((wedding as any).coordinator) setCoordinator((wedding as any).coordinator)
      if ((wedding as any).presider) setPresider((wedding as any).presider)
      if ((wedding as any).homilist) setHomilist((wedding as any).homilist)
      if ((wedding as any).lead_musician) setLeadMusician((wedding as any).lead_musician)
      if ((wedding as any).cantor) setCantor((wedding as any).cantor)
      if ((wedding as any).witness_1) setWitness1((wedding as any).witness_1)
      if ((wedding as any).witness_2) setWitness2((wedding as any).witness_2)
      if ((wedding as any).first_reader) setFirstReader((wedding as any).first_reader)
      if ((wedding as any).second_reader) setSecondReader((wedding as any).second_reader)
      if ((wedding as any).psalm_reader) setPsalmReader((wedding as any).psalm_reader)
      if ((wedding as any).gospel_reader) setGospelReader((wedding as any).gospel_reader)
      if ((wedding as any).petition_reader) setPetitionReader((wedding as any).petition_reader)

      // Set readings
      if ((wedding as any).first_reading) setFirstReading((wedding as any).first_reading)
      if ((wedding as any).psalm) setPsalm((wedding as any).psalm)
      if ((wedding as any).second_reading) setSecondReading((wedding as any).second_reading)
      if ((wedding as any).gospel_reading) setGospelReading((wedding as any).gospel_reading)
    }
  }, [wedding])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const weddingData: CreateWeddingData = {
        status: status || undefined,
        wedding_event_id: weddingEvent?.id,
        reception_event_id: receptionEvent?.id,
        rehearsal_event_id: rehearsalEvent?.id,
        rehearsal_dinner_event_id: rehearsalDinnerEvent?.id,
        bride_id: bride?.id,
        groom_id: groom?.id,
        coordinator_id: coordinator?.id,
        presider_id: presider?.id,
        homilist_id: homilist?.id,
        lead_musician_id: leadMusician?.id,
        cantor_id: cantor?.id,
        witness_1_id: witness1?.id,
        witness_2_id: witness2?.id,
        first_reader_id: firstReader?.id,
        second_reader_id: secondReader?.id,
        psalm_reader_id: psalmReader?.id,
        gospel_reader_id: gospelReader?.id,
        petition_reader_id: petitionReader?.id,
        first_reading_id: firstReading?.id,
        psalm_id: psalm?.id,
        second_reading_id: secondReading?.id,
        gospel_reading_id: gospelReading?.id,
        psalm_is_sung: psalmIsSung,
        petitions_read_by_second_reader: petitionsReadBySecondReader,
        petitions: petitions || undefined,
        announcements: announcements || undefined,
        notes: notes || undefined,
      }

      if (isEditing) {
        await updateWedding(wedding.id, weddingData)
        toast.success('Wedding updated successfully')
        // Stay on edit page, don't redirect
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
                {WEDDING_STATUS.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {statusOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wedding Ceremony</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowWeddingEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={weddingEvent} placeholder="Add Wedding Ceremony" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Reception</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowReceptionEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={receptionEvent} placeholder="Add Reception" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rehearsal</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowRehearsalEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={rehearsalEvent} placeholder="Add Rehearsal" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Rehearsal Dinner</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setShowRehearsalDinnerEventPicker(true)}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <EventDisplay event={rehearsalDinnerEvent} placeholder="Add Rehearsal Dinner" />
              </Button>
            </div>
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
            <div className="space-y-2">
              <Label>Bride</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowBridePicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {bride ? `${bride.first_name} ${bride.last_name}` : 'Select Bride'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Groom</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGroomPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {groom ? `${groom.first_name} ${groom.last_name}` : 'Select Groom'}
              </Button>
            </div>
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
            <div className="space-y-2">
              <Label>Presider</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPresiderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {presider ? `${presider.first_name} ${presider.last_name}` : 'Select Presider'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Homilist</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowHomilistPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {homilist ? `${homilist.first_name} ${homilist.last_name}` : 'Select Homilist'}
              </Button>
            </div>
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
            <div className="space-y-2">
              <Label>Lead Musician</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowLeadMusicianPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {leadMusician ? `${leadMusician.first_name} ${leadMusician.last_name}` : 'Select Lead Musician'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Cantor</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowCantorPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {cantor ? `${cantor.first_name} ${cantor.last_name}` : 'Select Cantor'}
              </Button>
            </div>
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
            <div className="space-y-2">
              <Label>Witness 1</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowWitness1Picker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {witness1 ? `${witness1.first_name} ${witness1.last_name}` : 'Select Witness 1'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Witness 2</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowWitness2Picker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {witness2 ? `${witness2.first_name} ${witness2.last_name}` : 'Select Witness 2'}
              </Button>
            </div>
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
          <div className="space-y-2">
            <Label>Coordinator</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowCoordinatorPicker(true)}
            >
              <User className="h-4 w-4 mr-2" />
              {coordinator ? `${coordinator.first_name} ${coordinator.last_name}` : 'Select Coordinator'}
            </Button>
          </div>
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
            <div className="space-y-2">
              <Label>First Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowFirstReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {firstReader ? `${firstReader.first_name} ${firstReader.last_name}` : 'Select First Reader'}
              </Button>
            </div>
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
              <div className="space-y-2">
                <Label>Psalm Reader</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowPsalmReaderPicker(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  {psalmReader ? `${psalmReader.first_name} ${psalmReader.last_name}` : 'Select Psalm Reader'}
                </Button>
              </div>
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
            <div className="space-y-2">
              <Label>Second Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowSecondReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {secondReader ? `${secondReader.first_name} ${secondReader.last_name}` : 'Select Second Reader'}
              </Button>
            </div>
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
            <div className="space-y-2">
              <Label>Gospel Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowGospelReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {gospelReader ? `${gospelReader.first_name} ${gospelReader.last_name}` : 'Select Gospel Reader'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Petitions */}
      <Card>
        <CardHeader>
          <CardTitle>Petitions</CardTitle>
          <CardDescription>Universal prayers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="petitions"
            label="Petitions Text"
            value={petitions}
            onChange={setPetitions}
            placeholder="Enter the petitions text..."
            inputType="textarea"
            rows={5}
          />

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
            <div className="space-y-2">
              <Label>Petition Reader</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPetitionReaderPicker(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {petitionReader ? `${petitionReader.first_name} ${petitionReader.last_name}` : 'Select Petition Reader'}
              </Button>
            </div>
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
            value={announcements}
            onChange={setAnnouncements}
            placeholder="Enter any announcements..."
            inputType="textarea"
            rows={3}
          />

          <FormField
            id="notes"
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Enter any additional notes..."
            inputType="textarea"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4 justify-end">
        <CancelButton
          href={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
          disabled={isLoading}
        />
        <SaveButton isLoading={isLoading}>
          {isEditing ? 'Update Wedding' : 'Save Wedding'}
        </SaveButton>
      </div>

      {/* Event Pickers */}
      <EventPicker
        open={showWeddingEventPicker}
        onOpenChange={setShowWeddingEventPicker}
        onSelect={(event) => setWeddingEvent(event)}
        selectedEventId={weddingEvent?.id}
        selectedEvent={weddingEvent}
        defaultEventType="Wedding Ceremony"
        defaultName="Wedding Ceremony"
        openToNewEvent={!weddingEvent}
        disableSearch={true}
      />
      <EventPicker
        open={showReceptionEventPicker}
        onOpenChange={setShowReceptionEventPicker}
        onSelect={(event) => setReceptionEvent(event)}
        selectedEventId={receptionEvent?.id}
        selectedEvent={receptionEvent}
        defaultEventType="Reception"
        defaultName="Reception"
        openToNewEvent={!receptionEvent}
        disableSearch={true}
      />
      <EventPicker
        open={showRehearsalEventPicker}
        onOpenChange={setShowRehearsalEventPicker}
        onSelect={(event) => setRehearsalEvent(event)}
        selectedEventId={rehearsalEvent?.id}
        selectedEvent={rehearsalEvent}
        defaultEventType="Rehearsal"
        defaultName="Rehearsal"
        openToNewEvent={!rehearsalEvent}
        disableSearch={true}
      />
      <EventPicker
        open={showRehearsalDinnerEventPicker}
        onOpenChange={setShowRehearsalDinnerEventPicker}
        onSelect={(event) => setRehearsalDinnerEvent(event)}
        selectedEventId={rehearsalDinnerEvent?.id}
        selectedEvent={rehearsalDinnerEvent}
        defaultEventType="Rehearsal Dinner"
        defaultName="Rehearsal Dinner"
        openToNewEvent={!rehearsalDinnerEvent}
        disableSearch={true}
      />

      {/* People Pickers */}
      <PeoplePicker
        open={showBridePicker}
        onOpenChange={setShowBridePicker}
        onSelect={(person) => setBride(person)}
        selectedPersonId={bride?.id}
      />
      <PeoplePicker
        open={showGroomPicker}
        onOpenChange={setShowGroomPicker}
        onSelect={(person) => setGroom(person)}
        selectedPersonId={groom?.id}
      />
      <PeoplePicker
        open={showCoordinatorPicker}
        onOpenChange={setShowCoordinatorPicker}
        onSelect={(person) => setCoordinator(person)}
        selectedPersonId={coordinator?.id}
      />
      <PeoplePicker
        open={showPresiderPicker}
        onOpenChange={setShowPresiderPicker}
        onSelect={(person) => setPresider(person)}
        selectedPersonId={presider?.id}
      />
      <PeoplePicker
        open={showHomilistPicker}
        onOpenChange={setShowHomilistPicker}
        onSelect={(person) => setHomilist(person)}
        selectedPersonId={homilist?.id}
      />
      <PeoplePicker
        open={showLeadMusicianPicker}
        onOpenChange={setShowLeadMusicianPicker}
        onSelect={(person) => setLeadMusician(person)}
        selectedPersonId={leadMusician?.id}
      />
      <PeoplePicker
        open={showCantorPicker}
        onOpenChange={setShowCantorPicker}
        onSelect={(person) => setCantor(person)}
        selectedPersonId={cantor?.id}
      />
      <PeoplePicker
        open={showWitness1Picker}
        onOpenChange={setShowWitness1Picker}
        onSelect={(person) => setWitness1(person)}
        selectedPersonId={witness1?.id}
      />
      <PeoplePicker
        open={showWitness2Picker}
        onOpenChange={setShowWitness2Picker}
        onSelect={(person) => setWitness2(person)}
        selectedPersonId={witness2?.id}
      />
      <PeoplePicker
        open={showFirstReaderPicker}
        onOpenChange={setShowFirstReaderPicker}
        onSelect={(person) => setFirstReader(person)}
        selectedPersonId={firstReader?.id}
      />
      <PeoplePicker
        open={showSecondReaderPicker}
        onOpenChange={setShowSecondReaderPicker}
        onSelect={(person) => setSecondReader(person)}
        selectedPersonId={secondReader?.id}
      />
      <PeoplePicker
        open={showPsalmReaderPicker}
        onOpenChange={setShowPsalmReaderPicker}
        onSelect={(person) => setPsalmReader(person)}
        selectedPersonId={psalmReader?.id}
      />
      <PeoplePicker
        open={showGospelReaderPicker}
        onOpenChange={setShowGospelReaderPicker}
        onSelect={(person) => setGospelReader(person)}
        selectedPersonId={gospelReader?.id}
      />
      <PeoplePicker
        open={showPetitionReaderPicker}
        onOpenChange={setShowPetitionReaderPicker}
        onSelect={(person) => setPetitionReader(person)}
        selectedPersonId={petitionReader?.id}
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

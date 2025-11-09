"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar } from "lucide-react"
import { createPresentation, updatePresentation, type PresentationWithRelations } from "@/lib/actions/presentations"
import type { Person, Event } from "@/lib/types"
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
import { EventPicker } from "@/components/event-picker"
import { EventDisplay } from "@/components/event-display"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PRESENTATION_TEMPLATES } from "@/lib/content-builders/presentation"

interface PresentationFormProps {
  presentation?: PresentationWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function PresentationForm({ presentation, formId, onLoadingChange }: PresentationFormProps) {
  const router = useRouter()
  const isEditing = !!presentation
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(presentation?.status || "ACTIVE")
  const [note, setNote] = useState(presentation?.note || "")
  const [isBaptized, setIsBaptized] = useState(presentation?.is_baptized || false)
  const [presentationTemplateId, setPresentationTemplateId] = useState(
    presentation?.presentation_template_id || "presentation-spanish"
  )

  // Event picker states
  const [showPresentationEventPicker, setShowPresentationEventPicker] = useState(false)

  // People picker states
  const [showChildPicker, setShowChildPicker] = useState(false)
  const [showMotherPicker, setShowMotherPicker] = useState(false)
  const [showFatherPicker, setShowFatherPicker] = useState(false)
  const [showCoordinatorPicker, setShowCoordinatorPicker] = useState(false)

  // Selected event
  const [presentationEvent, setPresentationEvent] = useState<Event | null>(null)

  // Selected people
  const [child, setChild] = useState<Person | null>(null)
  const [mother, setMother] = useState<Person | null>(null)
  const [father, setFather] = useState<Person | null>(null)
  const [coordinator, setCoordinator] = useState<Person | null>(null)

  // Initialize form with presentation data when editing
  useEffect(() => {
    if (presentation) {
      // Set event
      if (presentation.presentation_event) setPresentationEvent(presentation.presentation_event)

      // Set people
      if (presentation.child) setChild(presentation.child)
      if (presentation.mother) setMother(presentation.mother)
      if (presentation.father) setFather(presentation.father)
      if (presentation.coordinator) setCoordinator(presentation.coordinator)
    }
  }, [presentation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const presentationData = {
        presentation_event_id: presentationEvent?.id || null,
        child_id: child?.id || null,
        mother_id: mother?.id || null,
        father_id: father?.id || null,
        coordinator_id: coordinator?.id || null,
        is_baptized: isBaptized,
        status: status || null,
        note: note || null,
        presentation_template_id: presentationTemplateId || null,
      }

      if (isEditing) {
        await updatePresentation(presentation.id, presentationData)
        toast.success('Presentation updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newPresentation = await createPresentation(presentationData)
        toast.success('Presentation created successfully!')
        router.push(`/presentations/${newPresentation.id}`) // Go to view page
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} presentation:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} presentation. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Event Information</CardTitle>
          </div>
          <CardDescription>Schedule and location details for the presentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Presentation Event</Label>
            <div className="mt-2">
              {presentationEvent ? (
                <div className="space-y-2">
                  <EventDisplay event={presentationEvent} placeholder="No presentation event selected" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPresentationEventPicker(true)}
                  >
                    Change Event
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPresentationEventPicker(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Select Event
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>People</CardTitle>
          </div>
          <CardDescription>Select the child and family members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Child {child?.sex && <span className="text-muted-foreground">({child.sex})</span>}</Label>
              <div className="mt-2">
                {child ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <span className="text-sm">{child.first_name} {child.last_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChildPicker(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowChildPicker(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Child
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Mother</Label>
              <div className="mt-2">
                {mother ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <span className="text-sm">{mother.first_name} {mother.last_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMotherPicker(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMotherPicker(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Mother
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Father</Label>
              <div className="mt-2">
                {father ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <span className="text-sm">{father.first_name} {father.last_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFatherPicker(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFatherPicker(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Father
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Coordinator (Optional)</Label>
              <div className="mt-2">
                {coordinator ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <span className="text-sm">{coordinator.first_name} {coordinator.last_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCoordinatorPicker(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCoordinatorPicker(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Coordinator
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status || ""} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_STATUS_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {MODULE_STATUS_LABELS[s].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Ceremony Template</Label>
            <Select value={presentationTemplateId} onValueChange={setPresentationTemplateId}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PRESENTATION_TEMPLATES).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_baptized"
              checked={isBaptized}
              onCheckedChange={(checked) => setIsBaptized(checked as boolean)}
            />
            <label
              htmlFor="is_baptized"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Child is baptized
            </label>
          </div>

          <FormField
            id="note"
            label="Notes (Optional)"
            inputType="textarea"
            value={note}
            onChange={setNote}
            placeholder="Enter any additional notes..."
            rows={4}
            description="Additional information or special considerations"
          />
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Presentation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Select the child who will be presented</li>
            <li>• Include both parents in the ceremony</li>
            <li>• Indicate whether the child has been baptized</li>
            <li>• Assign a coordinator to help manage the presentation</li>
            <li>• Add any special notes or considerations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Form Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/presentations/${presentation.id}` : '/presentations'}
        saveLabel={isEditing ? 'Update Presentation' : 'Save Presentation'}
      />

      {/* Event Picker Modals */}
      <EventPicker
        open={showPresentationEventPicker}
        onOpenChange={setShowPresentationEventPicker}
        onSelect={(event) => {
          setPresentationEvent(event)
          setShowPresentationEventPicker(false)
        }}
        selectedEventId={presentationEvent?.id}
        selectedEvent={presentationEvent}
        defaultEventType="PRESENTATION"
        defaultName={EVENT_TYPE_LABELS.PRESENTATION.en}
        openToNewEvent={!isEditing}
        disableSearch={true}
      />

      {/* People Picker Modals */}
      <PeoplePicker
        open={showChildPicker}
        onOpenChange={setShowChildPicker}
        onSelect={(person) => {
          setChild(person)
          setShowChildPicker(false)
        }}
        showSexField={true}
      />

      <PeoplePicker
        open={showMotherPicker}
        onOpenChange={setShowMotherPicker}
        onSelect={(person) => {
          setMother(person)
          setShowMotherPicker(false)
        }}
      />

      <PeoplePicker
        open={showFatherPicker}
        onOpenChange={setShowFatherPicker}
        onSelect={(person) => {
          setFather(person)
          setShowFatherPicker(false)
        }}
      />

      <PeoplePicker
        open={showCoordinatorPicker}
        onOpenChange={setShowCoordinatorPicker}
        onSelect={(person) => {
          setCoordinator(person)
          setShowCoordinatorPicker(false)
        }}
      />
    </form>
  )
}

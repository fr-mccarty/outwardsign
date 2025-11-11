"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar } from "lucide-react"
import {
  createPresentation,
  updatePresentation,
  type PresentationWithRelations
} from "@/lib/actions/presentations"
import {
  createPresentationSchema,
  type CreatePresentationData
} from "@/lib/schemas/presentations"
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

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatePresentationData>({
    resolver: zodResolver(createPresentationSchema),
    defaultValues: {
      presentation_event_id: presentation?.presentation_event_id || null,
      child_id: presentation?.child_id || null,
      mother_id: presentation?.mother_id || null,
      father_id: presentation?.father_id || null,
      coordinator_id: presentation?.coordinator_id || null,
      is_baptized: presentation?.is_baptized || false,
      status: (presentation?.status as "ACTIVE" | "INACTIVE" | "ARCHIVED") || "ACTIVE",
      note: presentation?.note || null,
      presentation_template_id: presentation?.presentation_template_id || "presentation-spanish",
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values for pickers
  const presentationEventId = watch("presentation_event_id")
  const childId = watch("child_id")
  const motherId = watch("mother_id")
  const fatherId = watch("father_id")
  const coordinatorId = watch("coordinator_id")
  const isBaptized = watch("is_baptized")
  const status = watch("status")
  const presentationTemplateId = watch("presentation_template_id")

  // State for picker modals
  const [showPresentationEventPicker, setShowPresentationEventPicker] = useState(false)
  const [showChildPicker, setShowChildPicker] = useState(false)
  const [showMotherPicker, setShowMotherPicker] = useState(false)
  const [showFatherPicker, setShowFatherPicker] = useState(false)
  const [showCoordinatorPicker, setShowCoordinatorPicker] = useState(false)

  // State for selected entities (for display purposes)
  const [presentationEvent, setPresentationEvent] = useState<Event | null>(
    presentation?.presentation_event || null
  )
  const [child, setChild] = useState<Person | null>(presentation?.child || null)
  const [mother, setMother] = useState<Person | null>(presentation?.mother || null)
  const [father, setFather] = useState<Person | null>(presentation?.father || null)
  const [coordinator, setCoordinator] = useState<Person | null>(presentation?.coordinator || null)

  const onSubmit = async (data: CreatePresentationData) => {
    try {
      if (isEditing) {
        await updatePresentation(presentation.id, data)
        toast.success('Presentation updated successfully')
        router.refresh()
      } else {
        const newPresentation = await createPresentation(data)
        toast.success('Presentation created successfully!')
        router.push(`/presentations/${newPresentation.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} presentation:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} presentation. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            {errors.presentation_event_id && (
              <p className="text-sm text-destructive mt-1">{errors.presentation_event_id.message}</p>
            )}
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
              {errors.child_id && (
                <p className="text-sm text-destructive mt-1">{errors.child_id.message}</p>
              )}
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
              {errors.mother_id && (
                <p className="text-sm text-destructive mt-1">{errors.mother_id.message}</p>
              )}
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
              {errors.father_id && (
                <p className="text-sm text-destructive mt-1">{errors.father_id.message}</p>
              )}
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
            <Select
              value={status || ""}
              onValueChange={(value) => setValue("status", value as any)}
            >
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
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Ceremony Template</Label>
            <Select
              value={presentationTemplateId || ""}
              onValueChange={(value) => setValue("presentation_template_id", value)}
            >
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
              checked={isBaptized || false}
              onCheckedChange={(checked) => setValue("is_baptized", checked as boolean)}
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
            value={watch("note") || ""}
            onChange={(value) => setValue("note", value)}
            placeholder="Enter any additional notes..."
            rows={4}
            description="Additional information or special considerations"
          />
          {errors.note && (
            <p className="text-sm text-destructive">{errors.note.message}</p>
          )}
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
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/presentations/${presentation.id}` : '/presentations'}
        saveLabel={isEditing ? 'Update Presentation' : 'Save Presentation'}
      />

      {/* Event Picker Modals */}
      <EventPicker
        open={showPresentationEventPicker}
        onOpenChange={setShowPresentationEventPicker}
        onSelect={(event) => {
          setPresentationEvent(event)
          setValue("presentation_event_id", event.id)
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
          setValue("child_id", person.id)
          setShowChildPicker(false)
        }}
        showSexField={true}
        openToNewPerson={!isEditing}
      />

      <PeoplePicker
        open={showMotherPicker}
        onOpenChange={setShowMotherPicker}
        onSelect={(person) => {
          setMother(person)
          setValue("mother_id", person.id)
          setShowMotherPicker(false)
        }}
        openToNewPerson={!isEditing}
      />

      <PeoplePicker
        open={showFatherPicker}
        onOpenChange={setShowFatherPicker}
        onSelect={(person) => {
          setFather(person)
          setValue("father_id", person.id)
          setShowFatherPicker(false)
        }}
        openToNewPerson={!isEditing}
      />

      <PeoplePicker
        open={showCoordinatorPicker}
        onOpenChange={setShowCoordinatorPicker}
        onSelect={(person) => {
          setCoordinator(person)
          setValue("coordinator_id", person.id)
          setShowCoordinatorPicker(false)
        }}
        openToNewPerson={!isEditing}
      />
    </form>
  )
}

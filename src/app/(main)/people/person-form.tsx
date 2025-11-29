"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassAttendanceSelector } from "@/components/mass-attendance-selector"
import { ImageCropUpload } from "@/components/image-crop-upload"
import { createPerson, updatePerson, uploadPersonAvatar, deletePersonAvatar, getPersonAvatarSignedUrl } from "@/lib/actions/people"
import { generatePronunciation } from "@/lib/actions/generate-pronunciation"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { createPersonSchema, type CreatePersonData } from "@/lib/schemas/people"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface PersonFormProps {
  person?: Person
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function PersonForm({ person, formId = 'person-form', onLoadingChange }: PersonFormProps) {
  const router = useRouter()
  const isEditing = !!person
  const [isGenerating, setIsGenerating] = useState(false)
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null)
  const [pendingAvatarData, setPendingAvatarData] = useState<{ base64: string; extension: string } | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Fetch signed URL for existing avatar on mount
  useEffect(() => {
    async function fetchAvatarUrl() {
      if (person?.avatar_url) {
        try {
          const url = await getPersonAvatarSignedUrl(person.avatar_url)
          setAvatarSignedUrl(url)
        } catch (error) {
          console.error('Failed to get avatar URL:', error)
        }
      }
    }
    fetchAvatarUrl()
  }, [person?.avatar_url])

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatePersonData>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      first_name: person?.first_name || "",
      first_name_pronunciation: person?.first_name_pronunciation || "",
      last_name: person?.last_name || "",
      last_name_pronunciation: person?.last_name_pronunciation || "",
      phone_number: person?.phone_number || "",
      email: person?.email || "",
      street: person?.street || "",
      city: person?.city || "",
      state: person?.state || "",
      zipcode: person?.zipcode || "",
      note: person?.note || "",
      mass_times_template_item_ids: person?.mass_times_template_item_ids || [],
    },
  })

  // Watch form values
  const firstName = watch("first_name")
  const firstNamePronunciation = watch("first_name_pronunciation")
  const lastName = watch("last_name")
  const lastNamePronunciation = watch("last_name_pronunciation")
  const phoneNumber = watch("phone_number")
  const email = watch("email")
  const street = watch("street")
  const city = watch("city")
  const state = watch("state")
  const zipcode = watch("zipcode")
  const note = watch("note")
  const massTimeIds = watch("mass_times_template_item_ids")

  // Sync loading state with parent wrapper
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isSubmitting)
    }
  }, [isSubmitting, onLoadingChange])

  const onSubmit = async (data: CreatePersonData) => {
    try {
      // Convert empty strings to undefined
      const personData = {
        ...data,
        first_name_pronunciation: data.first_name_pronunciation || undefined,
        last_name_pronunciation: data.last_name_pronunciation || undefined,
        phone_number: data.phone_number || undefined,
        email: data.email || undefined,
        street: data.street || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipcode: data.zipcode || undefined,
        note: data.note || undefined,
        mass_times_template_item_ids: data.mass_times_template_item_ids && data.mass_times_template_item_ids.length > 0 ? data.mass_times_template_item_ids : undefined,
      }

      if (isEditing) {
        await updatePerson(person.id, personData)
        toast.success('Person updated successfully')
        router.refresh() // Stay on edit page
      } else {
        const newPerson = await createPerson(personData)

        // Upload avatar if pending (create mode stores base64 until person is created)
        if (pendingAvatarData) {
          try {
            await uploadPersonAvatar(newPerson.id, pendingAvatarData.base64, pendingAvatarData.extension)
          } catch (avatarError) {
            console.error('Failed to upload avatar:', avatarError)
            // Don't fail the whole operation, person was created
            toast.error('Person created but photo upload failed')
          }
        }

        toast.success('Person created successfully!')
        router.push(`/people/${newPerson.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} person:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} person. Please try again.`)
    }
  }

  // Handle image cropped - upload immediately in edit mode, store for later in create mode
  const handleImageCropped = async (base64Data: string, extension: string) => {
    if (isEditing && person) {
      // Edit mode: upload immediately
      try {
        setIsUploadingAvatar(true)
        const storagePath = await uploadPersonAvatar(person.id, base64Data, extension)
        const url = await getPersonAvatarSignedUrl(storagePath)
        setAvatarSignedUrl(url)
        toast.success('Photo uploaded successfully')
      } catch (error) {
        console.error('Failed to upload avatar:', error)
        toast.error('Failed to upload photo')
        throw error // Re-throw to let ImageCropUpload know it failed
      } finally {
        setIsUploadingAvatar(false)
      }
    } else {
      // Create mode: store base64 for upload after person is created
      setPendingAvatarData({ base64: base64Data, extension })
      // Show preview using base64 directly
      setAvatarSignedUrl(base64Data)
      toast.success('Photo ready to upload')
    }
  }

  // Handle image removed
  const handleImageRemoved = async () => {
    if (isEditing && person) {
      // Edit mode: delete from storage
      try {
        setIsUploadingAvatar(true)
        await deletePersonAvatar(person.id)
        setAvatarSignedUrl(null)
        toast.success('Photo removed')
      } catch (error) {
        console.error('Failed to remove avatar:', error)
        toast.error('Failed to remove photo')
        throw error
      } finally {
        setIsUploadingAvatar(false)
      }
    } else {
      // Create mode: just clear pending data
      setPendingAvatarData(null)
      setAvatarSignedUrl(null)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || '?'
  }

  const handleGeneratePronunciations = async () => {
    const currentFirstName = firstName?.trim()
    const currentLastName = lastName?.trim()

    if (!currentFirstName && !currentLastName) {
      toast.error('Please enter both first and last name before generating pronunciations')
      return
    }

    try {
      setIsGenerating(true)
      const result = await generatePronunciation({
        firstName: currentFirstName || '',
        lastName: currentLastName || '',
      })

      // Set pronunciations in form
      setValue('first_name_pronunciation', result.firstNamePronunciation, { shouldValidate: true })
      setValue('last_name_pronunciation', result.lastNamePronunciation, { shouldValidate: true })

      toast.success('Pronunciations generated successfully')
    } catch (error) {
      console.error('Failed to generate pronunciations:', error)
      toast.error('Failed to generate pronunciations. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo Upload Section */}
      <FormSectionCard
        title="Profile Photo"
        description="Upload a photo to help identify this person (optional)"
      >
        <ImageCropUpload
          currentImageUrl={avatarSignedUrl}
          onImageCropped={handleImageCropped}
          onImageRemoved={handleImageRemoved}
          disabled={isSubmitting || isUploadingAvatar}
          fallbackInitials={getInitials()}
        />
      </FormSectionCard>

      <FormSectionCard
        title="Person Details"
        description="Basic information and contact details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="first_name"
            label="First Name"
            value={firstName}
            onChange={(value) => setValue("first_name", value)}
            required
            placeholder="Enter first name"
            error={errors.first_name?.message}
          />

          <FormInput
            id="last_name"
            label="Last Name"
            value={lastName}
            onChange={(value) => setValue("last_name", value)}
            required
            placeholder="Enter last name"
            error={errors.last_name?.message}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="first_name_pronunciation"
              label="First Name Pronunciation (Optional)"
              value={firstNamePronunciation || ""}
              onChange={(value) => setValue("first_name_pronunciation", value)}
              placeholder="How to pronounce first name"
              error={errors.first_name_pronunciation?.message}
            />

            <FormInput
              id="last_name_pronunciation"
              label="Last Name Pronunciation (Optional)"
              value={lastNamePronunciation || ""}
              onChange={(value) => setValue("last_name_pronunciation", value)}
              placeholder="How to pronounce last name"
              error={errors.last_name_pronunciation?.message}
            />
          </div>

          {(firstName || lastName) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeneratePronunciations}
              disabled={isGenerating || isSubmitting}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Pronunciations with AI
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="email"
            label="Email (Optional)"
            inputType="email"
            value={email || ""}
            onChange={(value) => setValue("email", value)}
            placeholder="Enter email address"
            error={errors.email?.message}
          />

          <FormInput
            id="phone_number"
            label="Phone Number (Optional)"
            inputType="tel"
            value={phoneNumber || ""}
            onChange={(value) => setValue("phone_number", value)}
            placeholder="Enter phone number"
            error={errors.phone_number?.message}
          />
        </div>

        <FormInput
          id="street"
          label="Street Address (Optional)"
          value={street || ""}
          onChange={(value) => setValue("street", value)}
          placeholder="Enter street address"
          error={errors.street?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            id="city"
            label="City (Optional)"
            value={city || ""}
            onChange={(value) => setValue("city", value)}
            placeholder="Enter city"
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label="State (Optional)"
            value={state || ""}
            onChange={(value) => setValue("state", value)}
            placeholder="Enter state"
            error={errors.state?.message}
          />

          <FormInput
            id="zipcode"
            label="Zip Code (Optional)"
            value={zipcode || ""}
            onChange={(value) => setValue("zipcode", value)}
            placeholder="Enter zip code"
            error={errors.zipcode?.message}
          />
        </div>

        <FormInput
          id="note"
          label="Notes (Optional)"
          inputType="textarea"
          value={note || ""}
          onChange={(value) => setValue("note", value)}
          placeholder="Enter any additional notes..."
          rows={4}
          error={errors.note?.message}
        />
      </FormSectionCard>

      <FormSectionCard
        title="Mass Attendance"
        description="Select which masses this person typically attends"
      >
        <MassAttendanceSelector
          selectedIds={massTimeIds || []}
          onChange={(ids) => setValue("mass_times_template_item_ids", ids)}
          disabled={isSubmitting}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/people/${person.id}` : "/people"}
        moduleName="Person"
      />
    </form>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { MassAttendanceSelector } from "@/components/mass-attendance-selector"
import { ImageCropUpload } from "@/components/image-crop-upload"
import { PronunciationToggle } from "@/components/pronunciation-toggle"
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { createPerson, updatePerson, uploadPersonAvatar, deletePersonAvatar, getPersonAvatarSignedUrl } from "@/lib/actions/people"
import { generatePronunciation } from "@/lib/actions/generate-pronunciation"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { createPersonSchema, type CreatePersonData } from "@/lib/schemas/people"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkles, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

interface PersonFormProps {
  person?: Person
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function PersonForm({ person, formId = 'person-form', onLoadingChange }: PersonFormProps) {
  const router = useRouter()
  const t = useTranslations()
  const isEditing = !!person
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
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

  // Auto-expand pronunciation section when editing a person with pronunciation data
  useEffect(() => {
    if (isEditing && person) {
      const hasPronunciationData =
        person.first_name_pronunciation || person.last_name_pronunciation
      setShowPronunciation(!!hasPronunciationData)
    }
  }, [isEditing, person])

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
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
    },
  })

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: isEditing && isDirty })

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
        toast.success(t('people.personUpdated'))
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
            toast.error(t('people.personCreatedButPhotoFailed'))
          }
        }

        toast.success(t('people.personCreated'))
        router.push(`/people/${newPerson.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} person:`, error)
      toast.error(isEditing ? t('people.errorUpdating') : t('people.errorCreating'))
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
        toast.success(t('people.photoUploaded'))
      } catch (error) {
        console.error('Failed to upload avatar:', error)
        toast.error(t('people.errorUploadingPhoto'))
        throw error // Re-throw to let ImageCropUpload know it failed
      } finally {
        setIsUploadingAvatar(false)
      }
    } else {
      // Create mode: store base64 for upload after person is created
      setPendingAvatarData({ base64: base64Data, extension })
      // Show preview using base64 directly
      setAvatarSignedUrl(base64Data)
      toast.success(t('people.photoReadyToUpload'))
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
        toast.success(t('people.photoRemoved'))
      } catch (error) {
        console.error('Failed to remove avatar:', error)
        toast.error(t('people.errorRemovingPhoto'))
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
      toast.error(t('people.enterBothNames'))
      return
    }

    try {
      setIsGenerating(true)
      const result = await generatePronunciation({
        firstName: currentFirstName || '',
        lastName: currentLastName || '',
      })

      // Set pronunciations in form
      setValue('first_name_pronunciation', result.firstNamePronunciation, { shouldValidate: true, shouldDirty: true })
      setValue('last_name_pronunciation', result.lastNamePronunciation, { shouldValidate: true, shouldDirty: true })

      toast.success(t('people.pronunciationsGenerated'))
    } catch (error) {
      console.error('Failed to generate pronunciations:', error)
      toast.error(t('people.errorGeneratingPronunciations'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
      {/* Photo Upload Section */}
      <FormSectionCard
        title={t('people.profilePhoto')}
        description={t('people.profilePhotoDescription')}
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
        title={t('people.personDetails')}
        description={t('people.personDetailsDescription')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="first_name"
            label={t('people.firstName')}
            value={firstName}
            onChange={(value) => setValue("first_name", value, { shouldDirty: true })}
            required
            placeholder={t('people.firstNamePlaceholder')}
            error={errors.first_name?.message}
          />

          <FormInput
            id="last_name"
            label={t('people.lastName')}
            value={lastName}
            onChange={(value) => setValue("last_name", value, { shouldDirty: true })}
            required
            placeholder={t('people.lastNamePlaceholder')}
            error={errors.last_name?.message}
          />
        </div>

        <div className="space-y-4">
          {/* Pronunciation Toggle */}
          <PronunciationToggle
            isExpanded={showPronunciation}
            onToggle={() => setShowPronunciation(!showPronunciation)}
          />

          {/* Pronunciation Fields - shown when toggle is expanded */}
          {showPronunciation && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  id="first_name_pronunciation"
                  label={t('people.firstNamePronunciation')}
                  value={firstNamePronunciation || ""}
                  onChange={(value) => setValue("first_name_pronunciation", value, { shouldDirty: true })}
                  placeholder={t('people.firstNamePronunciationPlaceholder')}
                  error={errors.first_name_pronunciation?.message}
                  description={t('people.firstNamePronunciationDescription')}
                />

                <FormInput
                  id="last_name_pronunciation"
                  label={t('people.lastNamePronunciation')}
                  value={lastNamePronunciation || ""}
                  onChange={(value) => setValue("last_name_pronunciation", value, { shouldDirty: true })}
                  placeholder={t('people.lastNamePronunciationPlaceholder')}
                  error={errors.last_name_pronunciation?.message}
                  description={t('people.lastNamePronunciationDescription')}
                />
              </div>

              {/* Generate Pronunciations Button - shown when name exists */}
              {(firstName || lastName) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePronunciations}
                      disabled={isGenerating || isSubmitting}
                      className="mt-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('people.generating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {t('people.generatePronunciations')}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>{t('people.generatePronunciationsTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="email"
            label={t('people.email')}
            inputType="email"
            value={email || ""}
            onChange={(value) => setValue("email", value, { shouldDirty: true })}
            placeholder={t('people.emailPlaceholder')}
            error={errors.email?.message}
          />

          <FormInput
            id="phone_number"
            label={t('people.phoneNumber')}
            inputType="tel"
            value={phoneNumber || ""}
            onChange={(value) => setValue("phone_number", value, { shouldDirty: true })}
            placeholder={t('people.phoneNumberPlaceholder')}
            error={errors.phone_number?.message}
          />
        </div>

        <FormInput
          id="street"
          label={t('people.streetAddress')}
          value={street || ""}
          onChange={(value) => setValue("street", value, { shouldDirty: true })}
          placeholder={t('people.streetAddressPlaceholder')}
          error={errors.street?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            id="city"
            label={t('people.city')}
            value={city || ""}
            onChange={(value) => setValue("city", value, { shouldDirty: true })}
            placeholder={t('people.cityPlaceholder')}
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label={t('people.state')}
            value={state || ""}
            onChange={(value) => setValue("state", value, { shouldDirty: true })}
            placeholder={t('people.statePlaceholder')}
            error={errors.state?.message}
          />

          <FormInput
            id="zipcode"
            label={t('people.zipCode')}
            value={zipcode || ""}
            onChange={(value) => setValue("zipcode", value, { shouldDirty: true })}
            placeholder={t('people.zipCodePlaceholder')}
            error={errors.zipcode?.message}
          />
        </div>

        <FormInput
          id="note"
          label={t('people.notes')}
          inputType="textarea"
          value={note || ""}
          onChange={(value) => setValue("note", value, { shouldDirty: true })}
          placeholder={t('people.notesPlaceholder')}
          rows={4}
          error={errors.note?.message}
        />
      </FormSectionCard>

      <FormSectionCard
        title={t('people.massAttendance')}
        description={t('people.massAttendanceDescription')}
      >
        <MassAttendanceSelector
          selectedIds={massTimeIds || []}
          onChange={(ids) => setValue("mass_times_template_item_ids", ids, { shouldDirty: true })}
          disabled={isSubmitting}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/people/${person.id}` : "/people"}
        moduleName="Person"
        isDirty={isEditing && isDirty}
        onNavigate={unsavedChanges.handleNavigation}
      />

      <UnsavedChangesDialog
        open={unsavedChanges.showDialog}
        onConfirm={unsavedChanges.confirmNavigation}
        onCancel={unsavedChanges.cancelNavigation}
      />
    </form>
  )
}

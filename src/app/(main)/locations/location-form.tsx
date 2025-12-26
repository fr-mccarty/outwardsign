"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createLocation, updateLocation } from "@/lib/actions/locations"
import { createLocationSchema, type CreateLocationData } from "@/lib/schemas/locations"
import type { Location } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useTranslations } from 'next-intl'
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

interface LocationFormProps {
  location?: Location
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function LocationForm({ location, formId, onLoadingChange }: LocationFormProps) {
  const router = useRouter()
  const t = useTranslations('locations')
  const isEditing = !!location

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    watch,
  } = useForm<CreateLocationData>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: location?.name || "",
      description: location?.description || "",
      street: location?.street || "",
      city: location?.city || "",
      state: location?.state || "",
      country: location?.country || "",
      phone_number: location?.phone_number || "",
    },
  })

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: isEditing && isDirty })

  // Watch all form values for FormInput onChange callbacks
  const name = watch("name")
  const description = watch("description")
  const street = watch("street")
  const city = watch("city")
  const state = watch("state")
  const country = watch("country")
  const phoneNumber = watch("phone_number")

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  const onSubmit = async (data: CreateLocationData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const locationData: CreateLocationData = {
        name: data.name,
        description: data.description || undefined,
        street: data.street || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        phone_number: data.phone_number || undefined,
      }

      if (isEditing) {
        await updateLocation(location.id, locationData)
        toast.success(t('locationUpdated'))
        router.refresh() // Refresh to get updated data
      } else {
        const newLocation = await createLocation(locationData)
        toast.success(t('locationCreated'))
        router.push(`/locations/${newLocation.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} location:`, error)
      toast.error(isEditing ? t('errorUpdating') : t('errorCreating'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={formId} className={FORM_SECTIONS_SPACING}>
      {/* Basic Information */}
      <FormSectionCard
        title={t('basicInformation')}
        description={t('basicInformationDescription')}
      >
        <FormInput
          id="name"
          label={t('locationName')}
          value={name}
          onChange={(value) => setValue("name", value)}
          required
          placeholder={t('locationNamePlaceholder')}
          error={errors.name?.message}
        />

        <FormInput
          id="description"
          label={t('descriptionLabel')}
          inputType="textarea"
          value={description ?? ""}
          onChange={(value) => setValue("description", value)}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          error={errors.description?.message}
        />
      </FormSectionCard>

      {/* Address */}
      <FormSectionCard
        title={t('addressSection')}
        description={t('addressSectionDescription')}
      >
        <FormInput
          id="street"
          label={t('streetAddress')}
          value={street ?? ""}
          onChange={(value) => setValue("street", value)}
          placeholder={t('streetAddressPlaceholder')}
          error={errors.street?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="city"
            label={t('city')}
            value={city ?? ""}
            onChange={(value) => setValue("city", value)}
            placeholder={t('cityPlaceholder')}
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label={t('state')}
            value={state ?? ""}
            onChange={(value) => setValue("state", value)}
            placeholder={t('statePlaceholder')}
            error={errors.state?.message}
          />
        </div>

        <FormInput
          id="country"
          label={t('country')}
          value={country ?? ""}
          onChange={(value) => setValue("country", value)}
          placeholder={t('countryPlaceholder')}
          error={errors.country?.message}
        />
      </FormSectionCard>

      {/* Contact Information */}
      <FormSectionCard
        title={t('contactInformation')}
        description={t('contactInformationDescription')}
      >
        <FormInput
          id="phone_number"
          label={t('phoneNumber')}
          inputType="tel"
          value={phoneNumber ?? ""}
          onChange={(value) => setValue("phone_number", value)}
          placeholder={t('phoneNumberPlaceholder')}
          error={errors.phone_number?.message}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        cancelHref="/locations"
        isLoading={isSubmitting}
        moduleName={t('title')}
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

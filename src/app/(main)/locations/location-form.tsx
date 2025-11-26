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

interface LocationFormProps {
  location?: Location
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function LocationForm({ location, formId, onLoadingChange }: LocationFormProps) {
  const router = useRouter()
  const isEditing = !!location

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
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
        toast.success('Location updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newLocation = await createLocation(locationData)
        toast.success('Location created successfully!')
        router.push(`/locations/${newLocation.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} location:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} location. Please try again.`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={formId} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Location name and description"
      >
        <FormInput
          id="name"
          label="Location Name"
          value={name}
          onChange={(value) => setValue("name", value)}
          required
          placeholder="Enter location name"
          error={errors.name?.message}
        />

        <FormInput
          id="description"
          label="Description"
          inputType="textarea"
          value={description ?? ""}
          onChange={(value) => setValue("description", value)}
          placeholder="Enter location description..."
          rows={3}
          error={errors.description?.message}
        />
      </FormSectionCard>

      {/* Address */}
      <FormSectionCard
        title="Address"
        description="Location address details"
      >
        <FormInput
          id="street"
          label="Street Address"
          value={street ?? ""}
          onChange={(value) => setValue("street", value)}
          placeholder="Enter street address"
          error={errors.street?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="city"
            label="City"
            value={city ?? ""}
            onChange={(value) => setValue("city", value)}
            placeholder="Enter city"
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label="State"
            value={state ?? ""}
            onChange={(value) => setValue("state", value)}
            placeholder="Enter state"
            error={errors.state?.message}
          />
        </div>

        <FormInput
          id="country"
          label="Country"
          value={country ?? ""}
          onChange={(value) => setValue("country", value)}
          placeholder="Enter country"
          error={errors.country?.message}
        />
      </FormSectionCard>

      {/* Contact Information */}
      <FormSectionCard
        title="Contact Information"
        description="Phone number for this location"
      >
        <FormInput
          id="phone_number"
          label="Phone Number"
          inputType="tel"
          value={phoneNumber ?? ""}
          onChange={(value) => setValue("phone_number", value)}
          placeholder="Enter phone number"
          error={errors.phone_number?.message}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        cancelHref="/locations"
        isLoading={isSubmitting}
        moduleName="Location"
      />
    </form>
  )
}

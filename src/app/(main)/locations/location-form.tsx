"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { FormSectionCard } from "@/components/form-section-card"
import { createLocation, updateLocation, type CreateLocationData } from "@/lib/actions/locations"
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
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const [name, setName] = useState(location?.name || "")
  const [description, setDescription] = useState(location?.description || "")
  const [street, setStreet] = useState(location?.street || "")
  const [city, setCity] = useState(location?.city || "")
  const [state, setState] = useState(location?.state || "")
  const [country, setCountry] = useState(location?.country || "")
  const [phoneNumber, setPhoneNumber] = useState(location?.phone_number || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const locationData: CreateLocationData = {
        name,
        description: description || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        phone_number: phoneNumber || undefined,
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} id={formId} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Location name and description"
      >
        <FormField
          id="name"
          label="Location Name"
          value={name}
          onChange={setName}
          required
          placeholder="Enter location name"
        />

        <FormField
          id="description"
          label="Description"
          inputType="textarea"
          value={description}
          onChange={setDescription}
          placeholder="Enter location description..."
          rows={3}
        />
      </FormSectionCard>

      {/* Address */}
      <FormSectionCard
        title="Address"
        description="Location address details"
      >
        <FormField
          id="street"
          label="Street Address"
          value={street}
          onChange={setStreet}
          placeholder="Enter street address"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="city"
            label="City"
            value={city}
            onChange={setCity}
            placeholder="Enter city"
          />

          <FormField
            id="state"
            label="State"
            value={state}
            onChange={setState}
            placeholder="Enter state"
          />
        </div>

        <FormField
          id="country"
          label="Country"
          value={country}
          onChange={setCountry}
          placeholder="Enter country"
        />
      </FormSectionCard>

      {/* Contact Information */}
      <FormSectionCard
        title="Contact Information"
        description="Phone number for this location"
      >
        <FormField
          id="phone_number"
          label="Phone Number"
          inputType="tel"
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="Enter phone number"
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        cancelHref="/locations"
        isLoading={isLoading}
        saveLabel={isEditing ? "Save Changes" : "Create Location"}
      />
    </form>
  )
}

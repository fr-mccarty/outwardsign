'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { FormSectionCard } from '@/components/form-section-card'
import { ContentCard } from '@/components/content-card'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormInput } from '@/components/form-input'
import { Save } from "lucide-react"
import { updateParish, updateParishSettings } from '@/lib/actions/setup'
import { Parish, ParishSettings } from '@/lib/types'
import { toast } from 'sonner'

interface ParishGeneralSettingsClientProps {
  parish: Parish
  parishSettings: ParishSettings | null
}

export function ParishGeneralSettingsClient({
  parish,
  parishSettings
}: ParishGeneralSettingsClientProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: parish.name,
    city: parish.city,
    state: parish.state || '',
    country: parish.country
  })
  const [liturgicalLocale, setLiturgicalLocale] = useState(parishSettings?.liturgical_locale || 'en_US')
  const [saving, setSaving] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateParish(parish.id, formData)
      toast.success('Parish information updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating parish:', error)
      toast.error('Failed to update parish information')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLiturgicalLocale = async () => {
    setSaving(true)
    try {
      await updateParishSettings(parish.id, { liturgical_locale: liturgicalLocale })
      toast.success('Liturgical locale updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating liturgical locale:', error)
      toast.error('Failed to update liturgical locale')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer
      title="General Settings"
      description="Manage your parish information and liturgical settings"
      primaryAction={
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <FormSectionCard title="Parish Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormInput
              id="name"
              label="Parish Name"
              value={formData.name}
              onChange={(value) => handleChange('name', value)}
              placeholder="St. Mary's Catholic Church"
              required
            />
          </div>

          <div>
            <FormInput
              id="city"
              label="City"
              value={formData.city}
              onChange={(value) => handleChange('city', value)}
              placeholder="New York"
              required
            />
          </div>

          <div>
            <FormInput
              id="state"
              label="State"
              value={formData.state}
              onChange={(value) => handleChange('state', value)}
              placeholder="New York"
            />
          </div>

          <div>
            <FormInput
              id="country"
              label="Country"
              value={formData.country}
              onChange={(value) => handleChange('country', value)}
              placeholder="United States"
              required
            />
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Liturgical Settings"
        description="This determines which liturgical calendar events are imported from the API"
      >
        <FormInput
          id="liturgical-locale"
          label="Liturgical Calendar Locale"
          inputType="select"
          value={liturgicalLocale}
          onChange={setLiturgicalLocale}
          options={[
            { value: 'en_US', label: 'English (United States)' },
            { value: 'es_MX', label: 'Spanish (Mexico)' },
            { value: 'es_ES', label: 'Spanish (Spain)' },
            { value: 'fr_FR', label: 'French (France)' },
            { value: 'pt_BR', label: 'Portuguese (Brazil)' }
          ]}
        />
        <div className="flex justify-end">
          <Button onClick={handleSaveLiturgicalLocale} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Locale'}
          </Button>
        </div>
      </FormSectionCard>

      <ContentCard>
        <div>
          <h3 className="font-semibold mb-4">Parish Details</h3>
          <div>
            <Label className="text-muted-foreground">Created</Label>
            <p className="mt-1 text-sm">{new Date(parish.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  )
}

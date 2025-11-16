'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createParish, populateInitialParishData } from '@/lib/actions/setup'
import { setSelectedParish } from '@/lib/auth/parish'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface CreateParishFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export function CreateParishForm({ onCancel, onSuccess }: CreateParishFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: ''
  })
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setCreating(true)

    try {
      const result = await createParish(formData)

      // Populate initial parish data (readings, petition templates, group roles, mass roles)
      try {
        await populateInitialParishData(result.parish.id)
      } catch (seedError) {
        console.error('Error seeding parish data:', seedError)
        // Continue anyway - parish is created, just missing seed data
        toast.error('Parish created but some initial data failed to load')
      }

      toast.success('Parish created successfully!')

      // Set the new parish as selected
      await setSelectedParish(result.parish.id)

      // Call success callback
      onSuccess()

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating parish:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create parish')
    } finally {
      setCreating(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Parish</CardTitle>
        <CardDescription>
          Create a new parish and become its administrator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="name"
            label="Parish Name"
            value={formData.name}
            onChange={(value) => handleChange('name', value)}
            placeholder="St. Mary's Catholic Church"
            required
          />

          <FormField
            id="city"
            label="City"
            value={formData.city}
            onChange={(value) => handleChange('city', value)}
            placeholder="New York"
            required
          />

          <FormField
            id="state"
            label="State"
            value={formData.state}
            onChange={(value) => handleChange('state', value)}
            placeholder="NY"
            maxLength={2}
            required
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? 'Creating...' : 'Create Parish'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
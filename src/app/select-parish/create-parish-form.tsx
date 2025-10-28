'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createParish } from '@/lib/actions/setup'
import { setSelectedParish } from '@/lib/auth/parish'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      toast.success('Parish created successfully!')
      
      // Set the new parish as selected
      await setSelectedParish(result.parish.id)
      
      // Call success callback
      onSuccess()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating parish:', error)
      toast.error('Failed to create parish')
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
          <div className="space-y-2">
            <Label htmlFor="name">Parish Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="St. Mary's Catholic Church"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="New York"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="NY"
              maxLength={2}
              required
            />
          </div>

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
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, X } from "lucide-react"
import { Person, MassRole, MassRolePreference } from "@/lib/types"
import { createMassRolePreference, updateMassRolePreference, deleteMassRolePreference } from "@/lib/actions/mass-role-preferences"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MassRolePreferencesFormProps {
  person: Person
  preferences: MassRolePreference[]
  massRoles: MassRole[]
}

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const FREQUENCY_OPTIONS = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'OCCASIONAL'] as const

export function MassRolePreferencesForm({
  person,
  preferences,
  massRoles
}: MassRolePreferencesFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [editingPref, setEditingPref] = useState<MassRolePreference | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [preferredDays, setPreferredDays] = useState<string[]>([])
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [unavailableDays, setUnavailableDays] = useState<string[]>([])
  const [desiredFrequency, setDesiredFrequency] = useState<typeof FREQUENCY_OPTIONS[number] | ''>('')
  const [maxPerMonth, setMaxPerMonth] = useState('')
  const [notes, setNotes] = useState('')

  const startEdit = (pref: MassRolePreference) => {
    setEditingPref(pref)
    setSelectedRole(pref.mass_role_id)
    setPreferredDays(pref.preferred_days || [])
    setAvailableDays(pref.available_days || [])
    setUnavailableDays(pref.unavailable_days || [])
    setDesiredFrequency((pref.desired_frequency as typeof FREQUENCY_OPTIONS[number]) || '')
    setMaxPerMonth(pref.max_per_month?.toString() || '')
    setNotes(pref.notes || '')
    setIsCreating(false)
  }

  const startCreate = () => {
    setEditingPref(null)
    setSelectedRole(null)
    setPreferredDays([])
    setAvailableDays([])
    setUnavailableDays([])
    setDesiredFrequency('')
    setMaxPerMonth('')
    setNotes('')
    setIsCreating(true)
  }

  const cancelEdit = () => {
    setEditingPref(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data = {
        person_id: person.id,
        mass_role_id: selectedRole,
        preferred_days: preferredDays.length > 0 ? preferredDays : undefined,
        available_days: availableDays.length > 0 ? availableDays : undefined,
        unavailable_days: unavailableDays.length > 0 ? unavailableDays : undefined,
        desired_frequency: desiredFrequency || undefined,
        max_per_month: maxPerMonth ? parseInt(maxPerMonth) : undefined,
        notes: notes || undefined,
        active: true
      }

      if (editingPref) {
        await updateMassRolePreference(editingPref.id, data)
        toast.success('Preferences updated successfully')
      } else {
        await createMassRolePreference(data)
        toast.success('Preferences created successfully')
      }

      cancelEdit()
      router.refresh()
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (prefId: string) => {
    if (!confirm('Are you sure you want to delete these preferences?')) {
      return
    }

    setIsSaving(true)
    try {
      await deleteMassRolePreference(prefId)
      toast.success('Preferences deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting preferences:', error)
      toast.error('Failed to delete preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDay = (day: string, list: string[], setter: (days: string[]) => void) => {
    if (list.includes(day)) {
      setter(list.filter(d => d !== day))
    } else {
      setter([...list, day])
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Role Preferences</CardTitle>
          {!isCreating && !editingPref && (
            <Button onClick={startCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Preference
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Existing preferences */}
          {!isCreating && !editingPref && (
            <div className="space-y-4">
              {preferences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No preferences set</p>
                  <Button variant="link" onClick={startCreate} className="mt-2">
                    Add your first preference
                  </Button>
                </div>
              ) : (
                preferences.map((pref) => (
                  <div key={pref.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {pref.mass_role_id ? 'Role-Specific' : 'General Preferences'}
                        </h4>
                        {pref.desired_frequency && (
                          <Badge variant="secondary">{pref.desired_frequency}</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(pref)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(pref.id)}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {pref.preferred_days && pref.preferred_days.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Preferred:</span>{' '}
                        {pref.preferred_days.join(', ')}
                      </div>
                    )}
                    {pref.max_per_month && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Max/month:</span>{' '}
                        {pref.max_per_month}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Edit/Create form */}
          {(isCreating || editingPref) && (
            <div className="space-y-6 border rounded-lg p-6 bg-muted/50">
              <div className="space-y-4">
                {/* Role selection */}
                <div className="space-y-2">
                  <Label>Mass Role (Optional)</Label>
                  <Select
                    value={selectedRole || 'general'}
                    onValueChange={(value) => setSelectedRole(value === 'general' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Preferences</SelectItem>
                      {massRoles.filter(r => r.is_active).map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred days */}
                <div className="space-y-2">
                  <Label>Preferred Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`preferred-${day}`}
                          checked={preferredDays.includes(day)}
                          onCheckedChange={() => toggleDay(day, preferredDays, setPreferredDays)}
                        />
                        <label
                          htmlFor={`preferred-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day.slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unavailable days */}
                <div className="space-y-2">
                  <Label>Unavailable Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`unavailable-${day}`}
                          checked={unavailableDays.includes(day)}
                          onCheckedChange={() => toggleDay(day, unavailableDays, setUnavailableDays)}
                        />
                        <label
                          htmlFor={`unavailable-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day.slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label>Desired Frequency</Label>
                  <Select
                    value={desiredFrequency}
                    onValueChange={(value) => setDesiredFrequency(value as typeof FREQUENCY_OPTIONS[number])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Max per month */}
                <div className="space-y-2">
                  <Label htmlFor="max-per-month">Maximum Assignments Per Month</Label>
                  <Input
                    id="max-per-month"
                    type="number"
                    min="0"
                    value={maxPerMonth}
                    onChange={(e) => setMaxPerMonth(e.target.value)}
                    placeholder="e.g., 4"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special notes or requirements..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

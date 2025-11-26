'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SettingsPage } from '@/components/settings-page'
import { FormInput } from '@/components/form-input'
import { Save, User, Globe, RefreshCw } from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useAppContext } from '@/contexts/AppContextProvider'
import type { UserSettings } from '@/contexts/AppContextProvider'
import { toast } from 'sonner'

export default function UserSettingsPage() {
  const { user, userSettings, isLoading, refreshSettings, updateSettings } = useAppContext()
  const [formData, setFormData] = useState<Partial<UserSettings> | null>(null)
  const [saving, setSaving] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "User Preferences" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (userSettings) {
      setFormData(userSettings)
    }
  }, [userSettings])

  const handleSave = async () => {
    if (!formData || !userSettings) {
      console.error('No form data or user settings available')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        language: formData.language || userSettings.language
      }

      await updateSettings(updateData)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (updates: Partial<UserSettings>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null)
  }

  if (isLoading || !formData) {
    return (
      <SettingsPage
        title="User Preferences"
        description="Customize your liturgical planning experience"
        tabs={[]}
      />
    )
  }

  if (!user) {
    return (
      <SettingsPage
        title="User Preferences"
        description="Customize your liturgical planning experience"
        tabs={[
          {
            value: 'general',
            label: 'General',
            icon: <Globe className="h-4 w-4" />,
            content: (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Not Signed In</h3>
                  <p className="text-muted-foreground">
                    Please sign in to access your user settings.
                  </p>
                </CardContent>
              </Card>
            )
          }
        ]}
      />
    )
  }

  const tabs = [
    {
      value: 'general',
      label: 'General',
      icon: <Globe className="h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Language and Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormInput
              id="language"
              label="Preferred Language"
              description="Your interface language preference"
              inputType="select"
              value={formData.language || 'en'}
              onChange={(value: string) => updateFormData({ language: value as 'en' | 'es' | 'fr' | 'la' })}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español (Spanish)' },
                { value: 'fr', label: 'Français (French)' },
                { value: 'la', label: 'Latina (Latin)' }
              ]}
            />
          </CardContent>
        </Card>
      )
    },
    {
      value: 'account',
      label: 'Account',
      icon: <User className="h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <p className="mt-1 text-sm font-mono text-muted-foreground">{user.id}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Account Created</Label>
              <p className="mt-1 text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            {userSettings && (
              <div>
                <Label className="text-muted-foreground">Settings Last Updated</Label>
                <p className="mt-1 text-sm">{new Date(userSettings.updated_at).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }
  ]

  return (
    <SettingsPage
      title="User Preferences"
      description="Customize your liturgical planning experience"
      tabs={tabs}
      defaultTab="general"
      actions={
        <>
          <Button onClick={refreshSettings} variant="outline" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    />
  )
}

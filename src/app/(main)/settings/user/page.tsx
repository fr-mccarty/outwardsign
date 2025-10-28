'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageContainer } from '@/components/page-container'
import { Save, User, Globe, Printer, BookOpen, RefreshCw } from "lucide-react"
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
      // Only send the fields that are managed by this form
      // Don't send selected_parish_id since it's not part of this form
      const updateData = {
        language: formData.language || userSettings.language,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url
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

  if (isLoading) {
    return <div className="space-y-6">Loading user settings...</div>
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Not Signed In</h3>
            <p className="text-muted-foreground">
              Please sign in to access your user settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!formData) {
    return <div className="space-y-6">Loading settings...</div>
  }

  return (
    <PageContainer
      title="User Preferences"
      description="Customize your liturgical planning experience"
      maxWidth="4xl"
    >
      <div className="flex justify-end mb-6 gap-3">
        <Button onClick={refreshSettings} variant="outline" disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={handleSave} disabled={saving || !formData}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="liturgical" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Liturgical
          </TabsTrigger>
          <TabsTrigger value="print" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language and Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <Input
                    className="mt-1"
                    placeholder="Enter your full name"
                    value={formData.full_name || ''}
                    onChange={(e) => updateFormData({ full_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Preferred Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value: 'en' | 'es' | 'fr' | 'la') => 
                      updateFormData({ language: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="la">Latina (Latin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* TODO: Add default_petition_type to UserSettings interface first
                <div>
                  <Label className="text-sm font-medium">Default Petition Type</Label>
                  <Select 
                    value={formData.default_petition_type} 
                    onValueChange={(value: 'daily' | 'sunday' | 'wedding' | 'funeral') => 
                      updateFormData({ default_petition_type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Mass</SelectItem>
                      <SelectItem value="sunday">Sunday Mass</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="funeral">Funeral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                */}

                {/* TODO: Add these fields to UserSettings interface 
                <div>
                  <Label className="text-sm font-medium">Default Font Size</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                */}
              </div>

              {/* TODO: Add auto_include_petitions to UserSettings interface 
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-petitions" />
                <Label htmlFor="auto-petitions" className="text-sm font-medium">
                  Automatically include petitions in new reading collections
                </Label>
              </div>
              */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liturgical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liturgical Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Additional liturgical preferences will be available here in future updates.
                Currently, your language preference controls the liturgical content language.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Print Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Print customization options will be available here in future updates.
                Current print pages use optimized layouts for liturgical materials.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="mt-1 font-medium">{userSettings?.full_name || 'Not set'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="mt-1 font-medium">{user.email}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <p className="mt-1 text-sm font-mono text-muted-foreground">{user.id}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                <p className="mt-1 text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>

              {userSettings && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Settings Last Updated</Label>
                  <p className="mt-1 text-sm">{new Date(userSettings.updated_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
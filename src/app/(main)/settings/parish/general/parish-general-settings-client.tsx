'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageContainer } from '@/components/page-container'
import { FormSectionCard } from '@/components/form-section-card'
import { ContentCard } from '@/components/content-card'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormInput } from '@/components/form-input'
import { Save, Calendar, Copy, Check, RefreshCw } from "lucide-react"
import { updateParish, updateParishSettings, checkSlugAvailability } from '@/lib/actions/setup'
import { Parish, ParishSettings } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SECTION_SPACING } from '@/lib/constants/form-spacing'
import { TIMEZONE_OPTIONS, PRIMARY_LANGUAGE_OPTIONS } from '@/lib/constants'

// Slug validation schema
const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .regex(/^[a-z]/, 'Slug must start with a letter')
  .regex(/[a-z0-9]$/, 'Slug must end with a letter or number')

// Parish form schema
const parishFormSchema = z.object({
  name: z.string().min(1, 'Parish name is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().trim().optional(),
  country: z.string().min(1, 'Country is required').trim(),
  slug: slugSchema.optional().or(z.literal('')),
})

type ParishFormData = z.infer<typeof parishFormSchema>

interface ParishGeneralSettingsClientProps {
  parish: Parish
  parishSettings: ParishSettings | null
}

export function ParishGeneralSettingsClient({
  parish,
  parishSettings
}: ParishGeneralSettingsClientProps) {
  const router = useRouter()
  const [liturgicalLocale, setLiturgicalLocale] = useState(parishSettings?.liturgical_locale || 'en_US')
  const [timezone, setTimezone] = useState(parishSettings?.timezone || 'America/Chicago')
  const [primaryLanguage, setPrimaryLanguage] = useState(parishSettings?.primary_language || 'en')
  const [publicCalendarEnabled, setPublicCalendarEnabled] = useState(parishSettings?.public_calendar_enabled || false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const form = useForm<ParishFormData>({
    resolver: zodResolver(parishFormSchema),
    defaultValues: {
      name: parish.name,
      city: parish.city,
      state: parish.state || '',
      country: parish.country || '',
      slug: parish.slug || '',
    },
  })

  const currentSlug = form.watch('slug')

  // Generate the calendar feed URL using the parish slug
  const calendarFeedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/calendar/${parish.slug || parish.id}`
    : `/api/calendar/${parish.slug || parish.id}`

  // Check slug availability when it changes
  useEffect(() => {
    const checkSlug = async () => {
      if (!currentSlug || currentSlug === parish.slug || currentSlug.length < 3) {
        setSlugAvailable(null)
        return
      }

      // Validate format first
      const result = slugSchema.safeParse(currentSlug)
      if (!result.success) {
        setSlugAvailable(null)
        return
      }

      setCheckingSlug(true)
      try {
        const available = await checkSlugAvailability(currentSlug, parish.id)
        setSlugAvailable(available)
      } catch {
        setSlugAvailable(null)
      } finally {
        setCheckingSlug(false)
      }
    }

    const timeoutId = setTimeout(checkSlug, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [currentSlug, parish.slug, parish.id])

  const onSubmit = async (data: ParishFormData) => {
    setSaving(true)
    try {
      // Check if slug changed and is available
      if (data.slug && data.slug !== parish.slug) {
        const available = await checkSlugAvailability(data.slug, parish.id)
        if (!available) {
          form.setError('slug', { message: 'This URL slug is already taken' })
          setSaving(false)
          return
        }
      }

      await updateParish(parish.id, {
        name: data.name,
        city: data.city,
        state: data.state || undefined,
        country: data.country,
        slug: data.slug || undefined,
      })

      // Also save liturgical locale, timezone, and primary language
      await updateParishSettings(parish.id, {
        liturgical_locale: liturgicalLocale,
        timezone: timezone,
        primary_language: primaryLanguage,
      })

      toast.success('Settings updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating parish:', error)
      toast.error('Failed to update parish information')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublicCalendar = async (enabled: boolean) => {
    setPublicCalendarEnabled(enabled)
    setSaving(true)
    try {
      await updateParishSettings(parish.id, { public_calendar_enabled: enabled })
      toast.success(enabled ? 'Public calendar enabled' : 'Public calendar disabled')
      router.refresh()
    } catch (error) {
      console.error('Error updating public calendar setting:', error)
      toast.error('Failed to update calendar setting')
      setPublicCalendarEnabled(!enabled) // Revert on error
    } finally {
      setSaving(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(calendarFeedUrl)
      setCopied(true)
      toast.success('Calendar URL copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  // Generate slug from name
  const generateSlugFromName = () => {
    const name = form.getValues('name')
    if (!name) return

    const slug = name
      .toLowerCase()
      .replace(/'/g, '') // Remove apostrophes
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

    form.setValue('slug', slug, { shouldValidate: true })
  }

  return (
    <PageContainer
      title="General Settings"
      description="Manage your parish information and liturgical settings"
      primaryAction={
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <div className={SECTION_SPACING}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={SECTION_SPACING}>
            <FormSectionCard title="Parish Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parish Name</FormLabel>
                        <FormControl>
                          <Input placeholder="St. Mary's Catholic Church" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSectionCard>

            <FormSectionCard
              title="URL Settings"
              description="Your parish's unique URL slug is used for calendar feeds and public-facing links"
            >
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <div className="relative flex-1">
                          <Input
                            placeholder="st-marys-catholic-church"
                            {...field}
                            className={
                              slugAvailable === true
                                ? 'border-green-500 focus-visible:ring-green-500'
                                : slugAvailable === false
                                  ? 'border-destructive focus-visible:ring-destructive'
                                  : ''
                            }
                          />
                          {checkingSlug && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {!checkingSlug && slugAvailable === true && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Check className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSlugFromName}
                        className="shrink-0"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    <FormDescription>
                      Lowercase letters, numbers, and hyphens only. Used in URLs like /api/calendar/your-slug
                    </FormDescription>
                    <FormMessage />
                    {slugAvailable === false && !form.formState.errors.slug && (
                      <p className="text-sm text-destructive">This URL slug is already taken</p>
                    )}
                  </FormItem>
                )}
              />
            </FormSectionCard>
          </form>
        </Form>

        <FormSectionCard
          title="Regional Settings"
          description="Configure timezone and liturgical calendar settings for your parish"
        >
          <div className="space-y-6">
            <FormInput
              id="timezone"
              label="Timezone"
              inputType="select"
              value={timezone}
              onChange={setTimezone}
              description="Used for calendar feeds and event time display"
              options={[...TIMEZONE_OPTIONS]}
            />
            <FormInput
              id="liturgical-locale"
              label="Liturgical Calendar Locale"
              inputType="select"
              value={liturgicalLocale}
              onChange={setLiturgicalLocale}
              description="Determines which liturgical calendar events are imported"
              options={[
                { value: 'en_US', label: 'English (United States)' },
                { value: 'es_MX', label: 'Spanish (Mexico)' },
                { value: 'es_ES', label: 'Spanish (Spain)' },
                { value: 'fr_FR', label: 'French (France)' },
                { value: 'pt_BR', label: 'Portuguese (Brazil)' }
              ]}
            />
            <FormInput
              id="primary-language"
              label="Primary Language"
              inputType="select"
              value={primaryLanguage}
              onChange={setPrimaryLanguage}
              description="Default language for content and communications"
              options={[...PRIMARY_LANGUAGE_OPTIONS]}
            />
          </div>
        </FormSectionCard>

        <FormSectionCard
          title="Public Calendar Feed"
          description="Allow parishioners and visitors to subscribe to your parish calendar using standard calendar apps"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="public-calendar" className="text-base font-medium">
                  Enable Public Calendar
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, anyone with the calendar URL can subscribe to your parish events
                </p>
              </div>
              <Switch
                id="public-calendar"
                checked={publicCalendarEnabled}
                onCheckedChange={handleTogglePublicCalendar}
                disabled={saving}
              />
            </div>

            {publicCalendarEnabled && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Calendar Feed URL</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                      {calendarFeedUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">How to Subscribe</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Apple Calendar:</strong> File → New Calendar Subscription → paste the URL</p>
                    <p><strong>Google Calendar:</strong> Settings → Add calendar → From URL → paste the URL</p>
                    <p><strong>Outlook:</strong> Add calendar → Subscribe from web → paste the URL</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Only events from event types with &quot;Show on Public Calendar&quot; enabled will appear in the feed.
                    Configure this in each event type&apos;s settings.
                  </p>
                </div>
              </div>
            )}
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

        <div className="flex justify-end">
          <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

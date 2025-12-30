'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { seedSampleData, type SeedDataResult } from '@/lib/actions/seed-data'
import {
  getEventTypesForDebug,
  getScriptsForEventType,
  type EventTypeForDebug,
  type ScriptForDebug
} from '@/lib/actions/developer-tools'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Database, CheckCircle, AlertCircle, Loader2, FileText, ChevronRight, Layers } from 'lucide-react'
import Link from 'next/link'

export function DeveloperToolsClient() {
  const t = useTranslations()
  const [isSeeding, setIsSeeding] = useState(false)
  const [showSeedConfirm, setShowSeedConfirm] = useState(false)
  const [seedResult, setSeedResult] = useState<SeedDataResult | null>(null)

  // Template Structure Browser state
  const [eventTypes, setEventTypes] = useState<EventTypeForDebug[]>([])
  const [selectedEventType, setSelectedEventType] = useState<EventTypeForDebug | null>(null)
  const [scripts, setScripts] = useState<ScriptForDebug[]>([])
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(true)
  const [isLoadingScripts, setIsLoadingScripts] = useState(false)

  // Load event types on mount
  useEffect(() => {
    async function loadEventTypes() {
      try {
        const data = await getEventTypesForDebug()
        setEventTypes(data)
      } catch (error) {
        console.error('Error loading event types:', error)
        toast.error('Failed to load event types')
      } finally {
        setIsLoadingEventTypes(false)
      }
    }
    loadEventTypes()
  }, [])

  // Load scripts when event type is selected
  useEffect(() => {
    async function loadScripts() {
      if (!selectedEventType) {
        setScripts([])
        return
      }

      setIsLoadingScripts(true)
      try {
        const data = await getScriptsForEventType(selectedEventType.id)
        setScripts(data)
      } catch (error) {
        console.error('Error loading scripts:', error)
        toast.error('Failed to load scripts')
      } finally {
        setIsLoadingScripts(false)
      }
    }
    loadScripts()
  }, [selectedEventType])

  const handleSeedData = async () => {
    setIsSeeding(true)
    setSeedResult(null)

    try {
      const result = await seedSampleData()
      setSeedResult(result)

      if (result.success) {
        toast.success(t('settings.developerTools.seedSuccess'))
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      toast.error(t('settings.developerTools.seedError'))
    } finally {
      setIsSeeding(false)
    }
  }

  const getSystemTypeLabel = (systemType: string) => {
    switch (systemType) {
      case 'mass-liturgy':
        return 'Mass Liturgy'
      case 'special-liturgy':
        return 'Special Liturgy'
      case 'parish-event':
        return 'Parish Event'
      default:
        return systemType
    }
  }

  const getSystemTypeColor = (systemType: string) => {
    switch (systemType) {
      case 'mass-liturgy':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'special-liturgy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'parish-event':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Structure Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Template Structure Browser
          </CardTitle>
          <CardDescription>
            Browse event types, scripts, and sections to understand template structure and troubleshoot placeholder issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Types List */}
          <div>
            <h3 className="text-sm font-medium mb-2">Event Types</h3>
            {isLoadingEventTypes ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading event types...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((et) => (
                  <Button
                    key={et.id}
                    variant={selectedEventType?.id === et.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedEventType(et)}
                    className="gap-2"
                  >
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getSystemTypeColor(et.system_type)}`}>
                      {getSystemTypeLabel(et.system_type)}
                    </span>
                    {et.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Scripts for Selected Event Type */}
          {selectedEventType && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">
                Scripts for {selectedEventType.name}
              </h3>
              {isLoadingScripts ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading scripts...
                </div>
              ) : scripts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scripts found for this event type.</p>
              ) : (
                <div className="space-y-2">
                  {scripts.map((script) => (
                    <Link
                      key={script.id}
                      href={`/settings/developer-tools/scripts/${script.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{script.name}</p>
                          {script.description && (
                            <p className="text-sm text-muted-foreground">{script.description}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seed Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('settings.developerTools.seedData.title')}
          </CardTitle>
          <CardDescription>
            {t('settings.developerTools.seedData.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">{t('settings.developerTools.seedData.info')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('settings.developerTools.seedData.items.people')}</li>
              <li>{t('settings.developerTools.seedData.items.families')}</li>
              <li>{t('settings.developerTools.seedData.items.masses')}</li>
              <li>{t('settings.developerTools.seedData.items.intentions')}</li>
              <li>{t('settings.developerTools.seedData.items.weddings')}</li>
              <li>{t('settings.developerTools.seedData.items.funerals')}</li>
              <li>{t('settings.developerTools.seedData.items.readings')}</li>
            </ul>
          </div>

          <Button
            onClick={() => setShowSeedConfirm(true)}
            disabled={isSeeding}
            className="w-full sm:w-auto"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('settings.developerTools.seedData.seeding')}
              </>
            ) : (
              t('settings.developerTools.seedData.button')
            )}
          </Button>

          {seedResult && (
            <div className={`p-4 rounded-lg border ${
              seedResult.success
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {seedResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  seedResult.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {seedResult.message}
                </span>
              </div>
              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                <div>{t('settings.developerTools.seedData.results.people')}: {seedResult.details.people}</div>
                <div>{t('settings.developerTools.seedData.results.families')}: {seedResult.details.families}</div>
                <div>{t('settings.developerTools.seedData.results.masses')}: {seedResult.details.masses}</div>
                <div>{t('settings.developerTools.seedData.results.intentions')}: {seedResult.details.massIntentions}</div>
                <div>{t('settings.developerTools.seedData.results.weddings')}: {seedResult.details.weddings}</div>
                <div>{t('settings.developerTools.seedData.results.funerals')}: {seedResult.details.funerals}</div>
                <div>{t('settings.developerTools.seedData.results.readings')}: {seedResult.details.readings}</div>
                <div>{t('settings.developerTools.seedData.results.groupMemberships')}: {seedResult.details.groupMemberships}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showSeedConfirm}
        onOpenChange={setShowSeedConfirm}
        onConfirm={handleSeedData}
        title={t('settings.developerTools.seedData.confirmTitle')}
        description={t('settings.developerTools.seedData.confirmDescription')}
        confirmLabel={t('settings.developerTools.seedData.confirmButton')}
      />
    </div>
  )
}

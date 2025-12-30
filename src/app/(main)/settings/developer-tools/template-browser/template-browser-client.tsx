'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import {
  getEventTypesForDebug,
  getScriptsForEventType,
  type EventTypeForDebug,
  type ScriptForDebug
} from '@/lib/actions/developer-tools'
import { toast } from 'sonner'
import { Loader2, FileText, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function TemplateBrowserClient() {
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
      {/* Back button */}
      <div>
        <LinkButton href="/settings/developer-tools">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Developer Tools
        </LinkButton>
      </div>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Scripts for Selected Event Type */}
      {selectedEventType && (
        <Card>
          <CardHeader>
            <CardTitle>Scripts for {selectedEventType.name}</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}

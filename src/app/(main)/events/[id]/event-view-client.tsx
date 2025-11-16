'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, Printer, Download, FileText, Pencil } from "lucide-react"
import { EVENT_TYPE_LABELS, MODULE_STATUS_LABELS } from "@/lib/constants"
import type { EventWithRelations } from '@/lib/actions/events'
import type { ModuleReference } from '@/lib/helpers/event-helpers'
import Link from 'next/link'
import { useAppContext } from '@/contexts/AppContextProvider'

interface EventViewClientProps {
  event: EventWithRelations
  moduleReference: ModuleReference | null
}

export function EventViewClient({ event, moduleReference }: EventViewClientProps) {
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    return timeString
  }

  const generateFilename = (extension: string) => {
    const eventDate = event.start_date
      ? new Date(event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const sanitizedName = event.name.replace(/[^a-z0-9]/gi, '-').substring(0, 30)
    return `event-${sanitizedName}-${eventDate}.${extension}`
  }

  const handlePrint = () => {
    window.open(`/print/events/${event.id}`, '_blank')
  }

  const handleDownloadPDF = () => {
    const link = document.createElement('a')
    link.href = `/api/events/${event.id}/pdf`
    link.download = generateFilename('pdf')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadWord = () => {
    const link = document.createElement('a')
    link.href = `/api/events/${event.id}/word`
    link.download = generateFilename('docx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 order-2 md:order-1 space-y-6">
      {/* Module Reference Section */}
      {moduleReference && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Related {moduleReference.moduleDisplay[userLanguage]}</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={moduleReference.modulePath}>
                  View {moduleReference.moduleDisplay[userLanguage]}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">{moduleReference.summary.title}</h4>
              {moduleReference.summary.status && (
                <Badge variant="outline">
                  {MODULE_STATUS_LABELS[moduleReference.summary.status]?.[userLanguage] || moduleReference.summary.status}
                </Badge>
              )}
              <ul className="text-sm text-muted-foreground space-y-1">
                {moduleReference.summary.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {event.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.start_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </h4>
                <p className="text-sm">
                  {formatDate(event.start_date)}
                  {event.start_time && ` at ${formatTime(event.start_time)}`}
                </p>
              </div>
            )}
            {event.end_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </h4>
                <p className="text-sm">
                  {formatDate(event.end_date)}
                  {event.end_time && ` at ${formatTime(event.end_time)}`}
                </p>
              </div>
            )}
            {event.location && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <p className="text-sm">
                  {event.location.name}
                </p>
                {(event.location.street || event.location.city || event.location.state) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[event.location.street, event.location.city, event.location.state]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {event.note && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {event.note}
            </p>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
        <Card>
          <CardContent className="pt-4 px-4 pb-2 space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href={`/events/${event.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print View
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handleDownloadWord}
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Word
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 px-4 pb-4 space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Event Type</div>
              <div className="text-sm">
                {EVENT_TYPE_LABELS[event.event_type]?.[userLanguage] || event.event_type}
              </div>
            </div>

            {event.start_date && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Start Date</div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(event.start_date)}
                  {event.start_time && ` at ${formatTime(event.start_time)}`}
                </div>
              </div>
            )}

            {event.location && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div>{event.location.name}</div>
                    {(event.location.street || event.location.city || event.location.state) && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {[event.location.street, event.location.city, event.location.state]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
              <div className="text-sm">
                {new Date(event.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

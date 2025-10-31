import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Calendar, MapPin, Clock, User } from "lucide-react"
import { getEvent } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EventFormActions } from './event-form-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch event server-side
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: event.name }
  ]

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    return timeString
  }

  const isUpcoming = event.start_date && new Date(event.start_date) >= new Date()

  return (
    <PageContainer
      title={event.name}
      description={event.event_type}
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Title and badges */}
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline">
              {event.event_type}
            </Badge>
            {event.language && (
              <Badge variant="secondary">
                {event.language}
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-green-100 text-green-800">
                Upcoming
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(event.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <EventFormActions event={event} />

        <div className="space-y-6">
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
                      {event.location}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Responsible Party ID
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground">
                    {event.responsible_party_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {event.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {event.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Created At
                  </h4>
                  <p className="text-sm">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Last Updated
                  </h4>
                  <p className="text-sm">
                    {new Date(event.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Event ID
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground">
                    {event.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

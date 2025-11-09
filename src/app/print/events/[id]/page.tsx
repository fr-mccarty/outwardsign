import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEvent } from '@/lib/actions/events'
import { EVENT_TYPE_LABELS } from '@/lib/constants'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintEventPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not specified'
    return timeString
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
        }

        body {
          background: white !important;
          color: black !important;
          padding: 2rem !important;
          font-family: 'Times New Roman', Times, serif;
        }

        .print-container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }

        .event-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid black;
          padding-bottom: 1rem;
        }

        .event-title {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .event-type {
          font-size: 14pt;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 14pt;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .detail-row {
          display: flex;
          margin-bottom: 0.5rem;
        }

        .detail-label {
          font-weight: bold;
          width: 150px;
          flex-shrink: 0;
        }

        .detail-value {
          flex: 1;
        }

        .description {
          white-space: pre-wrap;
          line-height: 1.6;
          padding: 0.5rem;
          background: #f9f9f9;
          border-left: 3px solid #333;
        }
      `}} />

      <div className="print-container">
        <div className="event-header">
          <div className="event-title">{event.name}</div>
          <div className="event-type">
            {EVENT_TYPE_LABELS[event.event_type]?.en || event.event_type}
          </div>
        </div>

        {event.description && (
          <div className="section">
            <div className="section-title">Description</div>
            <div className="description">{event.description}</div>
          </div>
        )}

        <div className="section">
          <div className="section-title">Event Details</div>

          <div className="detail-row">
            <div className="detail-label">Start Date:</div>
            <div className="detail-value">{formatDate(event.start_date)}</div>
          </div>

          {event.start_time && (
            <div className="detail-row">
              <div className="detail-label">Start Time:</div>
              <div className="detail-value">{formatTime(event.start_time)}</div>
            </div>
          )}

          {event.end_date && (
            <div className="detail-row">
              <div className="detail-label">End Date:</div>
              <div className="detail-value">{formatDate(event.end_date)}</div>
            </div>
          )}

          {event.end_time && (
            <div className="detail-row">
              <div className="detail-label">End Time:</div>
              <div className="detail-value">{formatTime(event.end_time)}</div>
            </div>
          )}

          {event.location && (
            <div className="detail-row">
              <div className="detail-label">Location:</div>
              <div className="detail-value">{event.location}</div>
            </div>
          )}

          {event.language && (
            <div className="detail-row">
              <div className="detail-label">Language:</div>
              <div className="detail-value">{event.language}</div>
            </div>
          )}

          <div className="detail-row">
            <div className="detail-label">Responsible Party:</div>
            <div className="detail-value" style={{ fontSize: '10pt', fontFamily: 'monospace' }}>
              {event.responsible_party_id}
            </div>
          </div>
        </div>

        {event.note && (
          <div className="section">
            <div className="section-title">Notes</div>
            <div className="description">{event.note}</div>
          </div>
        )}

        <div className="section" style={{ marginTop: '2rem', fontSize: '10pt', color: '#666' }}>
          <div className="detail-row">
            <div className="detail-label">Created:</div>
            <div className="detail-value">
              {new Date(event.created_at).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Last Updated:</div>
            <div className="detail-value">
              {new Date(event.updated_at).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Event ID:</div>
            <div className="detail-value" style={{ fontFamily: 'monospace' }}>
              {event.id}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

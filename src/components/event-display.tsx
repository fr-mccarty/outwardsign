import type { Event } from '@/lib/types'

interface EventDisplayProps {
  event: Event | null
  placeholder: string
}

// Helper function to format event date and time
const formatEventDateTime = (event: Event) => {
  const parts: string[] = []

  if (event.start_date) {
    const date = new Date(event.start_date + 'T00:00:00')
    parts.push(date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }))
  }

  if (event.start_time) {
    // Parse time string (HH:MM:SS format)
    const [hours, minutes] = event.start_time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    parts.push(date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }))
  }

  return parts.length > 0 ? parts.join(' at ') : 'No date/time'
}

export function EventDisplay({ event, placeholder }: EventDisplayProps) {
  if (!event) {
    return <span>{placeholder}</span>
  }

  return (
    <div className="flex flex-col items-start min-w-0 flex-1">
      <span className="leading-tight">{formatEventDateTime(event)}</span>
      {(event as any).note && (
        <span className="text-xs text-muted-foreground mt-0.5">{(event as any).note}</span>
      )}
    </div>
  )
}

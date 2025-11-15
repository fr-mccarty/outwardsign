'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { Calendar, Book, Cross } from 'lucide-react'

interface LiturgicalEventModalProps {
  event: GlobalLiturgicalEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMass?: () => void
}

// Map liturgical colors to Tailwind classes
const LITURGICAL_COLOR_MAP: Record<string, string> = {
  'purple': 'bg-purple-500',
  'white': 'bg-white border border-border',
  'red': 'bg-red-500',
  'green': 'bg-green-500',
  'gold': 'bg-yellow-500',
  'rose': 'bg-pink-400',
  'black': 'bg-black',
}

export function LiturgicalEventModal({ event, open, onOpenChange, onAddMass }: LiturgicalEventModalProps) {
  if (!event) return null

  const eventData = event.event_data
  const primaryColor = eventData.color[0] || 'white'
  const colorClass = LITURGICAL_COLOR_MAP[primaryColor.toLowerCase()] || 'bg-muted'

  // Format date
  const date = new Date(event.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-4 h-full min-h-16 rounded ${colorClass}`} />
            <div className="flex-1">
              <DialogTitle className="text-2xl">{eventData.name}</DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Liturgical Season</div>
              <div className="text-base mt-1">
                {eventData.liturgical_season_lcl || eventData.liturgical_season || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Grade</div>
              <div className="text-base mt-1">{eventData.grade_display || eventData.grade_lcl}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Liturgical Year</div>
              <div className="text-base mt-1">{eventData.liturgical_year || 'N/A'}</div>
            </div>
            {eventData.psalter_week && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Psalter Week</div>
                <div className="text-base mt-1">Week {eventData.psalter_week}</div>
              </div>
            )}
          </div>

          {/* Liturgical Colors */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Liturgical Colors</div>
            <div className="flex gap-2 flex-wrap">
              {eventData.color.map((color, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="capitalize"
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${LITURGICAL_COLOR_MAP[color.toLowerCase()] || 'bg-muted'}`} />
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {/* Special Indicators */}
          {(eventData.has_vigil_mass || eventData.is_vigil_mass || eventData.has_vesper_i || eventData.has_vesper_ii) && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Special Observances</div>
                <div className="flex gap-2 flex-wrap">
                  {eventData.has_vigil_mass && (
                    <Badge variant="secondary">Has Vigil Mass</Badge>
                  )}
                  {eventData.is_vigil_mass && (
                    <Badge variant="secondary">Vigil Mass for {eventData.is_vigil_for}</Badge>
                  )}
                  {eventData.has_vesper_i && (
                    <Badge variant="secondary">First Vespers</Badge>
                  )}
                  {eventData.has_vesper_ii && (
                    <Badge variant="secondary">Second Vespers</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Readings */}
          {eventData.readings && Object.keys(eventData.readings).some(key => eventData.readings?.[key as keyof typeof eventData.readings]) && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Readings
                </div>
                <div className="space-y-2 text-sm">
                  {eventData.readings.first_reading && (
                    <div>
                      <span className="font-medium">First Reading:</span> {eventData.readings.first_reading}
                    </div>
                  )}
                  {eventData.readings.responsorial_psalm && (
                    <div>
                      <span className="font-medium">Responsorial Psalm:</span> {eventData.readings.responsorial_psalm}
                    </div>
                  )}
                  {eventData.readings.second_reading && (
                    <div>
                      <span className="font-medium">Second Reading:</span> {eventData.readings.second_reading}
                    </div>
                  )}
                  {eventData.readings.gospel_acclamation && (
                    <div>
                      <span className="font-medium">Gospel Acclamation:</span> {eventData.readings.gospel_acclamation}
                    </div>
                  )}
                  {eventData.readings.gospel && (
                    <div>
                      <span className="font-medium">Gospel:</span> {eventData.readings.gospel}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Common */}
          {eventData.common && eventData.common.length > 0 && eventData.common[0] !== '' && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Common</div>
                <div className="text-sm">{eventData.common_lcl || eventData.common.join(', ')}</div>
              </div>
            </>
          )}

          {/* Add Mass Button */}
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              Would you like to schedule a Mass for this liturgical event?
            </div>
            <Button onClick={onAddMass} className="flex items-center gap-2">
              <Cross className="w-4 h-4" />
              Add Mass
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

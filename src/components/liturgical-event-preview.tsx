'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getLiturgicalColorClasses, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'
import { LITURGICAL_COLOR_BAR_TOTAL_WIDTH } from '@/lib/constants'
import { formatDate } from '@/lib/utils/formatters'
import { Calendar, Book, Palette, Plus } from 'lucide-react'

interface LiturgicalEventPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: GlobalLiturgicalEvent | null
}

export function LiturgicalEventPreview({
  open,
  onOpenChange,
  event
}: LiturgicalEventPreviewProps) {
  const router = useRouter()

  if (!event) return null

  const { event_data } = event

  const handleCreateMass = () => {
    // Navigate to create mass page with liturgical event ID
    router.push(`/masses/create?liturgical_event_id=${event.id}`)
    onOpenChange(false)
  }
  const colors = event_data.color || []
  const primaryColor = (colors[0] || '').toLowerCase()
  const colorStyles = getLiturgicalColorClasses(primaryColor, 10)
  const colorCount = colors.length > 0 ? colors.length : 1
  const liturgicalBarWidth = LITURGICAL_COLOR_BAR_TOTAL_WIDTH / colorCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event_data.name}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <div className="space-y-6 mt-4 pb-4">
            {/* Date and Basic Info */}
            <div className={`relative rounded-lg p-4 overflow-hidden ${colorStyles}`}>
              {/* Vertical liturgical bars on the left */}
              <div
                className="absolute left-0 top-0 bottom-0 flex flex-row"
                style={{ width: `${LITURGICAL_COLOR_BAR_TOTAL_WIDTH}px` }}
              >
                {colors.length > 0 ? (
                  colors.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: getLiturgicalCssVarValue(color),
                        width: `${liturgicalBarWidth}px`,
                      }}
                    />
                  ))
                ) : null}
              </div>

              <div style={{ paddingLeft: `${LITURGICAL_COLOR_BAR_TOTAL_WIDTH + 16}px` }}>
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    {formatDate(event.date, 'en', { includeWeekday: true })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event_data.grade_display && (
                      <Badge variant="outline">{event_data.grade_display}</Badge>
                    )}
                    {event_data.liturgical_season_lcl && (
                      <Badge variant="outline">{event_data.liturgical_season_lcl}</Badge>
                    )}
                    {event_data.type && (
                      <Badge variant="secondary">{event_data.type}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Liturgical Colors */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  Liturgical Color{colors.length > 1 ? 's' : ''}
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: getLiturgicalCssVarValue(color) }}
                      />
                      <span className="text-sm capitalize">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Readings */}
            {event_data.readings && Object.keys(event_data.readings).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Book className="h-4 w-4" />
                  Readings
                </div>
                <div className="space-y-2 pl-6">
                  {event_data.readings.first_reading && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">First Reading</div>
                      <div className="text-sm">{event_data.readings.first_reading}</div>
                    </div>
                  )}
                  {event_data.readings.responsorial_psalm && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Responsorial Psalm</div>
                      <div className="text-sm">{event_data.readings.responsorial_psalm}</div>
                    </div>
                  )}
                  {event_data.readings.second_reading && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Second Reading</div>
                      <div className="text-sm">{event_data.readings.second_reading}</div>
                    </div>
                  )}
                  {event_data.readings.gospel_acclamation && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Gospel Acclamation</div>
                      <div className="text-sm">{event_data.readings.gospel_acclamation}</div>
                    </div>
                  )}
                  {event_data.readings.gospel && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Gospel</div>
                      <div className="text-sm">{event_data.readings.gospel}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {event_data.liturgical_year && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Liturgical Year</div>
                  <div>{event_data.liturgical_year}</div>
                </div>
              )}
              {event_data.psalter_week && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Psalter Week</div>
                  <div>Week {event_data.psalter_week}</div>
                </div>
              )}
              {event_data.common && event_data.common.length > 0 && (
                <div className="col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Common</div>
                  <div>{event_data.common_lcl || event_data.common.join(', ')}</div>
                </div>
              )}
            </div>

            {/* Vigil Information */}
            {(event_data.is_vigil_mass || event_data.has_vigil_mass) && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                {event_data.is_vigil_mass && event_data.is_vigil_for && (
                  <div>This is a vigil mass for {event_data.is_vigil_for}</div>
                )}
                {event_data.has_vigil_mass && !event_data.is_vigil_mass && (
                  <div>This celebration has a vigil mass</div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button onClick={handleCreateMass}>
            <Plus className="h-4 w-4 mr-2" />
            Create Mass
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

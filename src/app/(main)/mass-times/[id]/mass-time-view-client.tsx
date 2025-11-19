'use client'

import { MassTimeWithRelations, deleteMassTime } from '@/lib/actions/mass-times'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import {
  LITURGICAL_LANGUAGE_LABELS,
  DAYS_OF_WEEK_LABELS,
} from '@/lib/constants'
import { formatDate } from '@/lib/utils/formatters'
import { ModuleViewPanel } from '@/components/module-view-panel'

interface MassTimeViewClientProps {
  massTime: MassTimeWithRelations
}

export function MassTimeViewClient({ massTime }: MassTimeViewClientProps) {
  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/mass-times/${massTime.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Mass Time
        </Link>
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <>
      {!massTime.active && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <Badge variant="secondary">Inactive</Badge>
        </div>
      )}

      {massTime.location && (
        <div className={!massTime.active ? 'pt-2 border-t' : ''}>
          <span className="font-medium">Location:</span> {massTime.location.name}
          {(massTime.location.street ||
            massTime.location.city ||
            massTime.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[
                massTime.location.street,
                massTime.location.city,
                massTime.location.state,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Mass Type</div>
                <div className="font-medium">
                  {massTime.mass_type?.label_en || 'Unknown Type'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Language</div>
                <div className="font-medium">
                  {LITURGICAL_LANGUAGE_LABELS[massTime.language].en}
                </div>
              </div>
            </div>

            {/* Schedule Items */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Schedule</div>
              <div className="space-y-2">
                {massTime.schedule_items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="outline">
                      {DAYS_OF_WEEK_LABELS[item.day].en}
                    </Badge>
                    <span className="font-medium">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mass Details */}
        {(massTime.location || massTime.special_designation) && (
          <Card>
            <CardHeader>
              <CardTitle>Mass Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {massTime.location && (
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{massTime.location.name}</div>
                  {(massTime.location.street ||
                    massTime.location.city ||
                    massTime.location.state) && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {[
                        massTime.location.street,
                        massTime.location.city,
                        massTime.location.state,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              )}

              {massTime.special_designation && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Special Designation
                  </div>
                  <div className="font-medium">{massTime.special_designation}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Effective Period */}
        {(massTime.effective_start_date || massTime.effective_end_date) && (
          <Card>
            <CardHeader>
              <CardTitle>Effective Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {massTime.effective_start_date && (
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Start Date
                    </div>
                    <div className="font-medium">
                      {formatDate(massTime.effective_start_date)}
                    </div>
                  </div>
                )}
                {massTime.effective_end_date && (
                  <div>
                    <div className="text-sm text-muted-foreground">End Date</div>
                    <div className="font-medium">
                      {formatDate(massTime.effective_end_date)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {massTime.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{massTime.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Side Panel */}
      <ModuleViewPanel
        entity={massTime}
        entityType="Mass Time"
        modulePath="mass-times"
        actionButtons={actionButtons}
        details={details}
        onDelete={deleteMassTime}
      />
    </div>
  )
}

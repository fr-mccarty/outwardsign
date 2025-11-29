'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  UserMinus,
  X
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { Calendar } from '@/components/calendar/calendar'
import { CalendarItem, CalendarView } from '@/components/calendar/types'
import { MassTimesTemplate, MassTimesTemplateWithItems } from "@/lib/actions/mass-times-templates"
import { LITURGICAL_DAYS_OF_WEEK_LABELS, type LiturgicalDayOfWeek, DEFAULT_TIMEZONE } from "@/lib/constants"
import { formatDate, formatTime, getDayOfWeekNumber, toLocalDateString } from "@/lib/utils/formatters"
import { format } from 'date-fns'
import { PeoplePicker } from '@/components/people-picker'
import type { Person } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

export interface RoleAssignment {
  roleId: string
  roleName: string
  personId?: string
  personName?: string
}

export interface ProposedMass {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS format
  templateId: string
  templateName: string
  dayOfWeek: string
  massTimesTemplateItemId?: string // Reference to the specific mass time template item
  massRoleTemplateId?: string // Reference to the mass role template (for roles/assignments)
  isIncluded: boolean
  hasConflict: boolean
  conflictReason?: string
  liturgicalEventId?: string
  liturgicalEventName?: string
  liturgicalEventColor?: string[] // Liturgical color (e.g., ["green"], ["white"], ["red"])
  liturgicalEventGradeNumber?: number // Numeric grade (1-9, lower is more important)
  liturgicalEventGrade?: string // Grade abbreviation (e.g., "SOLEMNITY", "FEAST")
  liturgicalEventType?: string // Event type
  assignments?: RoleAssignment[]
}

interface ProposedMassCalendarItem extends CalendarItem {
  mass: ProposedMass
}

interface Step6ProposedScheduleProps {
  startDate: string
  endDate: string
  massTimesTemplates: MassTimesTemplate[]
  selectedMassTimesTemplateIds: string[]
  proposedMasses: ProposedMass[]
  onProposedMassesChange: (masses: ProposedMass[]) => void
}

// Get day label from constants
function getDayLabel(day: string): string {
  const labels = LITURGICAL_DAYS_OF_WEEK_LABELS[day as LiturgicalDayOfWeek]
  return labels?.en ?? day
}

export function Step5ProposedSchedule({
  startDate,
  endDate,
  massTimesTemplates,
  selectedMassTimesTemplateIds,
  proposedMasses,
  onProposedMassesChange,
}: Step6ProposedScheduleProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return startDate ? new Date(startDate) : new Date()
  })
  const [view, setView] = useState<CalendarView>('month')
  const [selectedMass, setSelectedMass] = useState<ProposedMass | null>(null)
  const [massDetailOpen, setMassDetailOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleAssignment | null>(null)
  const [peoplePickerOpen, setPeoplePickerOpen] = useState(false)
  const [conflictsDialogOpen, setConflictsDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Update calendar to show the month of the first scheduled day when startDate changes
  useEffect(() => {
    if (startDate) {
      setCurrentDate(new Date(startDate))
    }
  }, [startDate])

  // Statistics
  const stats = useMemo(() => {
    const included = proposedMasses.filter(m => m.isIncluded)
    const conflicts = proposedMasses.filter(m => m.hasConflict && m.isIncluded)
    const excluded = proposedMasses.filter(m => !m.isIncluded)
    const missingAssignments = included.filter(m =>
      m.assignments?.some(a => !a.personId)
    )
    return {
      total: proposedMasses.length,
      included: included.length,
      conflicts: conflicts.length,
      excluded: excluded.length,
      missingAssignments: missingAssignments.length
    }
  }, [proposedMasses])

  // Convert proposed masses to calendar items
  const calendarItems: ProposedMassCalendarItem[] = useMemo(() => {
    return proposedMasses
      .filter(m => m.isIncluded)
      .map(mass => ({
        id: mass.id,
        date: mass.date,
        title: mass.templateName,
        mass,
        // Add liturgical color for calendar item rendering
        liturgicalColor: mass.liturgicalEventColor && mass.liturgicalEventColor.length > 0
          ? mass.liturgicalEventColor[0]
          : undefined
      }))
  }, [proposedMasses])

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    }
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
  }

  const handleMassClick = (item: CalendarItem, event: React.MouseEvent) => {
    event.stopPropagation()
    const massItem = item as ProposedMassCalendarItem
    setSelectedMass(massItem.mass)
    setMassDetailOpen(true)
  }

  const toggleMassInclusion = (massId: string) => {
    const updated = proposedMasses.map(m =>
      m.id === massId ? { ...m, isIncluded: !m.isIncluded } : m
    )
    onProposedMassesChange(updated)
    if (selectedMass?.id === massId) {
      setSelectedMass(null)
      setMassDetailOpen(false)
    }
  }

  const handleAssignPerson = (role: RoleAssignment) => {
    setEditingRole(role)
    setPeoplePickerOpen(true)
  }

  const handlePersonSelected = (person: Person) => {
    if (!selectedMass || !editingRole) return

    const updated = proposedMasses.map(m => {
      if (m.id === selectedMass.id) {
        const newAssignments = m.assignments?.map(a =>
          a.roleId === editingRole.roleId
            ? { ...a, personId: person.id, personName: `${person.first_name} ${person.last_name}` }
            : a
        )
        return { ...m, assignments: newAssignments }
      }
      return m
    })
    onProposedMassesChange(updated)

    // Update selected mass
    const updatedMass = updated.find(m => m.id === selectedMass.id)
    if (updatedMass) setSelectedMass(updatedMass)

    setPeoplePickerOpen(false)
    setEditingRole(null)
  }

  const handleRemoveAssignment = (role: RoleAssignment) => {
    if (!selectedMass) return

    const updated = proposedMasses.map(m => {
      if (m.id === selectedMass.id) {
        const newAssignments = m.assignments?.map(a =>
          a.roleId === role.roleId
            ? { ...a, personId: undefined, personName: undefined }
            : a
        )
        return { ...m, assignments: newAssignments }
      }
      return m
    })
    onProposedMassesChange(updated)

    const updatedMass = updated.find(m => m.id === selectedMass.id)
    if (updatedMass) setSelectedMass(updatedMass)
  }

  // Custom color for calendar items
  const getItemColor = (item: ProposedMassCalendarItem) => {
    const mass = item.mass

    // Let the parish-event-item components handle liturgical color circle rendering
    if (mass.hasConflict) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700'
    const missingAssignment = mass.assignments?.some(a => !a.personId)
    if (missingAssignment) return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700'
    return 'bg-primary/10 text-primary border-primary/30'
  }

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={CalendarDays}
        title="Proposed Schedule"
        description="Review the calendar and adjust assignments before creating"
      />

      {/* Calendar View */}
      <Calendar
        currentDate={currentDate}
        view={view}
        items={calendarItems}
        title="Proposed Mass Schedule"
        onNavigate={handleNavigate}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onItemClick={handleMassClick}
        getItemColor={getItemColor}
        maxItemsPerDay={5}
        showViewSelector={true}
      />

      {/* Selected Mass Detail Modal */}
      <Dialog open={massDetailOpen} onOpenChange={setMassDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMass && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedMass.templateName}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(selectedMass.date)} • {getDayLabel(selectedMass.dayOfWeek)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Liturgical Event Information */}
                {selectedMass.liturgicalEventName && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Liturgical Event
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium text-xl">{selectedMass.liturgicalEventName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedMass.liturgicalEventGrade && (
                          <div>
                            <span className="text-muted-foreground">Grade:</span>
                            <div className="font-medium capitalize">{selectedMass.liturgicalEventGrade}</div>
                          </div>
                        )}

                        {selectedMass.liturgicalEventType && (
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <div className="font-medium capitalize">{selectedMass.liturgicalEventType}</div>
                          </div>
                        )}

                        {selectedMass.liturgicalEventColor && selectedMass.liturgicalEventColor.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Liturgical Color:</span>
                            <div className="flex gap-1 mt-1">
                              {selectedMass.liturgicalEventColor.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Mass
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMassDetailOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Masses to Create</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.missingAssignments > 0
                  ? `${stats.missingAssignments} masses need assignments`
                  : 'All masses have complete assignments'
                }
              </p>
            </div>
            <div className="text-4xl font-bold text-primary">
              {stats.included}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People Picker Modal */}
      <PeoplePicker
        open={peoplePickerOpen}
        onOpenChange={setPeoplePickerOpen}
        onSelect={handlePersonSelected}
        placeholder={editingRole ? `Search for ${editingRole.roleName}...` : "Search for a minister..."}
        emptyMessage={editingRole ? `No people are qualified for the ${editingRole.roleName} role. Go to Settings > Mass Roles to add people to this role.` : "No ministers found."}
        filterByMassRole={editingRole?.roleId}
      />

      {/* Liturgical Events Dialog */}
      <Dialog open={conflictsDialogOpen} onOpenChange={setConflictsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-600" />
              Masses on Special Liturgical Days ({stats.conflicts})
            </DialogTitle>
            <DialogDescription>
              These Masses fall on liturgical events that were selected in Step 4 (Holy Days, Solemnities, Feasts). Review them to ensure the times and assignments match your parish's schedule for these special celebrations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {proposedMasses
                .filter(m => m.hasConflict && m.isIncluded)
                .map((mass) => (
                  <Card key={mass.id} className="bg-amber-50 dark:bg-amber-950/20 border-amber-300">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mass.templateName}</span>
                            <Badge variant="outline" className="text-xs">
                              {getDayLabel(mass.dayOfWeek)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(mass.date)}
                          </div>
                          {mass.liturgicalEventName && (
                            <div className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="font-medium">{mass.liturgicalEventName}</span>
                            </div>
                          )}
                          {mass.conflictReason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {mass.conflictReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setConflictsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={async () => {
          if (selectedMass) {
            toggleMassInclusion(selectedMass.id)
          }
        }}
        title="Remove Mass from Schedule?"
        itemName={selectedMass ? `${selectedMass.templateName} on ${formatDate(selectedMass.date)}` : undefined}
        description="Are you sure you want to remove this Mass from the proposed schedule? This will exclude it from being created."
        actionLabel="Remove Mass"
      />
    </div>
  )
}

// Helper function to generate proposed masses from templates and date range
export function generateProposedMasses(
  startDate: string,
  endDate: string,
  templates: MassTimesTemplateWithItems[],
  selectedTemplateIds: string[],
  liturgicalEvents?: Array<{ id: string; date: string; name: string; color?: string[]; grade?: number; grade_abbr?: string; type?: string }>,
  roleTemplateAssignments?: Array<{ roleId: string; roleName: string }>
): ProposedMass[] {
  const masses: ProposedMass[] = []
  const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id))

  if (!startDate || !endDate || selectedTemplates.length === 0) {
    return masses
  }

  const start = new Date(startDate + `T00:00:00${DEFAULT_TIMEZONE === 'UTC' ? 'Z' : ''}`)
  const end = new Date(endDate + `T00:00:00${DEFAULT_TIMEZONE === 'UTC' ? 'Z' : ''}`)

  // Create a map of liturgical events by date for quick lookup
  const eventsByDate = new Map<string, { id: string; name: string; color?: string[]; grade?: number; grade_abbr?: string; type?: string }>()
  liturgicalEvents?.forEach(event => {
    eventsByDate.set(event.date, { id: event.id, name: event.name, color: event.color, grade: event.grade, grade_abbr: event.grade_abbr, type: event.type })
  })

  // Generate masses for each day in range
  const currentDate = new Date(start)
  let idCounter = 0

  while (currentDate <= end) {
    const dayNumber = currentDate.getUTCDay()
    const dateStr = toLocalDateString(currentDate)

    // Check if there's a liturgical event on this date
    const liturgicalEvent = eventsByDate.get(dateStr)

    // Find templates that match this day
    selectedTemplates.forEach(template => {
      const templateDayNumber = getDayOfWeekNumber(template.day_of_week)

      if (templateDayNumber === dayNumber) {
        // Process each item in the template (handles vigil Masses and regular Masses)
        const items = template.items || []

        if (items.length === 0) {
          // No items - create a single Mass on the template day (backward compatibility)
          const hasConflict = !!liturgicalEvent

          const assignments: RoleAssignment[] = roleTemplateAssignments?.map(r => ({
            roleId: r.roleId,
            roleName: r.roleName,
            personId: undefined,
            personName: undefined
          })) || []

          masses.push({
            id: `proposed-${idCounter++}`,
            date: dateStr,
            time: '09:00:00', // Default time for backward compatibility
            templateId: template.id,
            templateName: template.name,
            dayOfWeek: template.day_of_week,
            isIncluded: true,
            hasConflict,
            conflictReason: hasConflict ? `Overlaps with ${liturgicalEvent?.name}` : undefined,
            liturgicalEventId: liturgicalEvent?.id,
            liturgicalEventName: liturgicalEvent?.name,
            liturgicalEventColor: liturgicalEvent?.color,
            liturgicalEventGradeNumber: liturgicalEvent?.grade,
            liturgicalEventGrade: liturgicalEvent?.grade_abbr,
            liturgicalEventType: liturgicalEvent?.type,
            assignments
          })
        } else {
          // Process each item
          items.forEach(item => {
            let massDate: string
            let massDateObj: Date

            if (item.day_type === 'DAY_BEFORE') {
              // Vigil Mass: occurs the day before
              massDateObj = new Date(currentDate)
              massDateObj.setUTCDate(massDateObj.getUTCDate() - 1)
              massDate = toLocalDateString(massDateObj)
            } else {
              // IS_DAY or default: occurs on the actual day
              massDate = dateStr
              massDateObj = new Date(currentDate)
            }

            // Check if massDate is within range
            if (massDateObj >= start && massDateObj <= end) {
              // Vigil Masses inherit liturgical event from the target day (not the vigil day)
              const hasConflict = !!liturgicalEvent

              const assignments: RoleAssignment[] = roleTemplateAssignments?.map(r => ({
                roleId: r.roleId,
                roleName: r.roleName,
                personId: undefined,
                personName: undefined
              })) || []

              masses.push({
                id: `proposed-${idCounter++}`,
                date: massDate,
                time: item.time,
                templateId: template.id,
                templateName: `${template.name} - ${formatTime(item.time)}${item.day_type === 'DAY_BEFORE' ? ' (Vigil)' : ''}`,
                dayOfWeek: template.day_of_week,
                massTimesTemplateItemId: item.id,
                isIncluded: true,
                hasConflict,
                conflictReason: hasConflict ? `Overlaps with ${liturgicalEvent?.name}` : undefined,
                liturgicalEventId: liturgicalEvent?.id,
                liturgicalEventName: liturgicalEvent?.name,
                liturgicalEventColor: liturgicalEvent?.color,
                liturgicalEventGradeNumber: liturgicalEvent?.grade,
                liturgicalEventGrade: liturgicalEvent?.grade_abbr,
                liturgicalEventType: liturgicalEvent?.type,
                assignments
              })
            }
          })
        }
      }
    })

    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return masses
}

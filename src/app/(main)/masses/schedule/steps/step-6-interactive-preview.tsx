'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sparkles,
  Calendar,
  UserPlus,
  X,
  GripVertical
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { ProposedMass, RoleAssignment } from './step-5-proposed-schedule'
import { formatDate } from '@/lib/utils/formatters'
import { MassAssignmentPeoplePicker } from '@/components/mass-assignment-people-picker'
import type { Person } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MassRoleTemplateWithItems } from '@/lib/actions/mass-role-templates'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, RefreshCw } from 'lucide-react'
import { getLiturgicalContextFromGrade } from '@/lib/constants'
import { LiturgicalEventPreview } from '@/components/liturgical-event-preview'
import { getGlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { previewMassAssignments } from '@/lib/actions/mass-scheduling'
import { formatTime } from '@/lib/utils/date-format'

interface Step6InteractivePreviewProps {
  proposedMasses: ProposedMass[]
  onProposedMassesChange: (masses: ProposedMass[]) => void
  roleTemplates: MassRoleTemplateWithItems[]
}

export function Step6InteractivePreview({
  proposedMasses,
  onProposedMassesChange,
  roleTemplates
}: Step6InteractivePreviewProps) {
  const [editingAssignment, setEditingAssignment] = useState<{
    massId: string
    roleId: string
  } | null>(null)
  const [peoplePickerOpen, setPeoplePickerOpen] = useState(false)
  const [templateChangeDialogOpen, setTemplateChangeDialogOpen] = useState(false)
  const [editingMassId, setEditingMassId] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('NOT_SELECTED')
  const [recommendedTemplateId, setRecommendedTemplateId] = useState<string | null>(null)
  const [liturgicalEventPreviewOpen, setLiturgicalEventPreviewOpen] = useState(false)
  const [selectedLiturgicalEvent, setSelectedLiturgicalEvent] = useState<GlobalLiturgicalEvent | null>(null)
  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false)
  const hasInitializedRef = useRef(false)

  const includedMasses = useMemo(() =>
    proposedMasses.filter(m => m.isIncluded).sort((a, b) => a.date.localeCompare(b.date))
  , [proposedMasses])

  // Group masses by date
  const massesByDate = useMemo(() => {
    const grouped: Record<string, ProposedMass[]> = {}
    includedMasses.forEach(mass => {
      if (!grouped[mass.date]) {
        grouped[mass.date] = []
      }
      grouped[mass.date].push(mass)
    })
    return grouped
  }, [includedMasses])

  const stats = useMemo(() => {
    const totalRoles = includedMasses.reduce((sum, m) => sum + (m.assignments?.length || 0), 0)
    const assignedRoles = includedMasses.reduce((sum, m) =>
      sum + (m.assignments?.filter(a => a.personId).length || 0), 0
    )
    return {
      totalMasses: includedMasses.length,
      totalRoles,
      assignedRoles,
      unassignedRoles: totalRoles - assignedRoles
    }
  }, [includedMasses])

  const handleAssignPerson = (massId: string, roleId: string) => {
    setEditingAssignment({ massId, roleId })
    setPeoplePickerOpen(true)
  }

  const handlePersonSelected = (person: Person) => {
    if (!editingAssignment) return

    const updated = proposedMasses.map(mass => {
      if (mass.id === editingAssignment.massId) {
        return {
          ...mass,
          assignments: mass.assignments?.map(assignment =>
            assignment.roleId === editingAssignment.roleId
              ? {
                  ...assignment,
                  personId: person.id,
                  personName: `${person.first_name} ${person.last_name}`
                }
              : assignment
          )
        }
      }
      return mass
    })

    console.log('[Step6] Assigning person:', person.first_name, person.last_name, 'to role:', editingAssignment.roleId)
    console.log('[Step6] Total assigned after this:', updated.reduce((sum, m) => sum + (m.assignments?.filter(a => a.personId).length || 0), 0))
    onProposedMassesChange(updated)
    setPeoplePickerOpen(false)
    setEditingAssignment(null)
  }

  const handleRemoveAssignment = (massId: string, roleId: string) => {
    const updated = proposedMasses.map(mass => {
      if (mass.id === massId) {
        return {
          ...mass,
          assignments: mass.assignments?.map(assignment =>
            assignment.roleId === roleId
              ? { ...assignment, personId: undefined, personName: undefined }
              : assignment
          )
        }
      }
      return mass
    })
    onProposedMassesChange(updated)
  }

  const getRecommendedTemplate = (date: string): string | null => {
    // Find the day of week for this date
    const massOnDate = proposedMasses.find(m => m.date === date)
    if (!massOnDate) return null

    const dayOfWeek = massOnDate.dayOfWeek
    const isSunday = dayOfWeek === 'SUNDAY'

    // Get all masses for this day of week
    const massesForDay = proposedMasses.filter(
      m => m.dayOfWeek === dayOfWeek && m.isIncluded
    )

    // Collect unique liturgical contexts from these masses using the grade number
    const contexts = new Set<string>()
    massesForDay.forEach(mass => {
      if (mass.liturgicalEventGradeNumber !== undefined && mass.liturgicalEventGradeNumber !== null) {
        // Use the mapping function to convert grade number to context
        const context = getLiturgicalContextFromGrade(mass.liturgicalEventGradeNumber, isSunday)
        contexts.add(context)
      } else {
        // If no liturgical event, it's a regular weekday
        contexts.add('WEEKDAY')
      }
    })

    // Find templates that match these contexts
    const matchingTemplates = roleTemplates.filter(template => {
      if (!template.liturgical_contexts || template.liturgical_contexts.length === 0) {
        return false
      }
      // Check if the template's contexts overlap with the mass contexts
      return template.liturgical_contexts.some(ctx => contexts.has(ctx))
    })

    // If multiple matches, prefer the one with the most specific match
    // Priority: Most contexts matched
    if (matchingTemplates.length > 0) {
      const sorted = matchingTemplates.sort((a, b) => {
        const aMatches = a.liturgical_contexts.filter(ctx => contexts.has(ctx)).length
        const bMatches = b.liturgical_contexts.filter(ctx => contexts.has(ctx)).length
        return bMatches - aMatches
      })
      return sorted[0].id
    }

    return null
  }

  const handleLiturgicalEventClick = async (eventId: string) => {
    const event = await getGlobalLiturgicalEvent(eventId)
    if (event) {
      setSelectedLiturgicalEvent(event)
      setLiturgicalEventPreviewOpen(true)
    }
  }

  const handleOpenTemplateChange = (massId: string) => {
    const mass = proposedMasses.find(m => m.id === massId)
    if (!mass) return

    setEditingMassId(massId)
    // Get recommended template based on this mass's date
    const recommended = getRecommendedTemplate(mass.date)
    setRecommendedTemplateId(recommended)
    // Default to recommended template if available, otherwise first template
    const defaultSelection = recommended || (roleTemplates.length > 0 ? roleTemplates[0].id : 'NOT_SELECTED')
    setSelectedTemplateId(defaultSelection)
    setTemplateChangeDialogOpen(true)
  }

  const handleTemplateChange = () => {
    // If nothing selected, just close the dialog without making changes
    if (!editingMassId || selectedTemplateId === 'NOT_SELECTED') {
      setTemplateChangeDialogOpen(false)
      setEditingMassId(null)
      setSelectedTemplateId('NOT_SELECTED')
      return
    }

    let newAssignments: RoleAssignment[] = []

    // If a template is selected (not REMOVE), build assignments from it
    if (selectedTemplateId !== 'REMOVE') {
      const template = roleTemplates.find(t => t.id === selectedTemplateId)
      if (!template) return

      template.items?.forEach(item => {
        if (item.mass_role) {
          for (let i = 0; i < item.count; i++) {
            newAssignments.push({
              roleId: item.mass_role.id,
              roleName: item.mass_role.name,
              personId: undefined,
              personName: undefined
            })
          }
        }
      })
    } else {
      // If selectedTemplateId === 'REMOVE', newAssignments stays as empty array
      newAssignments = []
    }

    // Update ONLY this specific mass
    const updated = proposedMasses.map(mass => {
      if (mass.id === editingMassId) {
        return {
          ...mass,
          massRoleTemplateId: selectedTemplateId === 'REMOVE' ? undefined : selectedTemplateId,
          assignments: newAssignments
        }
      }
      return mass
    })

    onProposedMassesChange(updated)
    setTemplateChangeDialogOpen(false)
    setEditingMassId(null)
    setSelectedTemplateId('NOT_SELECTED')
  }

  const getLiturgicalColorDot = (color?: string[]) => {
    if (!color || color.length === 0) return null
    return (
      <div
        className="w-3 h-3 rounded-full border border-border"
        style={{ backgroundColor: color[0] }}
        title={`Liturgical Color: ${color[0]}`}
      />
    )
  }

  const handleRefreshRecommendations = async () => {
    // For each unique day of week, apply the recommended template
    const uniqueDaysOfWeek = [...new Set(includedMasses.map(m => m.dayOfWeek))]

    let updated = [...proposedMasses]

    uniqueDaysOfWeek.forEach(dayOfWeek => {
      // Find a mass on this day to get a date for the recommendation
      const sampleMass = includedMasses.find(m => m.dayOfWeek === dayOfWeek)
      if (!sampleMass) return

      const recommendedId = getRecommendedTemplate(sampleMass.date)

      // If no recommended template, use the first available template as fallback
      const templateIdToUse = recommendedId || (roleTemplates.length > 0 ? roleTemplates[0].id : null)
      if (!templateIdToUse) return

      const template = roleTemplates.find(t => t.id === templateIdToUse)
      if (!template) return

      // Build assignments from the template
      const newAssignments: RoleAssignment[] = []
      template.items?.forEach(item => {
        if (item.mass_role) {
          for (let i = 0; i < item.count; i++) {
            newAssignments.push({
              roleId: item.mass_role.id,
              roleName: item.mass_role.name,
              personId: undefined,
              personName: undefined
            })
          }
        }
      })

      // Update all masses with this day of week
      updated = updated.map(mass => {
        if (mass.dayOfWeek === dayOfWeek && mass.isIncluded) {
          return {
            ...mass,
            massRoleTemplateId: templateIdToUse,
            assignments: newAssignments
          }
        }
        return mass
      })
    })

    // Now auto-assign people to the roles using the preview assignment algorithm
    try {
      const massesForPreview = updated
        .filter(m => m.isIncluded)
        .map(m => ({
          id: m.id,
          date: m.date,
          time: m.time,
          massTimesTemplateItemId: m.massTimesTemplateItemId,
          assignments: m.assignments || []
        }))

      const previewedAssignments = await previewMassAssignments(massesForPreview, true)

      // Merge the previewed assignments back into the updated masses
      updated = updated.map(mass => {
        const preview = previewedAssignments.find(p => p.massId === mass.id)
        if (preview) {
          return {
            ...mass,
            assignments: preview.assignments.map(a => ({
              roleId: a.roleId,
              roleName: a.roleName,
              personId: a.personId ?? undefined,
              personName: a.personName ?? undefined
            }))
          }
        }
        return mass
      })
    } catch (error) {
      console.error('Failed to preview mass assignments:', error)
      // Continue with role templates even if auto-assignment fails
    }

    onProposedMassesChange(updated)
  }

  // Auto-apply recommendations on mount if masses don't have assignments
  useEffect(() => {
    if (hasInitializedRef.current) return

    const needsInitialization = includedMasses.length > 0 &&
      includedMasses.every(m => !m.assignments || m.assignments.length === 0)

    if (needsInitialization && roleTemplates.length > 0) {
      const initialize = async () => {
        await handleRefreshRecommendations()
        hasInitializedRef.current = true
      }
      initialize()
    }
    // Only run once on mount when dependencies are first available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedMasses.length, roleTemplates.length])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <WizardStepHeader
          icon={Sparkles}
          title="Interactive Preview"
          description="Review and adjust minister assignments before creating masses"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshConfirmOpen(true)}
          className="shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Recommendations
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalMasses}</div>
              <div className="text-xs text-muted-foreground mt-1">Masses</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalRoles}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Roles</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.assignedRoles}</div>
              <div className="text-xs text-muted-foreground mt-1">Assigned</div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          stats.unassignedRoles > 0 && "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
        )}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className={cn(
                "text-3xl font-bold",
                stats.unassignedRoles > 0 && "text-orange-600 dark:text-orange-400"
              )}>
                {stats.unassignedRoles}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Unassigned</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Masses by Date */}
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {Object.entries(massesByDate).map(([date, masses]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="pb-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-primary" />
                  {formatDate(date, 'en', { includeWeekday: true })}
                </div>
              </div>

              {/* Masses for this date */}
              <div className="space-y-3 pl-4">
                {masses.map(mass => (
                  <Card key={mass.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{mass.templateName}</CardTitle>
                            {getLiturgicalColorDot(mass.liturgicalEventColor)}
                          </div>
                          {mass.liturgicalEventName && mass.liturgicalEventId && (
                            <Badge
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-accent"
                              onClick={() => handleLiturgicalEventClick(mass.liturgicalEventId!)}
                            >
                              {mass.liturgicalEventName}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenTemplateChange(mass.id)}
                          className="h-8 shrink-0"
                        >
                          <Settings className="h-3.5 w-3.5 mr-1.5" />
                          Change Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {/* Role Assignments */}
                      <div className="space-y-2">
                        {mass.assignments && mass.assignments.length > 0 ? (
                          mass.assignments.map((assignment, idx) => (
                            <div
                              key={`${assignment.roleId}-${idx}`}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-colors group",
                                assignment.personId && assignment.personName
                                  ? "bg-card hover:bg-accent/50"
                                  : "bg-red-50/30 dark:bg-red-950/10 border-red-100 dark:border-red-900/30 hover:bg-red-50/50 dark:hover:bg-red-950/15"
                              )}
                            >
                              <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {assignment.roleName}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {assignment.personId && assignment.personName ? (
                                  <>
                                    <div className="text-sm font-medium">
                                      {assignment.personName}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveAssignment(mass.id, assignment.roleId)}
                                      className="h-7 w-7 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssignPerson(mass.id, assignment.roleId)}
                                    className="h-7 text-xs"
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Assign
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No roles assigned to this mass
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Mass Assignment People Picker */}
      <MassAssignmentPeoplePicker
        open={peoplePickerOpen}
        onOpenChange={setPeoplePickerOpen}
        onSelect={handlePersonSelected}
        placeholder="Search for a minister..."
        emptyMessage="No people found. Add people in Settings > People."
        massRoleId={editingAssignment?.roleId || ''}
        massRoleName={
          editingAssignment
            ? proposedMasses
                .find(m => m.id === editingAssignment.massId)
                ?.assignments?.find(a => a.roleId === editingAssignment.roleId)?.roleName || 'Role'
            : 'Role'
        }
        massTimesTemplateItemId={
          editingAssignment
            ? proposedMasses.find(m => m.id === editingAssignment.massId)?.massTimesTemplateItemId
            : undefined
        }
        allMassRoles={
          Array.from(
            new Map(
              roleTemplates
                .flatMap(template =>
                  template.items?.map(item => item.mass_role).filter(Boolean) || []
                )
                .map(role => [role.id, { id: role.id, name: role.name }])
            ).values()
          )
        }
      />

      {/* Template Change Dialog */}
      <Dialog open={templateChangeDialogOpen} onOpenChange={setTemplateChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role Template</DialogTitle>
            <DialogDescription>
              Select a role template to apply to this mass.
              This will replace all current role assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Template</label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or remove" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMOVE" className="text-orange-600 dark:text-orange-400">
                    Remove template (clear all assignments)
                  </SelectItem>
                  {roleTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.id === recommendedTemplateId && (
                        <span className="ml-2 text-xs text-primary">✓ Recommended</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplateId === 'NOT_SELECTED' && recommendedTemplateId && (
              <div className="text-sm text-primary bg-primary/10 p-3 rounded-lg border border-primary/20">
                <strong>Recommended:</strong> Based on the liturgical events for this day, we recommend using{' '}
                <strong>{roleTemplates.find(t => t.id === recommendedTemplateId)?.name}</strong>.
              </div>
            )}
            {selectedTemplateId === 'NOT_SELECTED' && !recommendedTemplateId && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border">
                <strong>Note:</strong> Please select a template to apply or choose to remove the template.
              </div>
            )}
            {selectedTemplateId === 'REMOVE' && (
              <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900">
                <strong>Warning:</strong> This will remove all role assignments for this mass.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setTemplateChangeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTemplateChange}
                variant={selectedTemplateId === 'REMOVE' ? 'destructive' : 'default'}
              >
                {selectedTemplateId === 'REMOVE' ? 'Remove Template' : 'Apply Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Liturgical Event Preview Modal */}
      <LiturgicalEventPreview
        open={liturgicalEventPreviewOpen}
        onOpenChange={setLiturgicalEventPreviewOpen}
        event={selectedLiturgicalEvent}
      />

      {/* Refresh Recommendations Confirmation Dialog */}
      <ConfirmationDialog
        open={refreshConfirmOpen}
        onOpenChange={setRefreshConfirmOpen}
        onConfirm={handleRefreshRecommendations}
        title="Refresh Role Assignments?"
        description="This will replace all current role assignments with recommended templates based on liturgical context. Any manual assignments or person selections will be lost. Do you want to continue?"
        confirmLabel="Refresh"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  )
}

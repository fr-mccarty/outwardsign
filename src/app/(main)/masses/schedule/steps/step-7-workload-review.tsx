'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  Calendar,
  Users,
  CalendarClock,
  BookTemplate,
  AlertTriangle,
  Sparkles,
  BarChart3,
  ChevronRight,
  ArrowUpDown,
  UserCheck,
  UserX,
  UserPlus
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { ProposedMass } from './step-5-proposed-schedule'
import { MassTimesTemplate } from "@/lib/actions/mass-times-templates"
import { MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { formatDate } from "@/lib/utils/formatters"
import { getDayCount } from "@/lib/utils/date-format"
import { cn } from '@/lib/utils'
import { MassAssignmentPeoplePicker } from '@/components/mass-assignment-people-picker'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'

interface Step7WorkloadReviewProps {
  startDate: string
  endDate: string
  proposedMasses: ProposedMass[]
  massTimesTemplates: MassTimesTemplate[]
  selectedMassTimesTemplateIds: string[]
  roleTemplates: MassRoleTemplate[]
  selectedRoleTemplateIds: string[]
  onProposedMassesChange?: (masses: ProposedMass[]) => void
}

interface MinisterAssignment {
  massId: string
  massName: string
  date: string
  roleName: string
  roleId: string
}

interface MinisterSummary {
  personId: string
  personName: string
  totalAssignments: number
  roles: Map<string, { roleName: string; count: number }>
  assignments: MinisterAssignment[]
}

type SortOrder = 'most-assignments' | 'least-assignments' | 'name-asc' | 'name-desc'

export function Step7WorkloadReview({
  startDate,
  endDate,
  proposedMasses,
  massTimesTemplates,
  selectedMassTimesTemplateIds,
  roleTemplates,
  selectedRoleTemplateIds,
  onProposedMassesChange
}: Step7WorkloadReviewProps) {
  const [selectedMinister, setSelectedMinister] = useState<MinisterSummary | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('most-assignments')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<{ massId: string; roleId: string; roleName: string } | null>(null)

  const includedMasses = proposedMasses.filter(m => m.isIncluded)

  // Calculate statistics
  const stats = useMemo(() => {
    const assignments = includedMasses.flatMap(m => m.assignments || [])
    const assignedCount = assignments.filter(a => a.personId).length
    const unassignedCount = assignments.filter(a => !a.personId).length
    const uniqueMinisters = new Set(
      assignments.filter(a => a.personId).map(a => a.personId)
    ).size

    // Count by day of week
    const byDayOfWeek: Record<string, number> = {}
    includedMasses.forEach(m => {
      byDayOfWeek[m.dayOfWeek] = (byDayOfWeek[m.dayOfWeek] || 0) + 1
    })

    return {
      totalMasses: includedMasses.length,
      assignedCount,
      unassignedCount,
      uniqueMinisters,
      byDayOfWeek
    }
  }, [includedMasses])

  // Calculate minister summaries
  const { ministerSummaries, unassignedRoles } = useMemo(() => {
    const summaryMap = new Map<string, MinisterSummary>()
    const unassigned: Array<{ massId: string; massName: string; date: string; roleName: string }> = []

    includedMasses.forEach(mass => {
      mass.assignments?.forEach(assignment => {
        if (assignment.personId && assignment.personName) {
          // Add to minister summary
          let summary = summaryMap.get(assignment.personId)
          if (!summary) {
            summary = {
              personId: assignment.personId,
              personName: assignment.personName,
              totalAssignments: 0,
              roles: new Map(),
              assignments: []
            }
            summaryMap.set(assignment.personId, summary)
          }

          summary.totalAssignments++
          summary.assignments.push({
            massId: mass.id,
            massName: mass.templateName,
            date: mass.date,
            roleName: assignment.roleName,
            roleId: assignment.roleId
          })

          // Track role counts
          const roleEntry = summary.roles.get(assignment.roleId)
          if (roleEntry) {
            roleEntry.count++
          } else {
            summary.roles.set(assignment.roleId, {
              roleName: assignment.roleName,
              count: 1
            })
          }
        } else {
          // Track unassigned
          unassigned.push({
            massId: mass.id,
            massName: mass.templateName,
            date: mass.date,
            roleName: assignment.roleName
          })
        }
      })
    })

    // Convert map to array
    const summaries = Array.from(summaryMap.values())

    return {
      ministerSummaries: summaries,
      unassignedRoles: unassigned
    }
  }, [includedMasses])

  const selectedMassTimes = massTimesTemplates.filter(t =>
    selectedMassTimesTemplateIds.includes(t.id)
  )
  const selectedRoles = roleTemplates.filter(t =>
    selectedRoleTemplateIds.includes(t.id)
  )

  const hasUnassigned = stats.unassignedCount > 0

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get workload color based on relative assignment count
  const getWorkloadColor = (count: number) => {
    const maxAssignments = ministerSummaries.length > 0
      ? Math.max(...ministerSummaries.map(m => m.totalAssignments))
      : 0
    const minAssignments = ministerSummaries.length > 0
      ? Math.min(...ministerSummaries.map(m => m.totalAssignments))
      : 0

    if (maxAssignments === minAssignments) return 'bg-primary/10'
    const range = maxAssignments - minAssignments
    const relative = (count - minAssignments) / range
    if (relative > 0.75) return 'bg-red-100 dark:bg-red-950/30'
    if (relative > 0.5) return 'bg-amber-100 dark:bg-amber-950/30'
    if (relative > 0.25) return 'bg-blue-100 dark:bg-blue-950/30'
    return 'bg-green-100 dark:bg-green-950/30'
  }

  const handleMinisterClick = (minister: MinisterSummary) => {
    setSelectedMinister(minister)
    setModalOpen(true)
  }

  // Sort ministers based on selected order
  const sortedMinisters = useMemo(() => {
    return [...ministerSummaries].sort((a, b) => {
      switch (sortOrder) {
        case 'most-assignments':
          return b.totalAssignments - a.totalAssignments
        case 'least-assignments':
          return a.totalAssignments - b.totalAssignments
        case 'name-asc':
          return a.personName.localeCompare(b.personName)
        case 'name-desc':
          return b.personName.localeCompare(a.personName)
        default:
          return 0
      }
    })
  }, [ministerSummaries, sortOrder])

  // Group assignments by date for the modal
  const groupedAssignments = useMemo(() => {
    if (!selectedMinister) return {}
    return selectedMinister.assignments
      .sort((a, b) => a.date.localeCompare(b.date))
      .reduce((acc, assignment) => {
        if (!acc[assignment.date]) {
          acc[assignment.date] = []
        }
        acc[assignment.date].push(assignment)
        return acc
      }, {} as Record<string, MinisterAssignment[]>)
  }, [selectedMinister])

  const maxAssignments = ministerSummaries.length > 0
    ? Math.max(...ministerSummaries.map(m => m.totalAssignments))
    : 0

  // Handler to unassign (delete) an assignment
  const handleUnassign = (massId: string, roleId: string) => {
    if (!onProposedMassesChange) return

    const updatedMasses = proposedMasses.map(mass => {
      if (mass.id === massId) {
        return {
          ...mass,
          assignments: mass.assignments?.map(a => {
            if (a.roleId === roleId) {
              return {
                ...a,
                personId: undefined,
                personName: undefined
              }
            }
            return a
          })
        }
      }
      return mass
    })

    onProposedMassesChange(updatedMasses)
    toast.success('Assignment removed')

    // Update the selected minister if modal is open
    if (selectedMinister) {
      const updatedMass = updatedMasses.find(m => m.id === massId)
      if (updatedMass) {
        // Recalculate minister summary
        const updatedAssignments = selectedMinister.assignments.filter(a => !(a.massId === massId && a.roleId === roleId))
        setSelectedMinister({
          ...selectedMinister,
          totalAssignments: updatedAssignments.length,
          assignments: updatedAssignments
        })
      }
    }
  }

  // Handler to reassign a role
  const handleReassign = (massId: string, roleId: string, roleName: string) => {
    setEditingAssignment({ massId, roleId, roleName })
    setPickerOpen(true)
  }

  // Handler when person is selected from picker
  const handlePersonSelected = (person: Person) => {
    if (!editingAssignment || !onProposedMassesChange) return

    const updatedMasses = proposedMasses.map(mass => {
      if (mass.id === editingAssignment.massId) {
        return {
          ...mass,
          assignments: mass.assignments?.map(a => {
            if (a.roleId === editingAssignment.roleId) {
              return {
                ...a,
                personId: person.id,
                personName: `${person.first_name} ${person.last_name}`
              }
            }
            return a
          })
        }
      }
      return mass
    })

    onProposedMassesChange(updatedMasses)
    toast.success(`Assigned ${person.first_name} ${person.last_name} to ${editingAssignment.roleName}`)

    // Close picker and clear editing state
    setPickerOpen(false)
    setEditingAssignment(null)

    // Close the modal to refresh
    setModalOpen(false)
    setSelectedMinister(null)
  }

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={Sparkles}
        title="Preview & Workload Review"
        description="Review what will be created and verify workload distribution before scheduling the masses"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalMasses}</div>
              <div className="text-sm text-muted-foreground mt-1">Masses to Create</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{getDayCount(startDate, endDate)}</div>
              <div className="text-sm text-muted-foreground mt-1">Days in Range</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.uniqueMinisters}</div>
              <div className="text-sm text-muted-foreground mt-1">Ministers</div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(hasUnassigned && "bg-orange-50/30 dark:bg-orange-950/10")}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className={cn("text-3xl font-bold", hasUnassigned && "text-orange-500")}>
                {stats.assignedCount + stats.unassignedCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Roles</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Warning - Moved above Minister Assignments */}
      {hasUnassigned && (
        <Card className="border-orange-100 bg-orange-50/30 dark:border-orange-900/50 dark:bg-orange-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-foreground">{stats.unassignedCount} Roles Still Need Assignment</span>
            </CardTitle>
            <CardDescription>
              You can go back to step 6 to assign the remaining roles, or continue and assign them later.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Minister Assignments - Near top as requested */}
      {ministerSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Minister Assignments</CardTitle>
              </div>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-assignments">Most Assignments</SelectItem>
                  <SelectItem value="least-assignments">Least Assignments</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Click on a minister to view and edit their assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {sortedMinisters.map((minister) => (
                  <button
                    key={minister.personId}
                    onClick={() => handleMinisterClick(minister)}
                    className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{minister.personName}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(minister.roles.values()).map((role) => (
                            <Badge
                              key={role.roleName}
                              variant="outline"
                              className="text-xs"
                            >
                              {role.roleName}
                              {role.count > 1 && (
                                <span className="ml-1 text-muted-foreground">×{role.count}</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="secondary">
                          {minister.totalAssignments}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Date Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start:</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End:</span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Mass Times */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Mass Times Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {selectedMassTimes.map(t => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  {t.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookTemplate className="h-4 w-4 text-primary" />
              Role Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {selectedRoles.map(t => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  {t.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Assignment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total assignments:</span>
              <span className="font-medium">{stats.assignedCount}</span>
            </div>
            {hasUnassigned && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">Unassigned:</span>
                <span className="font-medium text-amber-600">{stats.unassignedCount}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Minister Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedMinister ? getInitials(selectedMinister.personName) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedMinister?.personName}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {selectedMinister?.totalAssignments} assignment{selectedMinister?.totalAssignments !== 1 ? 's' : ''}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              All scheduled assignments for this minister
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Role summary badges */}
            {selectedMinister && (
              <div className="flex flex-wrap gap-1 mb-4">
                {Array.from(selectedMinister.roles.values()).map((role) => (
                  <Badge key={role.roleName} variant="secondary">
                    {role.roleName} ×{role.count}
                  </Badge>
                ))}
              </div>
            )}

            {/* Assignments by date */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {Object.entries(groupedAssignments).map(([date, assignments]) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(date)}
                    </div>
                    <div className="ml-6 space-y-2">
                      {assignments.map((assignment, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded bg-muted/50 border"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{assignment.massName}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {assignment.roleName}
                            </Badge>
                          </div>
                          {onProposedMassesChange && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReassign(assignment.massId, assignment.roleId, assignment.roleName)}
                                title="Reassign to different person"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnassign(assignment.massId, assignment.roleId)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Remove assignment"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mass Assignment People Picker */}
      {editingAssignment && (
        <MassAssignmentPeoplePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handlePersonSelected}
          massRoleId={editingAssignment.roleId}
          massRoleName={editingAssignment.roleName}
        />
      )}
    </div>
  )
}

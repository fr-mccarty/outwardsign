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
  Users,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowUpDown
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { ProposedMass } from './step-6-proposed-schedule'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/formatters'

interface MinisterAssignment {
  massId: string
  massName: string
  date: string
  roleName: string
}

interface MinisterSummary {
  personId: string
  personName: string
  totalAssignments: number
  roles: Map<string, { roleName: string; count: number }>
  assignments: MinisterAssignment[]
}

type SortOrder = 'most-assignments' | 'least-assignments' | 'name-asc' | 'name-desc'

interface Step7AssignmentSummaryProps {
  proposedMasses: ProposedMass[]
}

export function Step7AssignmentSummary({
  proposedMasses
}: Step7AssignmentSummaryProps) {
  const [selectedMinister, setSelectedMinister] = useState<MinisterSummary | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('most-assignments')

  // Calculate minister summaries
  const { ministerSummaries, unassignedRoles, stats } = useMemo(() => {
    const summaryMap = new Map<string, MinisterSummary>()
    const unassigned: Array<{ massId: string; massName: string; date: string; roleName: string }> = []

    const includedMasses = proposedMasses.filter(m => m.isIncluded)

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
            roleName: assignment.roleName
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

    // Convert map to array (sorting applied separately based on sortOrder)
    const summaries = Array.from(summaryMap.values())

    // Calculate stats
    const totalAssignments = summaries.reduce((sum, s) => sum + s.totalAssignments, 0)
    const avgAssignments = summaries.length > 0
      ? Math.round(totalAssignments / summaries.length * 10) / 10
      : 0
    const maxAssignments = summaries.length > 0 ? summaries[0].totalAssignments : 0
    const minAssignments = summaries.length > 0 ? summaries[summaries.length - 1].totalAssignments : 0

    return {
      ministerSummaries: summaries,
      unassignedRoles: unassigned,
      stats: {
        totalMinisters: summaries.length,
        totalAssignments,
        avgAssignments,
        maxAssignments,
        minAssignments,
        unassignedCount: unassigned.length
      }
    }
  }, [proposedMasses])

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
    if (stats.maxAssignments === stats.minAssignments) return 'bg-primary/10'
    const range = stats.maxAssignments - stats.minAssignments
    const relative = (count - stats.minAssignments) / range
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

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={Users}
        title="Assignment Summary"
        description="Click on a minister to see all their assignments"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalMinisters}</div>
            <div className="text-xs text-muted-foreground">Ministers Assigned</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <div className="text-xs text-muted-foreground">Total Assignments</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.avgAssignments}</div>
            <div className="text-xs text-muted-foreground">Avg per Minister</div>
          </div>
        </Card>
        <Card className={cn("p-3", stats.unassignedCount > 0 && "bg-orange-50 dark:bg-orange-950/20")}>
          <div className="text-center">
            <div className={cn("text-2xl font-bold", stats.unassignedCount > 0 && "text-orange-600")}>
              {stats.unassignedCount}
            </div>
            <div className="text-xs text-muted-foreground">Unassigned Roles</div>
          </div>
        </Card>
      </div>

      {/* Unassigned Warning */}
      {unassignedRoles.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              {unassignedRoles.length} Unassigned Role{unassignedRoles.length !== 1 ? 's' : ''}
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-400">
              Go back to the Proposed Schedule to assign ministers to these roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[120px]">
              <div className="space-y-1">
                {unassignedRoles.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {item.roleName}
                    </Badge>
                    <span className="text-muted-foreground">
                      {item.massName} • {item.date}
                    </span>
                  </div>
                ))}
                {unassignedRoles.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    ...and {unassignedRoles.length - 10} more
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Minister List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Workload Distribution</CardTitle>
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
            Click on a minister to see their full schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedMinisters.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {sortedMinisters.map((minister) => (
                  <button
                    key={minister.personId}
                    onClick={() => handleMinisterClick(minister)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all hover:ring-2 hover:ring-primary/50",
                      getWorkloadColor(minister.totalAssignments)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {getInitials(minister.personName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{minister.personName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="ml-2">
                              {minister.totalAssignments} assignment{minister.totalAssignments !== 1 ? 's' : ''}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
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

                        {/* Visual workload bar */}
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${(minister.totalAssignments / stats.maxAssignments) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No ministers have been assigned yet</p>
              <p className="text-sm mt-2">
                Go back to the Proposed Schedule to assign ministers
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workload Legend */}
      {ministerSummaries.length > 0 && stats.maxAssignments !== stats.minAssignments && (
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-muted-foreground">Workload:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950/30 border" />
            <span className="text-muted-foreground">Light</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950/30 border" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-950/30 border" />
            <span className="text-muted-foreground">Heavy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950/30 border" />
            <span className="text-muted-foreground">Very Heavy</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to Continue</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.unassignedCount > 0
                  ? `${stats.unassignedCount} roles still need to be assigned`
                  : `${stats.totalMinisters} ministers with ${stats.totalAssignments} total assignments`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {proposedMasses.filter(m => m.isIncluded).length}
              </div>
              <div className="text-sm text-muted-foreground">Masses</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <div className="ml-6 space-y-1">
                      {assignments.map((assignment, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <span className="text-sm">{assignment.massName}</span>
                          <Badge variant="outline" className="text-xs">
                            {assignment.roleName}
                          </Badge>
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
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, UserPlus, Calendar, Clock } from 'lucide-react'
import { PeoplePicker } from '@/components/people-picker'
import { assignMinisterToRole } from '@/lib/actions/mass-scheduling'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/formatters'
import type { ScheduleMassesResult } from '@/lib/actions/mass-scheduling'

interface MassScheduleAssignmentGridProps {
  masses: ScheduleMassesResult['masses']
  onAssignmentChange?: () => void
}

export function MassScheduleAssignmentGrid({
  masses,
  onAssignmentChange
}: MassScheduleAssignmentGridProps) {
  const [selectedCell, setSelectedCell] = useState<{
    massId: string
    roleInstanceId: string
    roleName: string
  } | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [localMasses, setLocalMasses] = useState(masses)

  // Get unique roles across all masses
  const uniqueRoles = Array.from(
    new Set(
      localMasses.flatMap(mass =>
        mass.assignments.map(a => a.roleName)
      )
    )
  ).sort()

  const handleCellClick = (massId: string, roleInstanceId: string, roleName: string) => {
    setSelectedCell({ massId, roleInstanceId, roleName })
    setIsPickerOpen(true)
  }

  const handleSelectPerson = async (person: any) => {
    if (!selectedCell) return

    try {
      // Call server action to assign minister
      await assignMinisterToRole(selectedCell.roleInstanceId, person.id)

      // Update local state
      setLocalMasses(prevMasses =>
        prevMasses.map(mass =>
          mass.id === selectedCell.massId
            ? {
                ...mass,
                assignments: mass.assignments.map(assignment =>
                  assignment.roleInstanceId === selectedCell.roleInstanceId
                    ? {
                        ...assignment,
                        personId: person.id,
                        personName: `${person.first_name} ${person.last_name}`,
                        status: 'ASSIGNED' as const,
                        reason: undefined
                      }
                    : assignment
                )
              }
            : mass
        )
      )

      toast.success(`Assigned ${person.first_name} ${person.last_name} to ${selectedCell.roleName}`)
      setIsPickerOpen(false)
      setSelectedCell(null)
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error assigning minister:', error)
      toast.error('Failed to assign minister')
    }
  }

  // Get cell color based on assignment status
  const getCellColor = (status: 'ASSIGNED' | 'UNASSIGNED' | 'CONFLICT') => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'CONFLICT':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      case 'UNASSIGNED':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
    }
  }

  const getStatusColor = (status: 'ASSIGNED' | 'UNASSIGNED' | 'CONFLICT') => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-green-500 dark:bg-green-600'
      case 'CONFLICT':
        return 'bg-yellow-500 dark:bg-yellow-600'
      case 'UNASSIGNED':
        return 'bg-red-500 dark:bg-red-600'
    }
  }

  if (localMasses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No masses to display
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Unassigned</span>
          </div>
        </div>

        {/* Grid Container */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium sticky left-0 bg-muted z-10">
                    Mass
                  </th>
                  {uniqueRoles.map(role => (
                    <th key={role} className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {localMasses.map(mass => {
                  // Group assignments by role name
                  const assignmentsByRole = mass.assignments.reduce((acc, assignment) => {
                    if (!acc[assignment.roleName]) {
                      acc[assignment.roleName] = []
                    }
                    acc[assignment.roleName].push(assignment)
                    return acc
                  }, {} as Record<string, typeof mass.assignments>)

                  return (
                    <tr key={mass.id} className="hover:bg-muted">
                      {/* Mass Info Column (Sticky) */}
                      <td className="px-4 py-3 text-sm sticky left-0 bg-background border-r">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(mass.date)}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {mass.time}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {mass.language}
                          </Badge>
                        </div>
                      </td>

                      {/* Role Assignment Cells */}
                      {uniqueRoles.map(role => {
                        const roleAssignments = assignmentsByRole[role] || []

                        return (
                          <td key={role} className="px-2 py-2">
                            <div className="space-y-1">
                              {roleAssignments.length === 0 ? (
                                <div className="text-xs text-muted-foreground text-center py-2">
                                  —
                                </div>
                              ) : (
                                roleAssignments.map(assignment => (
                                  <Card
                                    key={assignment.roleInstanceId}
                                    className={`p-2 cursor-pointer transition-all hover:shadow-md ${getCellColor(
                                      assignment.status
                                    )}`}
                                    onClick={() =>
                                      handleCellClick(mass.id, assignment.roleInstanceId, role)
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                                          assignment.status
                                        )}`}
                                      />
                                      {assignment.personName ? (
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium truncate">
                                            {assignment.personName}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex-1 flex items-center gap-1 text-muted-foreground">
                                          <UserPlus className="h-3 w-3" />
                                          <span className="text-xs">Assign</span>
                                        </div>
                                      )}
                                    </div>
                                    {assignment.reason && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {assignment.reason}
                                      </div>
                                    )}
                                  </Card>
                                ))
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {localMasses.length} {localMasses.length === 1 ? 'Mass' : 'Masses'}
          </div>
          <div>
            {localMasses.reduce((sum, mass) => sum + mass.assignments.length, 0)} total role assignments
          </div>
        </div>
      </div>

      {/* People Picker Dialog */}
      <PeoplePicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleSelectPerson}
      />
    </>
  )
}

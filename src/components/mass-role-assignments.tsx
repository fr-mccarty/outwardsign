'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, X, UserCircle, AlertCircle } from "lucide-react"
import { toast } from 'sonner'
import { getMassRoles, createMassRole, deleteMassRole } from '@/lib/actions/masses'
import type { MasterEventRoleWithRelations } from '@/lib/schemas/masses'
// Note: mass-role-template-items is deprecated - using role_definitions on event_type instead
import { getTemplateItems, type MassRoleTemplateItemWithRole } from '@/lib/actions/mass-role-template-items'
import { PeoplePicker } from '@/components/people-picker'
import type { Person } from '@/lib/types'
import Link from 'next/link'

interface MassRoleAssignmentsProps {
  massId: string
  templateId?: string | null
  readOnly?: boolean
}

interface RoleWithAssignments {
  templateItem: MassRoleTemplateItemWithRole
  assignments: MasterEventRoleWithRelations[]
}

export function MassRoleAssignments({ massId, templateId, readOnly = false }: MassRoleAssignmentsProps) {
  const [templateItems, setTemplateItems] = useState<MassRoleTemplateItemWithRole[]>([])
  const [assignments, setAssignments] = useState<MasterEventRoleWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedTemplateItemId, setSelectedTemplateItemId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [massId, templateId]) // loadData is stable

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load assignments
      const assignmentsData = await getMassRoles(massId)
      setAssignments(assignmentsData)

      // Load template items if we have a template
      if (templateId) {
        const itemsData = await getTemplateItems(templateId)
        setTemplateItems(itemsData)
      }
    } catch (error) {
      console.error('Failed to load role assignments:', error)
      toast.error('Failed to load role assignments')
    } finally {
      setIsLoading(false)
    }
  }

  // Group assignments by template item
  // TODO: The new data model uses role_id instead of mass_roles_template_item_id
  const rolesWithAssignments: RoleWithAssignments[] = templateItems.map(item => ({
    templateItem: item,
    assignments: assignments.filter(a => a.role_id === item.id)
  }))

  // Calculate totals
  const totalNeeded = templateItems.reduce((sum, item) => sum + item.count, 0)
  const totalAssigned = assignments.length
  const unfilled = totalNeeded - totalAssigned

  const handleAddPerson = (templateItemId: string) => {
    setSelectedTemplateItemId(templateItemId)
    setPickerOpen(true)
  }

  const handlePersonSelected = async (person: Person) => {
    if (!selectedTemplateItemId) return

    setIsSubmitting(true)
    try {
      // TODO: This component needs refactoring for new role system (role_definitions on event_type)
      // For now, using selectedTemplateItemId as role_id (may not work correctly)
      await createMassRole({
        master_event_id: massId,
        role_id: selectedTemplateItemId!, // This was mass_roles_template_item_id in old system
        person_id: person.id,
      })
      toast.success(`${person.first_name} ${person.last_name} assigned`)
      setPickerOpen(false)
      setSelectedTemplateItemId(null)
      loadData()
    } catch (error) {
      console.error('Failed to assign person:', error)
      toast.error('Failed to assign person')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    setIsSubmitting(true)
    try {
      await deleteMassRole(assignmentId)
      toast.success('Assignment removed')
      loadData()
    } catch (error) {
      console.error('Failed to remove assignment:', error)
      toast.error('Failed to remove assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading role assignments...
        </CardContent>
      </Card>
    )
  }

  if (!templateId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No role template selected for this Mass.</p>
            <p className="text-sm mt-1">Edit the Mass to select a role template.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Role Assignments
            </CardTitle>
            <CardDescription>
              {totalAssigned} of {totalNeeded} positions filled
            </CardDescription>
          </div>
          {unfilled > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              {unfilled} unfilled
            </Badge>
          )}
          {unfilled === 0 && totalNeeded > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              All filled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rolesWithAssignments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No roles defined in the template.
          </div>
        ) : (
          rolesWithAssignments.map(({ templateItem, assignments: roleAssignments }) => {
            const needed = templateItem.count
            const assigned = roleAssignments.length
            const stillNeeded = needed - assigned

            return (
              <div key={templateItem.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{templateItem.mass_role.name}</h4>
                    {templateItem.mass_role.description && (
                      <p className="text-sm text-muted-foreground">
                        {templateItem.mass_role.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={stillNeeded > 0 ? "secondary" : "outline"}>
                      {assigned}/{needed}
                    </Badge>
                  </div>
                </div>

                {/* Assigned people */}
                {roleAssignments.length > 0 && (
                  <div className="space-y-2">
                    {roleAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          {assignment.person ? (
                            <Link
                              href={`/people/${assignment.person.id}`}
                              className="hover:underline"
                            >
                              {assignment.person.first_name} {assignment.person.last_name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </div>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add person button */}
                {!readOnly && stillNeeded > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddPerson(templateItem.id)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {templateItem.mass_role.name}
                    {stillNeeded > 1 && ` (${stillNeeded} needed)`}
                  </Button>
                )}
              </div>
            )
          })
        )}

        {/* People Picker Modal */}
        <PeoplePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handlePersonSelected}
          placeholder="Search for a person to assign..."
          emptyMessage="No people found."
        />
      </CardContent>
    </Card>
  )
}

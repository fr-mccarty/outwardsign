'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Users, AlertCircle, Loader2 } from "lucide-react"
import Link from 'next/link'
import { MassRoleWithCount } from '@/lib/actions/mass-roles'
import {
  getMassRoleAvailabilityByMassTime,
  getPeopleAvailableForMassTime,
  type MassTimeAvailability,
  type PersonAvailableForMassTime
} from '@/lib/actions/mass-role-members'
import { formatTime } from '@/lib/utils/formatters'

interface RoleAvailabilityModalProps {
  role: MassRoleWithCount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  startDate: string
  endDate: string
}

export function RoleAvailabilityModal({
  role,
  open,
  onOpenChange,
}: RoleAvailabilityModalProps) {
  const [availability, setAvailability] = useState<MassTimeAvailability[]>([])
  const [loading, setLoading] = useState(false)

  // Nested modal state
  const [selectedMassTime, setSelectedMassTime] = useState<MassTimeAvailability | null>(null)
  const [peopleModalOpen, setPeopleModalOpen] = useState(false)
  const [people, setPeople] = useState<PersonAvailableForMassTime[]>([])
  const [loadingPeople, setLoadingPeople] = useState(false)

  useEffect(() => {
    if (open && role) {
      fetchAvailability()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role]) // fetchAvailability is stable, only re-run when modal opens or role changes

  const fetchAvailability = async () => {
    if (!role) return

    setLoading(true)
    try {
      const data = await getMassRoleAvailabilityByMassTime(role.id)
      setAvailability(data)
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setAvailability([])
    } finally {
      setLoading(false)
    }
  }

  const handleMassTimeClick = async (massTime: MassTimeAvailability) => {
    if (!role) return

    setSelectedMassTime(massTime)
    setPeopleModalOpen(true)
    setLoadingPeople(true)

    try {
      const data = await getPeopleAvailableForMassTime(
        role.id,
        massTime.mass_time_template_item_id
      )
      setPeople(data)
    } catch (error) {
      console.error('Failed to fetch people:', error)
      setPeople([])
    } finally {
      setLoadingPeople(false)
    }
  }

  const formatDayOfWeek = (day: string) => {
    if (day === 'MOVABLE') return 'Various'
    return day.charAt(0) + day.slice(1).toLowerCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {role?.name}
          </DialogTitle>
          <DialogDescription>
            Available ministers by mass time
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {availability.length > 0 ? (
              <div className="space-y-2">
                {availability.map((item) => (
                  <Card
                    key={item.mass_time_template_item_id}
                    className="cursor-pointer hover:bg-accent transition-colors py-3"
                    onClick={() => handleMassTimeClick(item)}
                  >
                    <CardContent className="px-6 py-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {formatDayOfWeek(item.day_of_week)} {formatTime(item.mass_time)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.mass_time_name}
                          </div>
                        </div>
                        <div className="text-2xl font-bold">
                          {item.available_count}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No ministers have set their availability for specific mass times yet.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {role && (
                <Link href={`/mass-roles/${role.id}`}>
                  <Button>
                    Manage Role <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Nested modal for showing people */}
      <Dialog open={peopleModalOpen} onOpenChange={setPeopleModalOpen}>
        <DialogContent className="max-w-md" style={{ zIndex: 60 }}>
          <DialogHeader>
            <DialogTitle>
              {selectedMassTime && (
                <>
                  {formatDayOfWeek(selectedMassTime.day_of_week)} {formatTime(selectedMassTime.mass_time)}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Available {role?.name}s for this mass time
            </DialogDescription>
          </DialogHeader>

          {loadingPeople ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {people.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-4">
                    {people.map((person) => (
                      <Card key={person.id} className="py-3">
                        <CardContent className="px-4 py-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{person.person_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {person.membership_type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No people found for this mass time.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setPeopleModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

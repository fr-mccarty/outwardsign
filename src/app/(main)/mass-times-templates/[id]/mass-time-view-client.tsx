'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MassTimeWithRelations, deleteMassTime } from '@/lib/actions/mass-times-templates'
import {
  MassTimesTemplateItem,
  DayType,
  createTemplateItem,
  deleteTemplateItem,
} from '@/lib/actions/mass-times-template-items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ActiveInactiveBadge } from '@/components/active-inactive-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Edit, Plus, Trash2, Clock } from 'lucide-react'
import Link from 'next/link'
import { ModuleViewContainer } from '@/components/module-view-container'
import { toast } from 'sonner'
import { LITURGICAL_DAYS_OF_WEEK_LABELS, type LiturgicalDayOfWeek } from '@/lib/constants'

interface MassTimeViewClientProps {
  massTime: MassTimeWithRelations
  items: MassTimesTemplateItem[]
}

// Format time for display (e.g., "09:00:00" -> "9:00 AM")
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Format day type for display
function formatDayType(dayType: DayType): string {
  return dayType === 'DAY_BEFORE' ? 'Vigil (Day Before)' : 'Day Of'
}

export function MassTimeViewClient({ massTime, items }: MassTimeViewClientProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTime, setNewTime] = useState('09:00')
  const [newDayType, setNewDayType] = useState<DayType>('IS_DAY')

  const handleAddItem = async () => {
    setIsSubmitting(true)
    try {
      await createTemplateItem({
        mass_times_template_id: massTime.id,
        time: newTime + ':00',
        day_type: newDayType,
      })
      toast.success('Mass time added')
      setIsAddDialogOpen(false)
      setNewTime('09:00')
      setNewDayType('IS_DAY')
      router.refresh()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add mass time')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteTemplateItem(itemId, massTime.id)
      toast.success('Mass time removed')
      router.refresh()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to remove mass time')
    }
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/mass-times-templates/${massTime.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Template
        </Link>
      </Button>
    </>
  )

  // Generate details section content
  const details = (
    <>
      <div>
        <span className="font-medium">Day of Week:</span>{' '}
        {LITURGICAL_DAYS_OF_WEEK_LABELS[massTime.day_of_week as LiturgicalDayOfWeek]?.en || massTime.day_of_week}
      </div>
      <div className="pt-2 border-t">
        <span className="font-medium">Status:</span>{' '}
        <ActiveInactiveBadge isActive={massTime.is_active} />
      </div>
    </>
  )

  return (
    <ModuleViewContainer
      entity={massTime}
      entityType="Mass Times Template"
      modulePath="mass-times-templates"
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteMassTime}
    >
      <div className="space-y-6">
        {massTime.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{massTime.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Template Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mass Times</CardTitle>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Time
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No mass times added yet. Click &quot;Add Time&quot; to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 px-3 border rounded-md bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatTime(item.time)}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatDayType(item.day_type)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Time Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Mass Time</DialogTitle>
            <DialogDescription>
              Add a new mass time to this template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dayType">Day Type</Label>
              <Select value={newDayType} onValueChange={(v) => setNewDayType(v as DayType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IS_DAY">Day Of</SelectItem>
                  <SelectItem value="DAY_BEFORE">Vigil (Day Before)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select &quot;Vigil&quot; for masses that occur the evening before (e.g., Saturday evening for Sunday).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Time'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleViewContainer>
  )
}

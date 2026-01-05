'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { createMassTime } from '@/lib/actions/mass-times-templates'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'

const DAYS_OF_WEEK = [
  { value: 'SUNDAY', label: 'Sunday' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'MOVABLE', label: 'Movable Feasts' },
]

export function MassScheduleFormClient() {
  const router = useRouter()
  const t = useTranslations('massSchedules')
  const tCommon = useTranslations('common')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('SUNDAY')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error(t('nameRequired'))
      return
    }

    setSaving(true)
    try {
      const template = await createMassTime({
        name: name.trim(),
        description: description.trim() || undefined,
        day_of_week: dayOfWeek,
        is_active: true,
      })

      toast.success(t('scheduleCreated'))
      router.push(`/settings/mass-schedules/${template.id}`)
    } catch (error) {
      console.error('Failed to create schedule:', error)
      toast.error(t('scheduleCreateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <LinkButton href="/settings/mass-schedules" variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tCommon('back')}
        </LinkButton>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('scheduleDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{tCommon('name')} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
              />
            </div>

            <div>
              <Label htmlFor="day_of_week">{t('dayOfWeek')}</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">{t('descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <LinkButton href="/settings/mass-schedules" variant="outline">
                {tCommon('cancel')}
              </LinkButton>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? tCommon('saving') : t('createSchedule')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

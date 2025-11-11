'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CommonTimesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTime: (time: string) => void
}

// Common times used in Catholic liturgical services
const COMMON_TIMES = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
]

export function CommonTimesModal({
  open,
  onOpenChange,
  onSelectTime,
}: CommonTimesModalProps) {
  const handleTimeSelect = (time: string) => {
    onSelectTime(time)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Common Time</DialogTitle>
          <DialogDescription>
            Choose a common liturgical service time
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 py-4">
          {COMMON_TIMES.map((time) => (
            <Button
              key={time.value}
              type="button"
              variant="outline"
              onClick={() => handleTimeSelect(time.value)}
              className="w-full"
            >
              {time.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

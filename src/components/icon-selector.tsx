'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Heart,
  Cross,
  Droplet,
  Sparkles,
  Baby,
  Calendar,
  Church,
  Gift,
  Music,
  BookOpen,
  Users,
  Flame,
  Star,
  Sun,
  Moon,
  Bird,
  Flower,
  Crown,
  Shield,
  Bell,
  Cake,
  BookHeart,
  HandHeart,
  CalendarDays,
  VenusAndMars,
  type LucideIcon,
} from 'lucide-react'

// Curated list of icons for event types
const ICON_OPTIONS: Record<string, LucideIcon> = {
  Heart,
  Cross,
  Droplet,
  Sparkles,
  Baby,
  Calendar,
  Church,
  Gift,
  Music,
  BookOpen,
  Users,
  Flame,
  Star,
  Sun,
  Moon,
  Bird,
  Flower,
  Crown,
  Shield,
  Bell,
  Cake,
  BookHeart,
  HandHeart,
  CalendarDays,
  VenusAndMars,
}

interface IconSelectorProps {
  value: string
  onChange: (iconName: string) => void
  label?: string
  required?: boolean
}

export function IconSelector({
  value,
  onChange,
  label = 'Icon',
  required = false,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const iconNames = Object.keys(ICON_OPTIONS)
  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const SelectedIcon = ICON_OPTIONS[value] || Heart

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="icon-selector">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Button
        id="icon-selector"
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        <SelectedIcon className="h-4 w-4 mr-2" />
        {value || 'Select icon'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Icon</DialogTitle>
            <DialogDescription>
              Choose an icon to represent this event type.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
              {filteredIcons.map((iconName) => {
                const Icon = ICON_OPTIONS[iconName]
                const isSelected = iconName === value

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-lg border
                      hover:bg-accent transition-colors
                      ${isSelected ? 'bg-accent border-primary' : 'border-input'}
                    `}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs text-center truncate w-full">
                      {iconName}
                    </span>
                  </button>
                )
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No icons found matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

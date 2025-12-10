'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { LUCIDE_ICON_MAP, getLucideIcon } from '@/lib/utils/lucide-icons'
import { Search } from 'lucide-react'

// Icons organized by category for better UX
const ICON_CATEGORIES = {
  'Sacraments & Liturgy': [
    'Heart', 'Cross', 'Droplet', 'Baby', 'Flame', 'BookHeart',
    'VenusAndMars', 'HandHeartIcon', 'Church', 'Book', 'BookOpen',
  ],
  'Events & Calendar': [
    'Calendar', 'CalendarDays', 'Clock', 'Bell', 'Star', 'Gift',
    'Music', 'Award', 'Flag', 'Sparkles',
  ],
  'People & Groups': [
    'User', 'Users', 'UsersIcon', 'UserCog', 'Smile', 'MessageCircle',
  ],
  'Places & Locations': [
    'Home', 'Building', 'Map', 'MapPin', 'Globe',
  ],
  'Documents & Files': [
    'FileText', 'ClipboardList', 'Folder', 'Bookmark', 'Edit',
    'Paperclip', 'List', 'LayoutTemplate',
  ],
  'Communication': [
    'Mail', 'Phone', 'Send', 'Share', 'Video', 'Radio',
  ],
  'Nature & Weather': [
    'Sun', 'Moon', 'Cloud', 'Wind', 'Waves', 'Umbrella',
  ],
  'Other': [
    'Coffee', 'Briefcase', 'Camera', 'Package', 'Tag', 'Target',
    'ThumbsUp', 'TrendingUp', 'Zap', 'Shield', 'Key', 'Link',
  ],
}

// Flatten all icon names for search
const ALL_ICON_NAMES = Object.values(ICON_CATEGORIES).flat()

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  error?: string
}

export function IconPicker({
  value,
  onChange,
  label = 'Icon',
  required = false,
  error,
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const SelectedIcon = getLucideIcon(value)

  // Filter icons based on search
  const filteredCategories = search
    ? {
        'Search Results': ALL_ICON_NAMES.filter((name) =>
          name.toLowerCase().includes(search.toLowerCase())
        ),
      }
    : ICON_CATEGORIES

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="icon-picker">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="icon-picker"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-start gap-2',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            {value ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span>{value}</span>
              </>
            ) : (
              <span>Select an icon...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          {/* Search input */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Icon grid */}
          <div className="max-h-[300px] overflow-y-auto p-3 space-y-4">
            {Object.entries(filteredCategories).map(([category, icons]) => {
              if (icons.length === 0) return null

              return (
                <div key={category}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-6 gap-1">
                    {icons.map((iconName) => {
                      // Check if icon exists in our map
                      if (!LUCIDE_ICON_MAP[iconName]) return null

                      const Icon = getLucideIcon(iconName)
                      const isSelected = value === iconName

                      return (
                        <Button
                          key={iconName}
                          variant={isSelected ? 'secondary' : 'ghost'}
                          size="icon"
                          className={cn(
                            'h-9 w-9',
                            isSelected && 'ring-2 ring-primary'
                          )}
                          onClick={() => handleSelect(iconName)}
                          title={iconName}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {search && Object.values(filteredCategories).flat().length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No icons found for &quot;{search}&quot;
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

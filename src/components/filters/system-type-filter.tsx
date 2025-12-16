'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SYSTEM_TYPE_METADATA, SYSTEM_TYPE_VALUES, SystemType } from '@/lib/constants/system-types'
import { getLucideIcon } from '@/lib/utils/lucide-icons'

interface SystemTypeFilterProps {
  value: SystemType[]
  onChange: (value: SystemType[]) => void
}

/**
 * SystemTypeFilter - Filter component for system types
 *
 * Features:
 * - Checkbox for each system type (Mass, Special Liturgy, Sacrament, Event)
 * - Uses SYSTEM_TYPE_METADATA for labels and icons
 * - Bilingual support (currently using .en per CLAUDE.md)
 * - Toggle individual or multiple system types
 *
 * Per STYLES.md: Uses semantic color tokens and supports dark mode.
 */
export function SystemTypeFilter({ value, onChange }: SystemTypeFilterProps) {
  const handleToggle = (systemType: SystemType, checked: boolean) => {
    if (checked) {
      // Add to selected types
      onChange([...value, systemType])
    } else {
      // Remove from selected types
      onChange(value.filter(type => type !== systemType))
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">System Type</Label>
      <div className="space-y-2">
        {SYSTEM_TYPE_VALUES.map((systemType) => {
          const metadata = SYSTEM_TYPE_METADATA[systemType]
          const Icon = getLucideIcon(metadata.icon)
          const isChecked = value.includes(systemType)

          return (
            <div key={systemType} className="flex items-center space-x-2">
              <Checkbox
                id={`system-type-${systemType}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(systemType, checked === true)}
              />
              <Label
                htmlFor={`system-type-${systemType}`}
                className="flex items-center gap-2 cursor-pointer font-normal"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{metadata.name_en}</span>
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

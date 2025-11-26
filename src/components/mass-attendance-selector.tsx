"use client"

import { useState, useEffect } from "react"
import { FormInput } from "@/components/form-input"
import { getAllMassTimeOptions, type MassTimeOption } from "@/lib/helpers/mass-attendance"
import { formatTime } from "@/lib/utils/formatters"
import { LITURGICAL_DAYS_OF_WEEK_VALUES } from "@/lib/constants"

interface MassAttendanceSelectorProps {
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  disabled?: boolean
}

export function MassAttendanceSelector({
  selectedIds,
  onChange,
  disabled = false
}: MassAttendanceSelectorProps) {
  const [options, setOptions] = useState<MassTimeOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOptions() {
      try {
        const massTimeOptions = await getAllMassTimeOptions()
        setOptions(massTimeOptions)
      } catch (error) {
        console.error('Error loading mass time options:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [])

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, optionId])
    } else {
      onChange(selectedIds.filter(id => id !== optionId))
    }
  }

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading mass times...
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No mass times available. Please create mass time templates first.
      </div>
    )
  }

  // Group options by display day key (e.g., "SATURDAY", "SUNDAY")
  const groupedOptions = options.reduce((acc, option) => {
    const key = option.displayDayKey
    if (!acc[key]) {
      acc[key] = {
        displayName: option.displayDayName,
        options: []
      }
    }
    acc[key].options.push(option)
    return acc
  }, {} as Record<string, { displayName: string; options: MassTimeOption[] }>)

  // Sort groups according to liturgical day order
  const sortedDayKeys = Object.keys(groupedOptions).sort((a, b) => {
    const indexA = LITURGICAL_DAYS_OF_WEEK_VALUES.indexOf(a as any)
    const indexB = LITURGICAL_DAYS_OF_WEEK_VALUES.indexOf(b as any)

    // If day not found in order, put it at the end
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })

  return (
    <div className="space-y-4">
      {sortedDayKeys.map((dayKey) => (
        <div key={dayKey} className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">{groupedOptions[dayKey].displayName}</h4>
          <div className="space-y-2 pl-2">
            {groupedOptions[dayKey].options.map((option) => (
              <FormInput
                key={option.id}
                id={`mass-time-${option.id}`}
                inputType="checkbox"
                label={formatTime(option.time)}
                value={selectedIds.includes(option.id)}
                onChange={(checked: boolean) => handleCheckboxChange(option.id, checked)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

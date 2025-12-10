'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerField } from '@/components/date-picker-field'
import { ChevronDown } from 'lucide-react'
// MODULE_STATUS_VALUES available for status filtering
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
// toLocalDateString available for date formatting

/**
 * Advanced Search Component
 *
 * Provides a collapsible section for advanced search filters including:
 * - Status filter (optional)
 * - Sort dropdown (optional)
 * - Date range filters (optional)
 *
 * This component encapsulates the collapsible pattern used across all module list views
 * to save vertical space while providing access to complex filtering options.
 *
 * @example
 * ```tsx
 * <AdvancedSearch
 *   statusFilter={{
 *     value: selectedStatus,
 *     onChange: (value) => updateFilter('status', value),
 *     statusValues: MODULE_STATUS_VALUES
 *   }}
 *   sortFilter={{
 *     value: selectedSort,
 *     onChange: (value) => updateFilter('sort', value),
 *     sortOptions: STANDARD_SORT_OPTIONS
 *   }}
 *   dateRangeFilter={{
 *     startDate: startDate,
 *     endDate: endDate,
 *     onStartDateChange: (date) => {
 *       setStartDate(date)
 *       updateFilter('start_date', date ? toLocalDateString(date) : '')
 *     },
 *     onEndDateChange: (date) => {
 *       setEndDate(date)
 *       updateFilter('end_date', date ? toLocalDateString(date) : '')
 *     }
 *   }}
 * />
 * ```
 */

interface StatusFilterConfig {
  value: string
  onChange: (value: string) => void
  statusValues: readonly string[]
}

interface SortFilterConfig {
  value: string
  onChange: (value: string) => void
  sortOptions: readonly { value: string; label: string }[]
}

interface DateRangeFilterConfig {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
}

interface AdvancedSearchProps {
  statusFilter?: StatusFilterConfig
  sortFilter?: SortFilterConfig
  dateRangeFilter?: DateRangeFilterConfig
  defaultOpen?: boolean
}

export function AdvancedSearch({
  statusFilter,
  sortFilter,
  dateRangeFilter,
  defaultOpen = false
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Don't render if no filters are provided
  if (!statusFilter && !sortFilter && !dateRangeFilter) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 w-full justify-start px-0 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
          <span className="text-sm font-medium">Advanced</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        {/* Status Filter */}
        {statusFilter && (
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={statusFilter.value}
              onValueChange={statusFilter.onChange}
            >
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusFilter.statusValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status, 'en')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort Dropdown */}
        {sortFilter && (
          <div className="space-y-2">
            <Label htmlFor="sort-order">Sort Order</Label>
            <Select
              value={sortFilter.value}
              onValueChange={sortFilter.onChange}
            >
              <SelectTrigger id="sort-order" className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortFilter.sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range Filter */}
        {dateRangeFilter && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <DatePickerField
                id="start-date"
                label="Start Date"
                value={dateRangeFilter.startDate}
                onValueChange={dateRangeFilter.onStartDateChange}
                placeholder="Select start date"
                closeOnSelect
              />
            </div>
            <div className="flex-1">
              <DatePickerField
                id="end-date"
                label="End Date"
                value={dateRangeFilter.endDate}
                onValueChange={dateRangeFilter.onEndDateChange}
                placeholder="Select end date"
                closeOnSelect
              />
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

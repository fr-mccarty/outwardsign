'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PresentationWithNames } from '@/lib/actions/presentations'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { FormSectionCard } from "@/components/form-section-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, HandHeartIcon, Calendar, Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ListViewCard } from "@/components/list-view-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODULE_STATUS_VALUES } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { formatDatePretty, formatTime } from "@/lib/utils/formatters"

interface Stats {
  total: number
  filtered: number
}

interface PresentationsListClientProps {
  initialData: PresentationWithNames[]
  stats: Stats
}

export function PresentationsListClient({ initialData, stats }: PresentationsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const selectedStatus = searchParams.get('status') || 'all'
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const newUrl = `/presentations${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/presentations')
  }

  const hasActiveFilters = searchValue || selectedStatus !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard modulePlural="Presentations" moduleSingular="Presentation">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by child, mother, or father name..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                updateFilters('search', e.target.value)
              }}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={(value) => updateFilters('status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {MODULE_STATUS_VALUES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status, 'en')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SearchCard>

      {/* Presentations List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((presentation) => (
            <ListViewCard
              key={presentation.id}
              title="Presentation"
              editHref={`/presentations/${presentation.id}/edit`}
              viewHref={`/presentations/${presentation.id}`}
              viewButtonText="Preview"
              status={presentation.status}
              statusType="module"
              language={presentation.presentation_event?.language || undefined}
              datetime={presentation.presentation_event?.start_date ? {
                date: presentation.presentation_event.start_date,
                time: presentation.presentation_event.start_time || undefined
              } : undefined}
            >
              {presentation.is_baptized && (
                <Badge variant="secondary" className="text-xs">
                  Baptized
                </Badge>
              )}

              <div className="text-sm space-y-1">
                {presentation.child && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Child:</span> {presentation.child.first_name} {presentation.child.last_name}
                  </p>
                )}
                {presentation.mother && (
                  <p className="text-muted-foreground hidden md:block">
                    <span className="font-medium">Mother:</span> {presentation.mother.first_name} {presentation.mother.last_name}
                  </p>
                )}
                {presentation.father && (
                  <p className="text-muted-foreground hidden md:block">
                    <span className="font-medium">Father:</span> {presentation.father.first_name} {presentation.father.last_name}
                  </p>
                )}
              </div>

              {presentation.note && (
                <p className="text-sm text-muted-foreground line-clamp-2 hidden md:block">
                  {presentation.note}
                </p>
              )}
            </ListViewCard>
          ))}
        </div>
      ) : (
        <ContentCard className="text-center py-12">
          <HandHeartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters
              ? 'No presentations found'
              : 'No presentations yet'
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to find more presentations.'
              : 'Create your first presentation to start managing child presentations in your parish.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/presentations/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Presentation
              </Link>
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </ContentCard>
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <FormSectionCard title="Presentation Overview">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Presentations</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.filtered}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </div>
          </div>
        </FormSectionCard>
      )}
    </div>
  )
}

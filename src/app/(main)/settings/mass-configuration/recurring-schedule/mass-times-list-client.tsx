'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchCard } from "@/components/search-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from '@/components/ui/button'
import { Plus, Clock, Search, X } from 'lucide-react'
import Link from 'next/link'
import { ListViewCard } from '@/components/list-view-card'
// getStatusLabel available for active/inactive status display
import type { MassTimeWithRelations } from '@/lib/actions/mass-times-templates'

// Helper to convert boolean to status and get label - available for future use
// const getActiveStatusLabel = (isActive: boolean): string => {
//   const status = isActive ? 'ACTIVE' : 'INACTIVE'
//   return getStatusLabel(status, 'en')
// }

interface Stats {
  total: number
  active: number
}

interface MassTimesListClientProps {
  initialData: MassTimeWithRelations[]
  stats: Stats
}

export function MassTimesListClient({ initialData, stats }: MassTimesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const selectedActiveFilter = searchParams.get('is_active') || 'all'
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const newUrl = `/settings/mass-configuration/recurring-schedule${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/settings/mass-configuration/recurring-schedule')
  }

  const hasActiveFilters = searchValue || selectedActiveFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchCard title="Search Mass Times Templates">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or description..."
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
            <Select value={selectedActiveFilter} onValueChange={(value) => updateFilters('is_active', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </SearchCard>

      {/* Mass Times Templates Grid */}
      {initialData.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title="No Templates Found"
          description={hasActiveFilters
            ? 'Try adjusting your search filters or create a new template.'
            : 'Get started by creating your first mass times template.'}
          action={
            <Button asChild>
              <Link href="/settings/mass-configuration/recurring-schedule/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialData.map((template) => (
              <ListViewCard
                key={template.id}
                title={template.name}
                editHref={`/settings/mass-configuration/recurring-schedule/${template.id}/edit`}
                viewHref={`/settings/mass-configuration/recurring-schedule/${template.id}`}
                viewButtonText="Preview"
                status={template.is_active ? 'ACTIVE' : 'INACTIVE'}
              >
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
              </ListViewCard>
            ))}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Showing {initialData.length} of {stats.total} templates
            {stats.active < stats.total && ` • ${stats.active} active`}
          </div>
        </>
      )}
    </div>
  )
}

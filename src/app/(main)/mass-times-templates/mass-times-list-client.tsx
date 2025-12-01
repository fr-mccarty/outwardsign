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
import { ContentCard } from "@/components/content-card"
import { Button } from '@/components/ui/button'
import { Plus, Clock, Search, X } from 'lucide-react'
import Link from 'next/link'
import { ListViewCard } from '@/components/list-view-card'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times-templates'

// Helper to convert boolean to status and get label
const getActiveStatusLabel = (isActive: boolean): string => {
  const status = isActive ? 'ACTIVE' : 'INACTIVE'
  return getStatusLabel(status, 'en')
}

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
    const newUrl = `/mass-times-templates${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/mass-times-templates')
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
        <ContentCard className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
          <p className="text-muted-foreground mb-4 text-center">
            {hasActiveFilters
              ? 'Try adjusting your search filters or create a new template.'
              : 'Get started by creating your first mass times template.'}
          </p>
          <Button asChild>
            <Link href="/mass-times-templates/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Link>
          </Button>
        </ContentCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialData.map((template) => (
              <ListViewCard
                key={template.id}
                title={template.name}
                editHref={`/mass-times-templates/${template.id}/edit`}
                viewHref={`/mass-times-templates/${template.id}`}
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

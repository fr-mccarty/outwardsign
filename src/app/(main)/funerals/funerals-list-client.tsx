'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FuneralWithNames } from '@/lib/actions/funerals'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Cross, Calendar, Search, Filter, X } from "lucide-react"
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
import { formatDatePretty, formatTime } from "@/lib/utils/date-format"

interface Stats {
  total: number
  filtered: number
}

interface FuneralsListClientProps {
  initialData: FuneralWithNames[]
  stats: Stats
}

export function FuneralsListClient({ initialData, stats }: FuneralsListClientProps) {
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
    const newUrl = `/funerals${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/funerals')
  }

  const hasActiveFilters = searchValue || selectedStatus !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Search for a Funeral</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by deceased or family contact name..."
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
        </CardContent>
      </Card>

      {/* Funerals List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((funeral) => (
            <ListViewCard
              key={funeral.id}
              title="Funeral Service"
              editHref={`/funerals/${funeral.id}/edit`}
              viewHref={`/funerals/${funeral.id}`}
              viewButtonText="Preview"
              status={funeral.status}
              statusType="module"
              language={funeral.funeral_event?.language || undefined}
              datetime={funeral.funeral_event?.start_date ? {
                date: funeral.funeral_event.start_date,
                time: funeral.funeral_event.start_time || undefined
              } : undefined}
            >
              <div className="text-sm space-y-1">
                {funeral.deceased && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Deceased:</span> {funeral.deceased.first_name} {funeral.deceased.last_name}
                  </p>
                )}
                {funeral.family_contact && (
                  <p className="text-muted-foreground hidden md:block">
                    <span className="font-medium">Family Contact:</span> {funeral.family_contact.first_name} {funeral.family_contact.last_name}
                  </p>
                )}
              </div>

              {funeral.note && (
                <p className="text-sm text-muted-foreground line-clamp-2 hidden md:block">
                  {funeral.note}
                </p>
              )}
            </ListViewCard>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Cross className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No funerals found'
                : 'No funerals yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more funerals.'
                : 'Create your first funeral to start managing funeral services in your parish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/funerals/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Funeral
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funeral Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Funerals</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.filtered}</div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MassWithNames } from '@/lib/actions/masses'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Church, Calendar, Search, Filter, X, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ListViewCard } from "@/components/list-view-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MASS_STATUS_VALUES } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { formatDatePretty, formatTime } from "@/lib/utils/date-format"

interface Stats {
  total: number
  filtered: number
}

interface MassesListClientProps {
  initialData: MassWithNames[]
  stats: Stats
}

export function MassesListClient({ initialData, stats }: MassesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedSort = searchParams.get('sort') || 'date_asc'
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentLimit = parseInt(searchParams.get('limit') || '50')

  // Get today's date as default
  const today = new Date().toISOString().split('T')[0]

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [startDate, setStartDate] = useState(searchParams.get('start_date') || today)
  const [endDate, setEndDate] = useState(searchParams.get('end_date') || '')

  // Update URL with new filter values
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change (unless we're specifically updating the page)
    if (!updates.page) {
      params.set('page', '1')
    }

    const newUrl = `/masses${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters({ search: '' })
  }

  const clearFilters = () => {
    setSearchValue('')
    setStartDate(today)
    setEndDate('')
    router.push('/masses')
  }

  const hasActiveFilters = searchValue || selectedStatus !== 'all' || startDate !== today || endDate

  // Calculate pagination info
  const totalPages = Math.ceil(stats.filtered / currentLimit)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1


  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search for Masses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by presider, homilist, or event name..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  updateFilters({ search: e.target.value })
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

            {/* Date Range and Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    updateFilters({ start_date: e.target.value })
                  }}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    updateFilters({ end_date: e.target.value })
                  }}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => updateFilters({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {MASS_STATUS_VALUES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status, 'en')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={selectedSort} onValueChange={(value) => updateFilters({ sort: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_asc">Date (Earliest First)</SelectItem>
                    <SelectItem value="date_desc">Date (Latest First)</SelectItem>
                    <SelectItem value="created_desc">Recently Created</SelectItem>
                    <SelectItem value="created_asc">Oldest Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Masses List */}
      {initialData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialData.map((mass) => (
              <ListViewCard
                key={mass.id}
                title="Mass"
                editHref={`/masses/${mass.id}/edit`}
                viewHref={`/masses/${mass.id}`}
                viewButtonText="Preview"
                language={mass.event?.language || undefined}
                datetime={mass.event?.start_date ? {
                  date: mass.event.start_date,
                  time: mass.event.start_time || undefined
                } : undefined}
              >
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Presider:</span>{' '}
                    {mass.presider ? `${mass.presider.first_name} ${mass.presider.last_name}` : 'Not assigned'}
                  </p>
                  {mass.homilist && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Homilist:</span>{' '}
                      {mass.homilist.first_name} {mass.homilist.last_name}
                    </p>
                  )}
                  {mass.event?.location && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Location:</span>{' '}
                      {mass.event.location.name}
                    </p>
                  )}
                </div>

                {mass.note && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mass.note}
                  </p>
                )}
              </ListViewCard>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({stats.filtered} results)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ page: String(currentPage - 1) })}
                      disabled={!hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ page: String(currentPage + 1) })}
                      disabled={!hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No masses found'
                : 'No masses yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more masses.'
                : 'Create your first Mass to start managing Mass celebrations in your parish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/masses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Mass
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
            <CardTitle>Mass Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Masses</div>
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

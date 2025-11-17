'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { BaptismWithNames } from '@/lib/actions/baptisms'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Droplet, Calendar, Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ListViewCard } from "@/components/list-view-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS } from "@/lib/constants"
import { formatDatePretty, formatTime } from "@/lib/utils/date-format"

interface Stats {
  total: number
  filtered: number
}

interface BaptismsListClientProps {
  initialData: BaptismWithNames[]
  stats: Stats
}

export function BaptismsListClient({ initialData, stats }: BaptismsListClientProps) {
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
    const newUrl = `/baptisms${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/baptisms')
  }

  const hasActiveFilters = searchValue || selectedStatus !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Search for a Baptism</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by child name..."
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
                      {MODULE_STATUS_LABELS[status].en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Baptisms List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((baptism) => (
            <ListViewCard
              key={baptism.id}
              title="Baptism"
              editHref={`/baptisms/${baptism.id}/edit`}
              viewHref={`/baptisms/${baptism.id}`}
              viewButtonText="Preview"
              status={baptism.status}
              statusType="module"
              language={baptism.baptism_event?.language || undefined}
            >
              {baptism.baptism_event && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {baptism.baptism_event.start_date && formatDatePretty(baptism.baptism_event.start_date)}
                    {baptism.baptism_event.start_time && ` at ${formatTime(baptism.baptism_event.start_time)}`}
                  </div>
                </div>
              )}

              <div className="text-sm space-y-1">
                {baptism.child && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Child:</span> {baptism.child.first_name} {baptism.child.last_name}
                  </p>
                )}
              </div>

              {baptism.note && (
                <p className="text-sm text-muted-foreground line-clamp-2 hidden md:block">
                  {baptism.note}
                </p>
              )}
            </ListViewCard>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Droplet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No baptisms found'
                : 'No baptisms yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more baptisms.'
                : 'Create your first baptism to start managing baptism celebrations in your parish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/baptisms/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Baptism
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
            <CardTitle>Baptism Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Baptisms</div>
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

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { WeddingWithNames } from '@/lib/actions/weddings'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, VenusAndMars, Eye, Calendar, Search, Filter, Edit, FileText, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS } from "@/lib/constants"

interface Stats {
  total: number
  filtered: number
}

interface WeddingsListClientProps {
  initialData: WeddingWithNames[]
  stats: Stats
}

export function WeddingsListClient({ initialData, stats }: WeddingsListClientProps) {
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
    const newUrl = `/weddings${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/weddings')
  }

  const hasActiveFilters = searchValue || selectedStatus !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by bride or groom name..."
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

      {/* Weddings List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((wedding) => (
            <Card key={wedding.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      Wedding
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {wedding.status && (
                        <Badge variant="outline" className="text-xs">
                          {MODULE_STATUS_LABELS[wedding.status]?.en || wedding.status}
                        </Badge>
                      )}
                      {wedding.wedding_event && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {wedding.wedding_event.start_date && new Date(wedding.wedding_event.start_date).toLocaleDateString()}
                          {wedding.wedding_event.start_time && ` at ${wedding.wedding_event.start_time}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/weddings/${wedding.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  {wedding.bride && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Bride:</span> {wedding.bride.first_name} {wedding.bride.last_name}
                    </p>
                  )}
                  {wedding.groom && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Groom:</span> {wedding.groom.first_name} {wedding.groom.last_name}
                    </p>
                  )}
                  {wedding.wedding_event?.location && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Location:</span> {wedding.wedding_event.location}
                    </p>
                  )}
                </div>

                {wedding.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {wedding.notes}
                  </p>
                )}

                <div className="flex justify-end items-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/weddings/${wedding.id}`}>
                      <FileText className="h-4 w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <VenusAndMars className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No weddings found'
                : 'No weddings yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more weddings.'
                : 'Create your first wedding to start managing wedding celebrations in your parish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/weddings/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Wedding
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
            <CardTitle>Wedding Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Weddings</div>
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

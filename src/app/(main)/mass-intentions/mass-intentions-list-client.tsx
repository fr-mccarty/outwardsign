'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MassIntentionWithNames } from '@/lib/actions/mass-intentions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Heart, Search, Filter, X, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ListViewCard } from "@/components/list-view-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MASS_INTENTION_STATUS_VALUES, MASS_INTENTION_STATUS_LABELS } from "@/lib/constants"

interface Stats {
  total: number
  filtered: number
}

interface MassIntentionsListClientProps {
  initialData: MassIntentionWithNames[]
  stats: Stats
}

export function MassIntentionsListClient({ initialData, stats }: MassIntentionsListClientProps) {
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
    const newUrl = `/mass-intentions${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/mass-intentions')
  }

  const hasActiveFilters = searchValue || selectedStatus !== 'all'

  const formatStipend = (cents: number | null | undefined) => {
    if (!cents) return 'No stipend'
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'FULFILLED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or intention..."
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
                  {MASS_INTENTION_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {MASS_INTENTION_STATUS_LABELS[status].en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mass Intentions List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((intention) => (
            <ListViewCard
              key={intention.id}
              title={intention.mass_offered_for || 'No intention specified'}
              editHref={`/mass-intentions/${intention.id}/edit`}
              viewHref={`/mass-intentions/${intention.id}`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusVariant(intention.status || 'REQUESTED')} className="text-xs">
                  {MASS_INTENTION_STATUS_LABELS[intention.status as keyof typeof MASS_INTENTION_STATUS_LABELS]?.en || intention.status}
                </Badge>
                {intention.stipend_in_cents && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {formatStipend(intention.stipend_in_cents)}
                  </div>
                )}
              </div>

              <div className="text-sm space-y-1">
                {intention.requested_by && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Requested by:</span>{' '}
                    {intention.requested_by.first_name} {intention.requested_by.last_name}
                  </p>
                )}
                {intention.date_requested && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Date requested:</span>{' '}
                    {formatDate(intention.date_requested)}
                  </p>
                )}
                {intention.date_received && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Date received:</span>{' '}
                    {formatDate(intention.date_received)}
                  </p>
                )}
              </div>

              {intention.note && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {intention.note}
                </p>
              )}
            </ListViewCard>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No Mass intentions found'
                : 'No Mass intentions yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more Mass intentions.'
                : 'Create your first Mass intention to start managing Mass offerings in your parish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/mass-intentions/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Mass Intention
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
            <CardTitle>Mass Intentions Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Intentions</div>
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

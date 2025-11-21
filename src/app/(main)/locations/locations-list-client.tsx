'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Location } from '@/lib/types'
import { SearchCard } from "@/components/search-card"
import { ContentCard } from "@/components/content-card"
import { FormSectionCard } from "@/components/form-section-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Building, MapPin, Phone, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ListViewCard } from "@/components/list-view-card"

interface Stats {
  total: number
  filtered: number
}

interface LocationsListClientProps {
  initialData: Location[]
  stats: Stats
}

export function LocationsListClient({ initialData, stats }: LocationsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const searchTerm = searchParams.get('search') || ''

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/locations?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/locations')
  }

  const hasActiveFilters = searchTerm !== ''

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchCard modulePlural="Locations" moduleSingular="Location">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations by name, description, or city..."
              defaultValue={searchTerm}
              onChange={(e) => updateFilters('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </SearchCard>

      {/* Locations List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((location) => (
            <ListViewCard
              key={location.id}
              title={location.name}
              editHref={`/locations/${location.id}/edit`}
              viewHref={`/locations/${location.id}`}
            >
              {location.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {location.description}
                </p>
              )}

              <div className="text-sm space-y-1">
                {(location.street || location.city || location.state) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2">
                      {[location.street, location.city, location.state]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {location.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {location.phone_number}
                    </span>
                  </div>
                )}
              </div>
            </ListViewCard>
          ))}
        </div>
      ) : (
        <ContentCard className="text-center py-12">
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters
              ? 'No locations found'
              : 'No locations yet'
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search to find more locations.'
              : 'Create your first location to start managing parish venues.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/locations/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Location
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
        <FormSectionCard title="Location Overview">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Locations</div>
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

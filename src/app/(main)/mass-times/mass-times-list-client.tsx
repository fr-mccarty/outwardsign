'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Clock, Search, X, Filter } from 'lucide-react'
import Link from 'next/link'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'
import { getMassTypes, type MassType } from '@/lib/actions/mass-types'
import {
  LITURGICAL_LANGUAGE_VALUES,
  LITURGICAL_LANGUAGE_LABELS,
  DAYS_OF_WEEK_LABELS,
} from '@/lib/constants'
import { toast } from 'sonner'

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
  const selectedMassTypeId = searchParams.get('mass_type_id') || 'all'
  const selectedLanguage = searchParams.get('language') || 'all'
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [massTypes, setMassTypes] = useState<MassType[]>([])

  // Fetch mass types for filter dropdown
  useEffect(() => {
    const fetchMassTypes = async () => {
      try {
        const types = await getMassTypes()
        setMassTypes(types)
      } catch (error) {
        console.error('Failed to fetch mass types:', error)
        toast.error('Failed to load mass types for filters')
      }
    }
    fetchMassTypes()
  }, [])

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const newUrl = `/mass-times${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateFilters('search', '')
  }

  const clearFilters = () => {
    setSearchValue('')
    router.push('/mass-times')
  }

  const hasActiveFilters = searchValue || selectedMassTypeId !== 'all' || selectedLanguage !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Search and filter mass times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mass times..."
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
              <Select value={selectedMassTypeId} onValueChange={(value) => updateFilters('mass_type_id', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Mass Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {massTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLanguage} onValueChange={(value) => updateFilters('language', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {LITURGICAL_LANGUAGE_VALUES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {LITURGICAL_LANGUAGE_LABELS[lang].en}
                    </SelectItem>
                  ))}
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
        </CardContent>
      </Card>

      {/* Stats and Create Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {initialData.length} of {stats.total} mass times
          {stats.active < stats.total && ` • ${stats.active} active`}
        </div>
        <Button asChild>
          <Link href="/mass-times/create">
            <Plus className="h-4 w-4 mr-2" />
            New Mass Time
          </Link>
        </Button>
      </div>

      {/* Mass Times Grid */}
      {initialData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Mass Times Found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {hasActiveFilters
                ? 'Try adjusting your search filters or create a new mass time.'
                : 'Get started by creating your first mass time.'}
            </p>
            <Button asChild>
              <Link href="/mass-times/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Mass Time
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialData.map((massTime) => (
            <Link key={massTime.id} href={`/mass-times/${massTime.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">
                        {massTime.mass_type?.label_en || 'Unknown Type'}
                      </span>
                      {!massTime.active && (
                        <span className="text-xs text-muted-foreground">(Inactive)</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {massTime.schedule_items.map((item, idx) => (
                        <div key={idx}>
                          {DAYS_OF_WEEK_LABELS[item.day].en} - {item.time}
                        </div>
                      ))}
                    </div>
                    {massTime.language && (
                      <div className="text-sm">
                        Language: {LITURGICAL_LANGUAGE_LABELS[massTime.language].en}
                      </div>
                    )}
                    {massTime.special_designation && (
                      <div className="text-sm text-muted-foreground">
                        {massTime.special_designation}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Presentation } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, HandHeartIcon, Eye, Calendar, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Stats {
  total: number
  baptized: number
  unbaptized: number
  filtered: number
  englishCount: number
  spanishCount: number
}

interface PresentationsListClientProps {
  initialData: Presentation[]
  stats: Stats
}

export function PresentationsListClient({ initialData, stats }: PresentationsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const searchTerm = searchParams.get('search') || ''
  const selectedLanguage = searchParams.get('language') || 'all'
  const selectedSex = searchParams.get('child_sex') || 'all'

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/presentations?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/presentations')
  }

  const hasActiveFilters = searchTerm || selectedLanguage !== 'all' || selectedSex !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search presentations by child, mother, or father name..."
                defaultValue={searchTerm}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedLanguage} onValueChange={(value) => updateFilters('language', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSex} onValueChange={(value) => updateFilters('child_sex', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presentations List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((presentation) => (
            <Card key={presentation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {presentation.child_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {presentation.language}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {presentation.child_sex}
                      </Badge>
                      {presentation.is_baptized && (
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          Baptized
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(presentation.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/presentations/${presentation.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Mother:</span> {presentation.mother_name}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Father:</span> {presentation.father_name}
                  </p>
                  {presentation.godparents_names && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Godparents:</span> {presentation.godparents_names}
                    </p>
                  )}
                </div>

                {presentation.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {presentation.notes}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(presentation.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/presentations/${presentation.id}`}>
                      View Details
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
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Presentation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Presentations</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.baptized}</div>
                <div className="text-sm text-muted-foreground">Baptized</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.unbaptized}</div>
                <div className="text-sm text-muted-foreground">Unbaptized</div>
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

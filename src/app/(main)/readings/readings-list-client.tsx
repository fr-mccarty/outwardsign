'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Reading } from '@/lib/actions/readings'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, BookOpen, Eye, Calendar, Search, Filter } from "lucide-react"
import { READING_CATEGORY_LABELS } from "@/lib/constants"
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
  languageCount: number
  categoryCount: number
  filtered: number
  languages: string[]
  categories: string[]
}

interface ReadingsListClientProps {
  initialData: Reading[]
  stats: Stats
}

export function ReadingsListClient({ initialData, stats }: ReadingsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const searchTerm = searchParams.get('search') || ''
  const selectedLanguage = searchParams.get('language') || 'all'
  const selectedCategory = searchParams.get('category') || 'all'

  // Update URL with new filter values
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/readings?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/readings')
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ]
    return colors[Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length]
  }

  const hasActiveFilters = searchTerm || selectedLanguage !== 'all' || selectedCategory !== 'all'

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search readings by pericope, text, or lectionary ID..."
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
                  {stats.languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={(value) => updateFilters('category', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stats.categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {READING_CATEGORY_LABELS[cat]?.en || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readings List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((reading) => (
            <Card key={reading.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {reading.pericope || 'Untitled Reading'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {reading.language && (
                        <Badge variant="outline" className="text-xs">
                          {reading.language}
                        </Badge>
                      )}
                      {reading.lectionary_id && (
                        <Badge variant="secondary" className="text-xs">
                          {reading.lectionary_id}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(reading.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/readings/${reading.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {reading.categories && reading.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {reading.categories.map(category => (
                      <Badge key={category} className={getCategoryColor(category) + " text-xs"}>
                        {READING_CATEGORY_LABELS[category]?.en || category}
                      </Badge>
                    ))}
                  </div>
                )}

                {reading.text && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {reading.text}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(reading.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/readings/${reading.id}`}>
                      View Reading
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
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No readings found'
                : 'No readings yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more readings.'
                : 'Create your first reading to start building your collection of liturgical texts.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/readings/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Reading
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
            <CardTitle>Reading Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Readings</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.languageCount}</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.categoryCount}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
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

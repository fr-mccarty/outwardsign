'use client'

import { useEffect, useState } from 'react'
import type { Reading } from '@/lib/actions/readings'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Plus, BookOpen, Eye, Calendar, Search, Filter } from "lucide-react"
import { getReadings } from "@/lib/actions/readings"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "My Readings" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadReadings = async () => {
      try {
        const data = await getReadings()
        setReadings(data)
      } catch (error) {
        console.error('Failed to load readings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReadings()
  }, [])


  // Get unique languages and categories for filtering
  const languages = [...new Set(readings.map(r => r.language).filter(Boolean))] as string[]
  const allCategories = [...new Set(readings.flatMap(r => r.categories || []))]

  // Filter readings based on search and filters
  const filteredReadings = readings.filter(reading => {
    const matchesSearch = !searchTerm || 
      reading.pericope?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.lectionary_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLanguage = selectedLanguage === 'all' || reading.language === selectedLanguage
    
    const matchesCategory = selectedCategory === 'all' || 
      (reading.categories && reading.categories.includes(selectedCategory))
    
    return matchesSearch && matchesLanguage && matchesCategory
  })

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

  return (
    <PageContainer 
      title="Our Readings"
      description="Manage your collection of scripture readings and liturgical texts."
      maxWidth="7xl"
    >
      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href="/readings/create">
            <Plus className="h-4 w-4 mr-2" />
            New Reading
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search readings by pericope, text, or lectionary ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <Loading variant="skeleton-cards" />
        ) : (
          <>
        {/* Readings List */}
        {filteredReadings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReadings.map((reading) => (
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
                        {category}
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
              {searchTerm || selectedLanguage !== 'all' || selectedCategory !== 'all'
                ? 'No readings found'
                : 'No readings yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedLanguage !== 'all' || selectedCategory !== 'all'
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
              {(searchTerm || selectedLanguage !== 'all' || selectedCategory !== 'all') && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedLanguage('all')
                  setSelectedCategory('all')
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

        {/* Quick Stats */}
        {readings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reading Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{readings.length}</div>
                  <div className="text-sm text-muted-foreground">Total Readings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{languages.length}</div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{allCategories.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{filteredReadings.length}</div>
                  <div className="text-sm text-muted-foreground">Filtered Results</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
          </>
        )}
      </div>
    </PageContainer>
  )
}
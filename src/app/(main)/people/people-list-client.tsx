'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Person } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, User, Eye, Mail, Phone, MapPin, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Stats {
  total: number
  withEmail: number
  withPhone: number
  filtered: number
}

interface PeopleListClientProps {
  initialData: Person[]
  stats: Stats
}

export function PeopleListClient({ initialData, stats }: PeopleListClientProps) {
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
    router.push(`/people?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/people')
  }

  const hasActiveFilters = searchTerm

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people by name, email, or phone..."
              defaultValue={searchTerm}
              onChange={(e) => updateFilters('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* People List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {person.first_name} {person.last_name}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/people/${person.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  {person.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground line-clamp-1">{person.email}</span>
                    </div>
                  )}
                  {person.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{person.phone_number}</span>
                    </div>
                  )}
                  {(person.city || person.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground line-clamp-1">
                        {person.city}{person.city && person.state ? ', ' : ''}{person.state}
                      </span>
                    </div>
                  )}
                </div>

                {person.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {person.notes}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(person.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/people/${person.id}`}>
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
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasActiveFilters
                ? 'No people found'
                : 'No people yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search to find more people.'
                : 'Create your first person to start managing your parish directory.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/people/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Person
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
            <CardTitle>People Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total People</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.withEmail}</div>
                <div className="text-sm text-muted-foreground">With Email</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.withPhone}</div>
                <div className="text-sm text-muted-foreground">With Phone</div>
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

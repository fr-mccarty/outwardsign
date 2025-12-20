'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/content-card'
import { SearchCard } from '@/components/search-card'
import { FormSectionCard } from '@/components/form-section-card'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { Search, User, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MassRole } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import type { PersonWithMassRoles } from '@/lib/actions/mass-role-members-compat'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { useDebounce } from '@/hooks/use-debounce'

interface MassRoleMembersListClientProps {
  initialData: PersonWithMassRoles[]
  massRoles: MassRole[]
}

export function MassRoleMembersListClient({
  initialData,
  massRoles
}: MassRoleMembersListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  // Debounced search value
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  // Update URL when debounced search value changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    }
    router.push(`/settings/mass-configuration/ministry-volunteers${debouncedSearch ? `?${params.toString()}` : ''}`)
  }, [debouncedSearch, router])

  const filteredPeople = search
    ? initialData.filter(person =>
        `${person.first_name} ${person.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        person.email?.toLowerCase().includes(search.toLowerCase())
      )
    : initialData

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchCard title="Search Mass Role Directory" className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </SearchCard>

      {/* Empty state */}
      {filteredPeople.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No people found</h3>
            <p className="text-muted-foreground">
              {search
                ? 'Try adjusting your search criteria'
                : 'Get started by adding people to your parish'}
            </p>
          </div>
        </Card>
      )}

      {/* People grid */}
      {filteredPeople.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((person) => (
              <Link
                key={person.id}
                href={`/settings/mass-configuration/ministry-volunteers/${person.id}`}
              >
                <Card className="p-6 hover:bg-accent transition-colors cursor-pointer h-full">
                  <div className="space-y-3">
                    {/* Name */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold text-lg">
                          {person.first_name} {person.last_name}
                        </h3>
                      </div>
                      <User className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2 text-sm">
                      {person.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{person.email}</span>
                        </div>
                      )}
                      {person.phone_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{person.phone_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Role badges */}
                    {person.role_names.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                        {person.role_names.slice(0, 3).map((role, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {person.role_names.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{person.role_names.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <ScrollToTopButton />
        </>
      )}

      {/* Quick Stats */}
      {initialData.length > 0 && (
        <FormSectionCard title="Mass Role Members Overview">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{initialData.length}</div>
              <div className="text-sm text-muted-foreground">Total People</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{massRoles.length}</div>
              <div className="text-sm text-muted-foreground">Mass Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredPeople.length}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </div>
          </div>
        </FormSectionCard>
      )}
    </div>
  )
}

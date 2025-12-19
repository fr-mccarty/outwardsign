'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MassRoleTemplate } from '@/lib/actions/mass-role-templates'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, LayoutTemplate, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ListViewCard } from "@/components/list-view-card"

interface Stats {
  total: number
  filtered: number
}

interface MassRoleTemplatesListClientProps {
  initialData: MassRoleTemplate[]
  stats: Stats
}

export function MassRoleTemplatesListClient({ initialData, stats }: MassRoleTemplatesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current search value from URL
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  // Update URL with new search value
  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    const newUrl = `/settings/mass-configuration/role-patterns${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateSearch('')
  }

  const hasActiveFilters = searchValue !== ''

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name or description..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  updateSearch(e.target.value)
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
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearSearch}
                className="shrink-0"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {initialData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your search terms.'
                : 'Create your first Mass role template to define standard role assignments for different types of Masses.'}
            </p>
            {!hasActiveFilters && (
              <Button asChild>
                <Link href="/settings/mass-configuration/role-patterns/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialData.map((template) => (
              <ListViewCard
                key={template.id}
                title={template.name}
                editHref={`/settings/mass-configuration/role-patterns/${template.id}/edit`}
                viewHref={`/settings/mass-configuration/role-patterns/${template.id}`}
                viewButtonText="Preview"
              >
                {template.description && (
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                )}

                {template.note && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.note}
                  </p>
                )}
              </ListViewCard>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Showing {stats.filtered} of {stats.total} template{stats.total !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  )
}

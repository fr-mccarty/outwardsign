'use client'

import { useEffect, useState } from 'react'
import type { Minister } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Plus, UserCheck, Mail, Phone, Edit } from "lucide-react"
import { getMinisters } from "@/lib/actions/ministers"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function MinistersPage() {
  const [ministers, setMinisters] = useState<Minister[]>([])
  const [loading, setLoading] = useState(true)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Ministers Directory" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadMinisters = async () => {
      try {
        const data = await getMinisters()
        setMinisters(data)
      } catch (error) {
        console.error('Failed to load ministers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMinisters()
  }, [])


  return (
    <PageContainer 
      title="Ministers Directory"
      description="Manage contact information for ministers, volunteers, and key personnel."
      maxWidth="7xl"
    >
      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href="/ministers/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Minister
          </Link>
        </Button>
      </div>

      {ministers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministers.map((minister) => (
            <Card key={minister.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{minister.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {minister.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ministers/${minister.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {minister.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{minister.email}</span>
                  </div>
                )}
                {minister.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{minister.phone}</span>
                  </div>
                )}
                {minister.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {minister.notes}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${minister.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-muted-foreground">
                      {minister.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ministers/${minister.id}`}>
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
            <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No ministers added yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your ministers directory by adding contact information for key personnel.
            </p>
            <Button asChild>
              <Link href="/ministers/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Minister
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {loading && <Loading variant="skeleton-cards" />}
    </PageContainer>
  )
}
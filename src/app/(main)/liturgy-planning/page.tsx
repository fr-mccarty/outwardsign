'use client'

import { useEffect, useState } from 'react'
import type { LiturgyPlan } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Plus, ClipboardList, Calendar, Edit } from "lucide-react"
import { getLiturgyPlans } from "@/lib/actions/liturgy-planning"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function LiturgyPlanningPage() {
  const [liturgyPlans, setLiturgyPlans] = useState<LiturgyPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Liturgy Planning" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadLiturgyPlans = async () => {
      try {
        const plans = await getLiturgyPlans()
        setLiturgyPlans(plans)
      } catch (error) {
        console.error('Failed to load liturgy plans:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLiturgyPlans()
  }, [])


  const getLiturgyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mass': return 'bg-green-100 text-green-800'
      case 'wedding': return 'bg-pink-100 text-pink-800'
      case 'funeral': return 'bg-gray-100 text-gray-800'
      case 'baptism': return 'bg-blue-100 text-blue-800'
      default: return 'bg-purple-100 text-purple-800'
    }
  }

  return (
    <PageContainer
      title="Liturgy Planning"
      description="Plan complete liturgical celebrations with prayers, prefaces, and readings."
      maxWidth="7xl"
    >
      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href="/liturgy-planning/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Link>
        </Button>
      </div>

      {liturgyPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liturgyPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{plan.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getLiturgyTypeColor(plan.liturgy_type)}>
                        {plan.liturgy_type}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(plan.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/liturgy-planning/${plan.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prayers:</span>
                    <span className="ml-1 font-medium">{plan.prayers?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Readings:</span>
                    <span className="ml-1 font-medium">{plan.readings?.length || 0}</span>
                  </div>
                </div>
                
                {plan.preface && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Preface:</span>
                    <p className="line-clamp-1 mt-1">{plan.preface}</p>
                  </div>
                )}
                
                {plan.special_notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.special_notes}
                  </p>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(plan.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/liturgy-planning/${plan.id}`}>
                      View Plan
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
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No liturgy plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your liturgical celebrations with prayers, readings, and special instructions.
            </p>
            <Button asChild>
              <Link href="/liturgy-planning/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {loading && <Loading variant="skeleton-cards" />}
    </PageContainer>
  )
}
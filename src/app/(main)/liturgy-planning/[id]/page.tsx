'use client'

import { useEffect, useState } from 'react'
import type { LiturgyPlan } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { getLiturgyPlan } from "@/lib/actions/liturgy-planning"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LiturgyPlanDetailPage({ params }: PageProps) {
  const [plan, setPlan] = useState<LiturgyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [planId, setPlanId] = useState<string>('')
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const { id } = await params
        setPlanId(id)
        const planData = await getLiturgyPlan(id)
        
        if (!planData) {
          router.push('/liturgy-planning')
          return
        }

        setPlan(planData)
        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "Liturgy Planning", href: "/liturgy-planning" },
          { label: planData.title }
        ])
      } catch (error) {
        console.error('Failed to load plan:', error)
        router.push('/liturgy-planning')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [params, setBreadcrumbs, router])

  if (loading) {
    return (
      <PageContainer 
        title="Liturgy Plan"
        description="Loading liturgical plan details..."
        maxWidth="4xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <PageContainer 
      title={plan.title}
      description={`${plan.liturgy_type} - ${new Date(plan.date).toLocaleDateString()}`}
      maxWidth="4xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/liturgy-planning">
              <ArrowLeft className="h-4 w-4" />
              Back to Plans
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.title}</h1>
            <p className="text-muted-foreground">
              {new Date(plan.date).toLocaleDateString()} • {plan.liturgy_type}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/liturgy-planning/${planId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.prayers && plan.prayers.length > 0 ? (
              <ul className="space-y-2">
                {(plan.prayers as string[]).map((prayer, index) => (
                  <li key={index} className="text-sm border-l-2 border-primary/20 pl-3">
                    {prayer}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No prayers specified</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readings</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.readings && plan.readings.length > 0 ? (
              <ul className="space-y-2">
                {(plan.readings as string[]).map((reading, index) => (
                  <li key={index} className="text-sm border-l-2 border-primary/20 pl-3">
                    {reading}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No readings specified</p>
            )}
          </CardContent>
        </Card>

        {plan.preface && (
          <Card>
            <CardHeader>
              <CardTitle>Preface</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{plan.preface}</p>
            </CardContent>
          </Card>
        )}

        {plan.special_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Special Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{plan.special_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
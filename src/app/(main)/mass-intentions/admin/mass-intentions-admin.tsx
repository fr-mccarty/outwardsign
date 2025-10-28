'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageContainer } from '@/components/page-container'
import { 
  AlertTriangle,
  Clock,
  RefreshCw,
  MoreVertical,
  Edit,
  CalendarX2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Heart
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getMassIntentionsByStatus,
  rescheduleMassIntentionNextSlot,
  type MassIntentionWithDetails
} from '@/lib/actions/mass-intentions'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AdminStats {
  totalIntentions: number
  scheduledIntentions: number
  unscheduledIntentions: number
  conflictedIntentions: number
  percentageScheduled: number
}

export function MassIntentionsAdmin() {
  const [, setCurrentParish] = useState<Parish | null>(null)
  const [unscheduledIntentions, setUnscheduledIntentions] = useState<MassIntentionWithDetails[]>([])
  const [conflictedIntentions, setConflictedIntentions] = useState<MassIntentionWithDetails[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalIntentions: 0,
    scheduledIntentions: 0,
    unscheduledIntentions: 0,
    conflictedIntentions: 0,
    percentageScheduled: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Mass Intentions", href: "/mass-intentions" },
      { label: "Admin" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        await loadIntentions()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  async function loadIntentions() {
    try {
      const [scheduled, unscheduled, conflicted] = await Promise.all([
        getMassIntentionsByStatus('scheduled'),
        getMassIntentionsByStatus('unscheduled'),
        getMassIntentionsByStatus('conflicted')
      ])

      setUnscheduledIntentions(unscheduled)
      setConflictedIntentions(conflicted)

      const total = scheduled.length + unscheduled.length + conflicted.length
      setStats({
        totalIntentions: total,
        scheduledIntentions: scheduled.length,
        unscheduledIntentions: unscheduled.length,
        conflictedIntentions: conflicted.length,
        percentageScheduled: total > 0 ? Math.round((scheduled.length / total) * 100) : 0
      })
    } catch (error) {
      console.error('Error loading intentions:', error)
      toast.error('Failed to load Mass intentions')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadIntentions()
      toast.success('Data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleAutoSchedule = async (intentionId: string) => {
    try {
      setProcessingId(intentionId)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      await rescheduleMassIntentionNextSlot(intentionId, tomorrow.toISOString().split('T')[0])
      toast.success('Mass intention scheduled successfully')
      await loadIntentions()
    } catch (error) {
      console.error('Error auto-scheduling intention:', error)
      toast.error('Failed to auto-schedule Mass intention')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
  }

  const getUrgencyLevel = (dateRequested: string | null) => {
    if (!dateRequested) return 'normal'
    
    const requested = new Date(dateRequested)
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - requested.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 14) return 'urgent'
    if (daysDiff > 7) return 'high'
    return 'normal'
  }

  const getUrgencyBadge = (dateRequested: string | null) => {
    const urgency = getUrgencyLevel(dateRequested)
    
    switch (urgency) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High Priority</Badge>
      case 'normal':
        return <Badge variant="outline" className="text-xs">Normal</Badge>
    }
  }

  const renderUnscheduledRow = (intention: MassIntentionWithDetails) => (
    <TableRow key={intention.id} className={cn(
      getUrgencyLevel(intention.date_requested) === 'urgent' && "bg-red-50",
      getUrgencyLevel(intention.date_requested) === 'high' && "bg-orange-50"
    )}>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{intention.mass_offered_for}</p>
            {getUrgencyBadge(intention.date_requested)}
          </div>
          {intention.note && (
            <p className="text-sm text-muted-foreground">{intention.note}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {intention.donor_name || '-'}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p>{formatDate(intention.date_requested)}</p>
          <p className="text-xs text-muted-foreground">
            {intention.date_requested ? 
              `${Math.floor((new Date().getTime() - new Date(intention.date_requested).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
              'Unknown'
            }
          </p>
        </div>
      </TableCell>
      <TableCell>
        {formatCurrency(intention.amount_donated)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={processingId === intention.id}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/mass-intentions/edit/${intention.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit & Schedule
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAutoSchedule(intention.id)}
              disabled={processingId === intention.id}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Auto-Schedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  const renderConflictedRow = (intention: MassIntentionWithDetails) => (
    <TableRow key={intention.id} className="bg-red-50">
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium">{intention.mass_offered_for}</p>
          {intention.note && (
            <p className="text-sm text-muted-foreground">{intention.note}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {intention.donor_name || '-'}
      </TableCell>
      <TableCell>
        {intention.event_date ? (
          <div className="space-y-1">
            <p className="text-red-600">{formatDate(intention.event_date)}</p>
            <p className="text-sm text-red-500">
              {formatTime(intention.start_time)} - {intention.event_name}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">Not scheduled</span>
        )}
      </TableCell>
      <TableCell>
        {intention.celebrant_name || '-'}
      </TableCell>
      <TableCell>
        {formatCurrency(intention.amount_donated)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={processingId === intention.id}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/mass-intentions/edit/${intention.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Resolve Conflict
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAutoSchedule(intention.id)}
              disabled={processingId === intention.id}
            >
              <CalendarX2 className="h-4 w-4 mr-2" />
              Reschedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  if (loading) {
    return (
      <PageContainer
        title="Mass Intentions Admin"
        description="Manage conflicts and unscheduled Mass intentions"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading admin view...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Mass Intentions Admin"
      description="Manage conflicts and unscheduled Mass intentions"
      maxWidth="7xl"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.href = '/mass-intentions/calendar'} 
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button onClick={() => window.location.href = '/mass-intentions'}>
              <Heart className="h-4 w-4 mr-2" />
              All Intentions
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Intentions</p>
                  <p className="text-2xl font-bold">{stats.totalIntentions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">{stats.scheduledIntentions}</p>
                  <p className="text-xs text-muted-foreground">{stats.percentageScheduled}% of total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unscheduled</p>
                  <p className="text-2xl font-bold">{stats.unscheduledIntentions}</p>
                  {stats.unscheduledIntentions > 0 && (
                    <p className="text-xs text-yellow-600">Needs attention</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conflicts</p>
                  <p className="text-2xl font-bold">{stats.conflictedIntentions}</p>
                  {stats.conflictedIntentions > 0 && (
                    <p className="text-xs text-red-600">Urgent</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {stats.conflictedIntentions > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Urgent:</strong> {stats.conflictedIntentions} Mass intention{stats.conflictedIntentions > 1 ? 's have' : ' has'} scheduling conflicts that need immediate resolution.
            </AlertDescription>
          </Alert>
        )}

        {stats.unscheduledIntentions > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Action Required:</strong> {stats.unscheduledIntentions} Mass intention{stats.unscheduledIntentions > 1 ? 's are' : ' is'} waiting to be scheduled.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for Different Views */}
        <Tabs defaultValue="unscheduled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unscheduled" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Unscheduled ({stats.unscheduledIntentions})
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Conflicts ({stats.conflictedIntentions})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unscheduled" className="space-y-6">
            {unscheduledIntentions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    All Mass intentions have been scheduled.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Unscheduled Mass Intentions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These Mass intentions are waiting to be scheduled. Items marked as urgent have been waiting over 14 days.
                  </p>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Intention</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Date Requested</TableHead>
                      <TableHead>Offering</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unscheduledIntentions
                      .sort((a, b) => {
                        // Sort by urgency, then by date requested
                        const urgencyA = getUrgencyLevel(a.date_requested)
                        const urgencyB = getUrgencyLevel(b.date_requested)
                        
                        if (urgencyA !== urgencyB) {
                          const urgencyOrder = { urgent: 0, high: 1, normal: 2 }
                          return urgencyOrder[urgencyA] - urgencyOrder[urgencyB]
                        }
                        
                        const dateA = new Date(a.date_requested || 0)
                        const dateB = new Date(b.date_requested || 0)
                        return dateA.getTime() - dateB.getTime()
                      })
                      .map(renderUnscheduledRow)}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            {conflictedIntentions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Conflicts</h3>
                  <p className="text-muted-foreground">
                    All Mass intentions are properly scheduled without conflicts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Conflicted Mass Intentions
                  </CardTitle>
                  <p className="text-sm text-red-600">
                    These Mass intentions have scheduling conflicts that need immediate resolution.
                  </p>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Intention</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Conflicting Schedule</TableHead>
                      <TableHead>Celebrant</TableHead>
                      <TableHead>Offering</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflictedIntentions.map(renderConflictedRow)}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
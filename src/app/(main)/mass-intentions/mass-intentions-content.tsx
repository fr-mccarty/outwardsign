'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { PageContainer } from '@/components/page-container'
import { 
  Church, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  RefreshCw,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Printer,
  CalendarX2,
  CalendarSearch
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getMassIntentions,
  getMassIntentionsByStatus,
  deleteMassIntention,
  type MassIntentionWithDetails
} from '@/lib/actions/mass-intentions'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function MassIntentionsContent() {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [allIntentions, setAllIntentions] = useState<MassIntentionWithDetails[]>([])
  const [scheduledIntentions, setScheduledIntentions] = useState<MassIntentionWithDetails[]>([])
  const [unscheduledIntentions, setUnscheduledIntentions] = useState<MassIntentionWithDetails[]>([])
  const [conflictedIntentions, setConflictedIntentions] = useState<MassIntentionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()
  const searchParams = useSearchParams()
  console.log('searchParams:', searchParams) // Using searchParams to avoid unused variable warning

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Mass Intentions" }
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
        await loadAllIntentions()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load Mass intentions data')
    } finally {
      setLoading(false)
    }
  }

  async function loadAllIntentions() {
    try {
      const [all, scheduled, unscheduled, conflicted] = await Promise.all([
        getMassIntentions(),
        getMassIntentionsByStatus('scheduled'),
        getMassIntentionsByStatus('unscheduled'),
        getMassIntentionsByStatus('conflicted')
      ])
      
      setAllIntentions(all)
      setScheduledIntentions(scheduled)
      setUnscheduledIntentions(unscheduled)
      setConflictedIntentions(conflicted)
    } catch (error) {
      console.error('Error loading intentions:', error)
      toast.error('Failed to load Mass intentions')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadAllIntentions()
      toast.success('Data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Mass intention?')) return

    try {
      await deleteMassIntention(id)
      toast.success('Mass intention deleted successfully')
      await loadAllIntentions()
    } catch (error) {
      console.error('Error deleting Mass intention:', error)
      toast.error('Failed to delete Mass intention')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        )
      case 'unscheduled':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Unscheduled
          </Badge>
        )
      case 'conflicted':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Conflicted
          </Badge>
        )
      default:
        return null
    }
  }

  const renderIntentionRow = (intention: MassIntentionWithDetails) => (
    <TableRow key={intention.id}>
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
            <p>{formatDate(intention.event_date)}</p>
            <p className="text-sm text-muted-foreground">
              {formatTime(intention.start_time)}
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
        {getStatusBadge(intention.status)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/mass-intentions/${intention.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {intention.status === 'scheduled' && (
              <DropdownMenuItem onClick={() => window.location.href = `/mass-intentions/reschedule/${intention.id}`}>
                <CalendarX2 className="h-4 w-4 mr-2" />
                Reschedule
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => handleDelete(intention.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  if (loading) {
    return (
      <PageContainer
        title="Mass Intentions"
        description="Manage Mass intentions and offerings"
        maxWidth="6xl"
      >
        <div className="space-y-6">Loading Mass intentions...</div>
      </PageContainer>
    )
  }

  if (!currentParish) {
    return (
      <PageContainer
        title="Mass Intentions"
        description="Manage Mass intentions and offerings"
        maxWidth="6xl"
      >
        <Card>
          <CardContent className="text-center py-12">
            <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Parish Selected</h3>
            <p className="text-muted-foreground">
              Please select a parish to manage its Mass intentions.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Mass Intentions"
      description="Manage Mass intentions and offerings"
      maxWidth="6xl"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={() => window.location.href = '/mass-intentions/calendar'} 
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button 
            onClick={() => window.location.href = '/mass-intentions-print'} 
            variant="outline"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
        <Button onClick={() => window.location.href = '/mass-intentions/create'}>
          <Plus className="h-4 w-4 mr-2" />
          New Mass Intention
        </Button>
      </div>

      {conflictedIntentions.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-2">
              You have {conflictedIntentions.length} conflicted Mass intention{conflictedIntentions.length > 1 ? 's' : ''} that need to be resolved.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => {
                const tabTrigger = document.querySelector('[value="conflicted"]') as HTMLElement
                tabTrigger?.click()
              }}
            >
              View Conflicts
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Church className="h-4 w-4" />
            All ({allIntentions.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Scheduled ({scheduledIntentions.length})
          </TabsTrigger>
          <TabsTrigger value="unscheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Unscheduled ({unscheduledIntentions.length})
          </TabsTrigger>
          <TabsTrigger value="conflicted" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Conflicted ({conflictedIntentions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {allIntentions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Church className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Mass Intentions</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first Mass intention.
                </p>
                <Button onClick={() => window.location.href = '/mass-intentions/create'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mass Intention
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intention</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Celebrant</TableHead>
                    <TableHead>Offering</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allIntentions.map(renderIntentionRow)}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          {scheduledIntentions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarSearch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Scheduled Intentions</h3>
                <p className="text-muted-foreground">
                  No Mass intentions are currently scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intention</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Celebrant</TableHead>
                    <TableHead>Offering</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledIntentions.map(renderIntentionRow)}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unscheduled" className="space-y-6">
          {unscheduledIntentions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Unscheduled Intentions</h3>
                <p className="text-muted-foreground">
                  All Mass intentions have been scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  These Mass intentions need to be scheduled
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intention</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Offering</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unscheduledIntentions.map(renderIntentionRow)}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conflicted" className="space-y-6">
          {conflictedIntentions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Conflicts</h3>
                <p className="text-muted-foreground">
                  All Mass intentions are properly scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-base text-red-700">
                  These Mass intentions have scheduling conflicts
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intention</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Conflicting Date</TableHead>
                    <TableHead>Celebrant</TableHead>
                    <TableHead>Offering</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflictedIntentions.map(renderIntentionRow)}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
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
import { PageContainer } from '@/components/page-container'
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  RefreshCw,
  Calendar,
  FileText
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getAnnouncements, 
  deleteAnnouncement, 
  getAnnouncementTemplates,
  getLiturgicalEvents,
  Announcement,
  AnnouncementTemplate
} from '@/lib/actions/announcements'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { AnnouncementForm } from './announcement-form'
import { TemplateForm } from './template-form'

interface LiturgicalEvent {
  id: string
  name: string
  event_date: string
  start_time: string
}

export function AnnouncementsContent() {
  const [currentParish, setCurrentParish] = useState<Parish | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([])
  const [liturgicalEvents, setLiturgicalEvents] = useState<LiturgicalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [announcementFormOpen, setAnnouncementFormOpen] = useState(false)
  const [templateFormOpen, setTemplateFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<AnnouncementTemplate | null>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const searchParams = useSearchParams()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null)
    setAnnouncementFormOpen(true)
  }

  useEffect(() => {
    // Check if create=true is in URL params
    if (searchParams?.get('create') === 'true') {
      handleCreateAnnouncement()
    }
  }, [searchParams])

  async function loadData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        await Promise.all([
          loadAnnouncements(parish.id),
          loadTemplates(),
          loadLiturgicalEvents(parish.id)
        ])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load announcements data')
    } finally {
      setLoading(false)
    }
  }

  async function loadAnnouncements(parishId: string) {
    try {
      const result = await getAnnouncements(parishId)
      setAnnouncements(result.announcements || [])
    } catch (error) {
      console.error('Error loading announcements:', error)
      toast.error('Failed to load announcements')
    }
  }

  async function loadTemplates() {
    try {
      const result = await getAnnouncementTemplates()
      setTemplates(result.templates || [])
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    }
  }

  async function loadLiturgicalEvents(parishId: string) {
    try {
      const result = await getLiturgicalEvents(parishId)
      setLiturgicalEvents(result.events || [])
    } catch (error) {
      console.error('Error loading liturgical events:', error)
      toast.error('Failed to load liturgical events')
    }
  }

  const handleRefresh = async () => {
    if (!currentParish) return
    
    setRefreshing(true)
    try {
      await Promise.all([
        loadAnnouncements(currentParish.id),
        loadTemplates(),
        loadLiturgicalEvents(currentParish.id)
      ])
      toast.success('Data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      await deleteAnnouncement(announcementId)
      toast.success('Announcement deleted successfully')
      if (currentParish) {
        await loadAnnouncements(currentParish.id)
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAnnouncementFormOpen(true)
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setTemplateFormOpen(true)
  }

  const handleEditTemplate = (template: AnnouncementTemplate) => {
    setEditingTemplate(template)
    setTemplateFormOpen(true)
  }

  const handleAnnouncementFormSuccess = async () => {
    if (currentParish) {
      await loadAnnouncements(currentParish.id)
    }
  }

  const handleTemplateFormSuccess = async () => {
    if (currentParish) {
      await loadTemplates()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getLinkedEventName = (liturgicalEventId: string | null) => {
    if (!liturgicalEventId) return null
    const event = liturgicalEvents.find(e => e.id === liturgicalEventId)
    return event ? event.name : 'Unknown Event'
  }

  if (loading) {
    return (
      <PageContainer
        title="Announcements"
        description="Manage parish announcements and templates"
        maxWidth="6xl"
      >
        <div className="space-y-6">Loading announcements...</div>
      </PageContainer>
    )
  }

  if (!currentParish) {
    return (
      <PageContainer
        title="Announcements"
        description="Manage parish announcements and templates"
        maxWidth="6xl"
      >
        <Card>
          <CardContent className="text-center py-12">
            <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Parish Selected</h3>
            <p className="text-muted-foreground">
              Please select a parish to manage its announcements.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Announcements"
      description="Manage parish announcements and templates"
      maxWidth="6xl"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button onClick={handleCreateAnnouncement}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcements ({announcements.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-6">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Announcements</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first announcement.
                </p>
                <Button onClick={handleCreateAnnouncement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {announcements.map((announcement) => {
                const linkedEvent = getLinkedEventName(announcement.liturgical_event_id)
                
                return (
                  <Card key={announcement.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {linkedEvent && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {linkedEvent}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDate(announcement.created_at)}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {announcement.text}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAnnouncement(announcement)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Create templates to quickly generate announcements.
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-medium line-clamp-2">
                        {template.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleCreateAnnouncement}>
                            <FileText className="h-4 w-4 mr-2" />
                            Use Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {template.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(template.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnnouncementForm
        isOpen={announcementFormOpen}
        onClose={() => setAnnouncementFormOpen(false)}
        onSuccess={handleAnnouncementFormSuccess}
        announcement={editingAnnouncement}
      />

      <TemplateForm
        isOpen={templateFormOpen}
        onClose={() => setTemplateFormOpen(false)}
        onSuccess={handleTemplateFormSuccess}
        template={editingTemplate}
      />
    </PageContainer>
  )
}
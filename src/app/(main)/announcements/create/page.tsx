'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/page-container'
import { FormField } from '@/components/ui/form-field'
import { createBasicAnnouncement } from '@/lib/actions/announcements'
import { useRouter } from 'next/navigation'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => {
    // Get the next Sunday
    const today = new Date()
    const daysUntilSunday = (7 - today.getDay()) % 7
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday))
    return nextSunday.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Announcements", href: "/announcements" },
      { label: "Create Announcement" }
    ])
  }, [setBreadcrumbs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const announcement = await createBasicAnnouncement({ title, date })
      router.push(`/announcements/${announcement.id}/edit`)
    } catch (error) {
      console.error('Error creating announcement:', error)
      setError(`Failed to create announcement: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer 
      title="Create New Announcement" 
      description="Start by providing basic information. You'll configure template and content details in the next step."
      cardTitle="Announcement Details"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <FormField
                id="title"
                label="Title"
                description='A descriptive name for this announcement (e.g., "Sunday Mass - December 15, 2024")'
                value={title}
                onChange={setTitle}
                placeholder="Enter title for this announcement"
                required
              />
              <FormField
                id="date"
                label="Date"
                description="The date when this announcement will be published or used"
                inputType="date"
                value={date}
                onChange={setDate}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !date}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Continue'}
            </Button>
          </form>
    </PageContainer>
  )
}
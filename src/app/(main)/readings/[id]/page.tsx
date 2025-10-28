'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import Link from "next/link"
import { ArrowLeft, Edit, Copy, BookOpen, Trash2, Calendar } from "lucide-react"
import { getReading, deleteReading, type Reading } from "@/lib/actions/readings"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ReadingDetailPage({ params }: PageProps) {
  const [reading, setReading] = useState<Reading | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingId, setReadingId] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()
  const router = useRouter()

  useEffect(() => {
    const loadReading = async () => {
      try {
        const { id } = await params
        setReadingId(id)
        const readingData = await getReading(id)
        
        if (!readingData) {
          router.push('/readings')
          return
        }

        setReading(readingData)
        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Readings", href: "/readings" },
          { label: readingData.pericope || 'Reading' }
        ])
      } catch (error) {
        console.error('Failed to load reading:', error)
        router.push('/readings')
      } finally {
        setLoading(false)
      }
    }

    loadReading()
  }, [params, setBreadcrumbs, router])

  const handleDelete = async () => {
    if (!reading || !window.confirm('Are you sure you want to delete this reading? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteReading(reading.id)
      router.push('/readings')
    } catch (error) {
      console.error('Failed to delete reading:', error)
      alert('Failed to delete reading. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyText = () => {
    if (reading) {
      const fullText = `${reading.pericope}\n\n${reading.text}`
      navigator.clipboard.writeText(fullText)
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Reading Details"
        description="Loading reading information..."
        maxWidth="4xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  if (!reading) {
    return null
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ]
    return colors[Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length]
  }

  return (
    <PageContainer 
      title={reading.pericope || 'Reading'}
      description={reading.lectionary_id || 'Scripture reading details'}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Title and badges */}
        <div>
          <h1 className="text-3xl font-bold">{reading.pericope || 'Untitled Reading'}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {reading.language && (
              <Badge variant="outline">
                {reading.language}
              </Badge>
            )}
            {reading.lectionary_id && (
              <Badge variant="secondary">
                {reading.lectionary_id}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(reading.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCopyText}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/readings/${readingId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        {reading.categories && reading.categories.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {reading.categories.map(category => (
                  <Badge key={category} className={getCategoryColor(category)}>
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reading Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reading Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-6 rounded-lg">
              <div className="space-y-4">
                {reading.pericope && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-primary">
                      {reading.pericope}
                    </h3>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {reading.text}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Word Count
                </h4>
                <p className="text-sm">
                  {reading.text ? reading.text.split(' ').length : 0} words
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Character Count
                </h4>
                <p className="text-sm">
                  {reading.text ? reading.text.length : 0} characters
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Reading ID
                </h4>
                <p className="text-xs font-mono text-muted-foreground">
                  {reading.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageContainer>
  )
}